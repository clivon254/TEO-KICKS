import Order from "../models/orderModel.js"
import Invoice from "../models/invoiceModel.js"
import Cart from "../models/cartModel.js"
import Product from "../models/productModel.js"
import PackagingOption from "../models/packagingOptionModel.js"
import Coupon from "../models/couponModel.js"
import User from "../models/userModel.js"
import StoreConfig from "../models/storeConfigModel.js"
import bcrypt from "bcryptjs"
import { sendOrderNotification } from "../services/notificationService.js"
import { initiateStkPush } from "../services/external/darajaService.js"
import { initTransaction } from "../services/external/paystackService.js"


// Helper: generate incremental-ish numbers (placeholder; replace with robust generator)
const generateInvoiceNumber = () => `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`


export const createOrder = async (req, res, next) => {
  try {
    const io = req.app.get('io')

    const {
      customerId, // can be same as req.user.id when staff acts for self; else provided
      location,
      type,
      timing = { isScheduled: false, scheduledAt: null },
      addressId = null,
      paymentPreference,
      packagingOptionId = null,
      packagingSelections = [],
      couponCode = null,
      cartId = null,
      metadata = {}
    } = req.body || {}

    const actingUserId = req.user?._id || req.user?.id // staff user creating the order
    const ownerCustomerId = customerId || actingUserId

    // Load active cart
    const cart = cartId
      ? await Cart.findOne({ _id: cartId, userId: ownerCustomerId, status: 'active' })
      : await Cart.findOne({ userId: ownerCustomerId, status: 'active' })

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    // Map per-item packaging selections (not primary path; order-level selection preferred)
    const packagingMap = new Map()
    for (const sel of (packagingSelections || [])) {
      if (sel?.skuId && sel?.choiceId) packagingMap.set(String(sel.skuId), sel.choiceId)
    }

    // Fetch product titles for items in cart
    const productIds = Array.from(new Set((cart.items || []).map(ci => String(ci.productId))))
    const productDocs = await Product.find({ _id: { $in: productIds } }, 'title')
    const productIdToTitle = new Map(productDocs.map(p => [String(p._id), p.title]))

    // Build order items from cart (authoritative) with required title
    const items = cart.items.map((ci) => ({
      skuId: ci.skuId,
      productId: ci.productId,
      title: productIdToTitle.get(String(ci.productId)) || 'Unknown product',
      variantOptions: ci.variantOptions || {},
      quantity: ci.quantity,
      unitPrice: ci.price,
      // keep optional per-item snapshot if provided; fee is captured at order level
      packagingChoice: packagingMap.has(String(ci.skuId)) ? { id: packagingMap.get(String(ci.skuId)), name: null, fee: 0 } : undefined
    }))

    // Resolve packaging option (order-level)
    let selectedPackaging = null
    if (packagingOptionId) {
      const opt = await PackagingOption.findOne({ _id: packagingOptionId, isActive: true })
      if (opt) selectedPackaging = { id: String(opt._id), name: opt.name, price: opt.price }
    }
    if (!selectedPackaging) {
      const def = await PackagingOption.findOne({ isActive: true, isDefault: true })
      if (def) selectedPackaging = { id: String(def._id), name: def.name, price: def.price }
    }

    // Recalculate pricing
    const subtotal = items.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0)
    const packagingFee = selectedPackaging ? Number(selectedPackaging.price || 0) : 0
    const schedulingFee = timing?.isScheduled ? 0 : 0 // TODO: derive from config
    const deliveryFee = (type === 'delivery') ? 0 : 0 // TODO: compute distance-based
    // Apply coupon discount if provided
    let couponSnapshot = null
    let discounts = 0
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() })
      if (coupon) {
        // Validate against current user and subtotal
        const validation = coupon.validateCoupon(String(ownerCustomerId), subtotal)
        if (validation.isValid) {
          const discountAmount = coupon.calculateDiscount(subtotal)
          discounts = Math.max(0, Number(discountAmount) || 0)
          couponSnapshot = {
            _id: coupon._id,
            code: coupon.code,
            name: coupon.name,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: discounts
          }
        }
      }
    }
    const tax = 0 // TODO: compute from config
    const total = subtotal - discounts + packagingFee + schedulingFee + deliveryFee + tax

    // Create Order first
    const order = await Order.create({
      customerId: ownerCustomerId,
      createdBy: actingUserId,
      location,
      type,
      items,
      pricing: { subtotal, discounts, packagingFee, schedulingFee, deliveryFee, tax, total },
      timing,
      addressId: type === 'delivery' ? addressId : null,
      paymentPreference,
      status: 'PLACED',
      paymentStatus: paymentPreference?.mode === 'pay_now' ? 'PENDING' : 'UNPAID',
      metadata: {
        ...metadata,
        packaging: selectedPackaging || null,
        coupon: couponSnapshot || null
      }
    })

    // Create Invoice linked to Order
    const invoice = await Invoice.create({
      orderId: order._id,
      number: generateInvoiceNumber(),
      lineItems: [
        { label: 'Items subtotal', amount: subtotal },
        ...(packagingFee ? [{ label: `Packaging${selectedPackaging?.name ? ` - ${selectedPackaging.name}` : ''}`, amount: packagingFee }] : []),
        ...(schedulingFee ? [{ label: 'Scheduling', amount: schedulingFee }] : []),
        ...(deliveryFee ? [{ label: 'Delivery', amount: deliveryFee }] : []),
        ...(tax ? [{ label: 'Tax', amount: tax }] : [])
      ],
      subtotal,
      discounts,
      fees: packagingFee + schedulingFee + deliveryFee,
      tax,
      total,
      balanceDue: total,
      paymentStatus: 'PENDING',
      metadata: {
        coupon: couponSnapshot || null
      }
    })

    order.invoiceId = invoice._id
    await order.save()

    // Mark coupon as used (increment usage) on order creation if applied
    if (couponSnapshot) {
      try {
        const c = await Coupon.findById(couponSnapshot._id)
        if (c) await c.incrementUsage(String(ownerCustomerId))
      } catch (_) {
        // Do not block order on coupon usage write
      }
    }

    // Optionally mark cart converted
    cart.status = 'converted'
    await cart.save()

    // Emit events
    io?.emit('order.created', { orderId: order._id.toString() })
    io?.emit('invoice.created', { invoiceId: invoice._id.toString(), orderId: order._id.toString() })

    return res.status(201).json({ success: true, data: { orderId: order._id } })
  } catch (err) {
    return next(err)
  }
}


export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params
    const order = await Order.findById(id)
      .populate('invoiceId')
      .populate('receiptId')
      .populate('addressId')
      .populate({ path: 'customerId', select: 'name email phone' })
      .populate({ path: 'items.productId', select: 'title primaryImage images basePrice' })

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    return res.json({ success: true, data: { order } })
  } catch (err) {
    return next(err)
  }
}


export const updateOrderStatus = async (req, res, next) => {
  try {
    const io = req.app.get('io')
    const { id } = req.params
    const { status } = req.body

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    io?.to(`order_${order._id}`).emit('order.updated', { orderId: order._id.toString(), status: order.status })
    return res.json({ success: true })
  } catch (err) {
    return next(err)
  }
}


export const assignRider = async (req, res, next) => {
  try {
    // Placeholder; real implementation will create/update Delivery doc
    return res.json({ success: true })
  } catch (err) {
    return next(err)
  }
}


export const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      type,
      location,
      q
    } = req.query || {}

    const filters = {}
    if (status) filters.status = status
    if (paymentStatus) filters.paymentStatus = paymentStatus
    if (type) filters.type = type
    if (location) filters.location = location

    // Basic text search over item titles via aggregation
    const skip = (Number(page) - 1) * Number(limit)

    const pipeline = [
      { $match: filters },
      // Join invoice and customer first
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoiceId',
          foreignField: '_id',
          as: 'invoice'
        }
      },
      { $unwind: { path: '$invoice', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      // Search by invoice number only
      ...(q ? [{ $match: { 'invoice.number': { $regex: q, $options: 'i' } } }] : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: Number(limit) },
            {
              $project: {
                _id: 1,
                createdAt: 1,
                status: 1,
                paymentStatus: 1,
                pricing: 1,
                invoice: { _id: '$invoice._id', number: '$invoice.number' },
                customer: { _id: '$customer._id', name: '$customer.name', email: '$customer.email' }
              }
            }
          ],
          meta: [ { $count: 'total' } ]
        }
      }
    ]

    const result = await Order.aggregate(pipeline)
    const data = result[0]?.data || []
    const total = result[0]?.meta?.[0]?.total || 0

    return res.json({
      success: true,
      data: {
        orders: data,
        pagination: {
          currentPage: Number(page),
          pageSize: Number(limit),
          totalItems: total,
          totalPages: Math.max(1, Math.ceil(total / Number(limit)))
        }
      }
    })
  } catch (err) {
    return next(err)
  }
}


export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params
    const order = await Order.findByIdAndDelete(id)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    return res.json({ success: true })
  } catch (err) {
    return next(err)
  }
}


// ==================== ADMIN ORDER FUNCTIONS ====================

/**
 * Create order for customer (admin-initiated)
 */
export const createAdminOrder = async (req, res, next) => {
  try {
    const io = req.app.get('io')

    const {
      customerType, // 'registered' | 'guest' | 'anonymous'
      customerInfo, // For guest/anonymous customers
      customerId, // For registered customers
      items,
      deliveryDetails,
      paymentPreference,
      packagingOptionId,
      couponCode,
      metadata = {}
    } = req.body

    const adminUserId = req.user?._id || req.user?.id

    // Step 1: Determine and prepare customer
    const customerResult = await prepareCustomerForOrder({
      customerType,
      customerInfo,
      customerId,
      adminUserId
    })

    // Step 2: Validate and prepare order items
    const orderItems = await prepareOrderItems(items)

    // Step 3: Calculate pricing and apply discounts
    const pricingResult = await calculateOrderPricing({
      items: orderItems,
      couponCode,
      packagingOptionId,
      deliveryDetails
    })

    // Step 4: Create order record
    const order = await createOrderRecord({
      customerId: customerResult.customerId,
      customerType,
      items: orderItems,
      pricing: pricingResult,
      deliveryDetails,
      paymentPreference,
      adminUserId,
      metadata
    })

    // Step 5: Handle payment initiation based on method
    const paymentResult = await initiateAdminPayment({
      order,
      paymentPreference,
      customerInfo: customerResult.customerInfo
    })

    // Step 6: Send notifications
    await sendOrderNotifications({
      order,
      customerInfo: customerResult.customerInfo,
      paymentResult
    })
    
    return res.status(201).json({ 
      success: true, 
      data: { 
        orderId: order._id,
        customerId: customerResult.customerId,
        customerType,
        paymentResult,
        orderNumber: order.orderNumber
      }
    })

  } catch (err) {
    return next(err)
  }
}

/**
 * Get all orders with enhanced filtering (customer + admin created)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      customerType,
      createdBy, // 'customer' | 'admin' | 'all'
      dateFrom,
      dateTo,
      search
    } = req.query

    const filter = {}

    // Apply filters
    if (status) filter.status = status
    if (customerType) filter.customerType = customerType
    if (createdBy && createdBy !== 'all') {
      if (createdBy === 'admin') {
        filter.isAdminCreated = true
      } else if (createdBy === 'customer') {
        filter.isAdminCreated = { $ne: true }
      }
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }

    // Search by order number or customer name
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'guestCustomerInfo.name': { $regex: search, $options: 'i' } }
      ]
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Order.countDocuments(filter)

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (err) {
    return next(err)
  }
}

/**
 * Get unified order statistics (all orders with breakdown by creation method)
 */
export const getOrderStats = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          customerOrders: {
            $sum: { $cond: [{ $ne: ['$isAdminCreated', true] }, 1, 0] }
          },
          adminOrders: {
            $sum: { $cond: [{ $eq: ['$isAdminCreated', true] }, 1, 0] }
          },
          registeredCustomers: {
            $sum: { $cond: [{ $eq: ['$customerType', 'registered'] }, 1, 0] }
          },
          guestCustomers: {
            $sum: { $cond: [{ $eq: ['$customerType', 'guest'] }, 1, 0] }
          },
          anonymousCustomers: {
            $sum: { $cond: [{ $eq: ['$customerType', 'anonymous'] }, 1, 0] }
          }
        }
      }
    ])

    const result = stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      customerOrders: 0,
      adminOrders: 0,
      registeredCustomers: 0,
      guestCustomers: 0,
      anonymousCustomers: 0
    }

    return res.json({
      success: true,
      data: {
        period,
        ...result,
        creationMethodBreakdown: {
          customer: result.customerOrders,
          admin: result.adminOrders
        },
        customerTypeBreakdown: {
          registered: result.registeredCustomers,
          guest: result.guestCustomers,
          anonymous: result.anonymousCustomers
        }
      }
    })

  } catch (err) {
    return next(err)
  }
}

/**
 * Convert guest customer to registered
 */
export const convertGuestToRegistered = async (req, res, next) => {
  try {
    const { guestCustomerId, registrationData } = req.body

    const guestCustomer = await User.findById(guestCustomerId)
    if (!guestCustomer || !guestCustomer.isGuest) {
      throw new Error('Guest customer not found')
    }

    // Update customer with registration data
    guestCustomer.name = registrationData.name
    guestCustomer.email = registrationData.email
    guestCustomer.phone = registrationData.phone
    guestCustomer.password = await bcrypt.hash(registrationData.password, 10)
    guestCustomer.isGuest = false
    guestCustomer.isActive = true
    guestCustomer.conversionDate = new Date()

    await guestCustomer.save()

    // Link all guest orders to registered customer
    await Order.updateMany(
      { customerId: guestCustomerId },
      { 
        customerId: guestCustomerId, 
        isGuestOrder: false,
        customerType: 'registered'
      }
    )

    return res.json({
      success: true,
      data: {
        customerId: guestCustomer._id,
        message: 'Guest customer converted to registered successfully'
      }
    })

  } catch (err) {
    return next(err)
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Prepare customer for order creation
 */
const prepareCustomerForOrder = async ({ customerType, customerInfo, customerId, adminUserId }) => {
  switch (customerType) {
    case 'registered':
      return await handleRegisteredCustomer(customerId, adminUserId)
    
    case 'guest':
      return await handleGuestCustomer(customerInfo)
    
    case 'anonymous':
      return await handleAnonymousCustomer()
    
    default:
      throw new Error('Invalid customer type')
  }
}

/**
 * Handle registered customer selection
 */
const handleRegisteredCustomer = async (customerId, adminUserId) => {
  // Verify customer exists and is active
  const customer = await User.findById(customerId)
  if (!customer || !customer.isActive) {
    throw new Error('Customer not found or inactive')
  }

  // Verify customer is not the admin creating the order
  if (String(customerId) === String(adminUserId)) {
    throw new Error('Cannot create order for yourself')
  }

  return {
    customerId: customer._id,
    customerInfo: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    }
  }
}

/**
 * Handle guest customer creation/selection
 */
const handleGuestCustomer = async (customerInfo) => {
  // Try to find existing guest by phone
  if (customerInfo.phone) {
    let guestCustomer = await User.findOne({ 
      phone: customerInfo.phone, 
      isGuest: true 
    })
    
    if (guestCustomer) {
      // Update existing guest with new information
      guestCustomer.name = customerInfo.name || guestCustomer.name
      guestCustomer.email = customerInfo.email || guestCustomer.email
      await guestCustomer.save()

      return {
        customerId: guestCustomer._id,
        customerInfo: {
          name: guestCustomer.name,
          email: guestCustomer.email,
          phone: guestCustomer.phone
        }
      }
    }
  }
  
  // Create new guest customer
  const guestCustomer = await User.create({
    name: customerInfo.name || 'Guest Customer',
    phone: customerInfo.phone || null,
    email: customerInfo.email || null,
    role: 'customer',
    isGuest: true,
    isActive: true
  })
  
  return {
    customerId: guestCustomer._id,
    customerInfo: {
      name: guestCustomer.name,
      email: guestCustomer.email,
      phone: guestCustomer.phone
    }
  }
}

/**
 * Handle anonymous customer
 */
const handleAnonymousCustomer = async () => {
  // Create minimal anonymous customer record
  const anonymousCustomer = await User.create({
    name: 'Anonymous Customer',
    phone: null,
    email: null,
    role: 'customer',
    isGuest: true,
    isAnonymous: true,
    isActive: true
  })

  return {
    customerId: anonymousCustomer._id,
    customerInfo: {
      name: 'Anonymous Customer',
      email: null,
      phone: null
    }
  }
}

/**
 * Prepare and validate order items
 */
const prepareOrderItems = async (items) => {
  const orderItems = []

  for (const item of items) {
    // Validate product exists and is active
    const product = await Product.findById(item.productId)
    if (!product || !product.isActive) {
      throw new Error(`Product ${item.productId} not found or inactive`)
    }

    // Validate SKU if provided
    if (item.skuId) {
      const sku = product.skus.find(s => s._id.toString() === item.skuId)
      if (!sku) {
        throw new Error(`SKU ${item.skuId} not found for product ${product.name}`)
      }

      // Check stock availability
      if (sku.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} - ${sku.attributesString}`)
      }
    }

    // Calculate item pricing
    const itemPrice = item.skuId 
      ? product.skus.find(s => s._id.toString() === item.skuId).price
      : product.price

    orderItems.push({
      productId: item.productId,
      skuId: item.skuId,
      variantOptions: item.variantOptions || {},
      quantity: item.quantity,
      price: itemPrice,
      total: itemPrice * item.quantity
    })
  }

  return orderItems
}

/**
 * Calculate order pricing with discounts
 */
const calculateOrderPricing = async ({ items, couponCode, packagingOptionId, deliveryDetails }) => {
  let subtotal = items.reduce((sum, item) => sum + item.total, 0)
  let discount = 0
  let coupon = null

  // Apply coupon if provided
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode, isActive: true })
    if (coupon) {
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100
      } else {
        discount = coupon.value
      }
      discount = Math.min(discount, subtotal) // Don't exceed subtotal
    }
  }

  // Calculate packaging cost
  let packagingCost = 0
  if (packagingOptionId) {
    const packaging = await PackagingOption.findById(packagingOptionId)
    if (packaging) {
      packagingCost = packaging.fee
    }
  }

  // Calculate delivery cost
  let deliveryCost = 0
  if (deliveryDetails.method === 'delivery' && deliveryDetails.distance) {
    // Use store configuration for delivery fee per km
    const storeConfig = await StoreConfig.findOne()
    if (storeConfig?.delivery?.feePerKm) {
      deliveryCost = deliveryDetails.distance * storeConfig.delivery.feePerKm
    }
  }

  const total = subtotal - discount + packagingCost + deliveryCost

  return {
    subtotal,
    discount,
    packagingCost,
    deliveryCost,
    total,
    coupon
  }
}

/**
 * Create order record in database
 */
const createOrderRecord = async ({ customerId, customerType, items, pricing, deliveryDetails, paymentPreference, adminUserId, metadata }) => {
  const order = await Order.create({
    customerId,
    customerType,
    isGuestOrder: customerType !== 'registered',
    guestCustomerInfo: customerType !== 'registered' ? {
      name: metadata.customerName,
      phone: metadata.customerPhone,
      email: metadata.customerEmail
    } : undefined,
    items,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    packagingCost: pricing.packagingCost,
    deliveryCost: pricing.deliveryCost,
    total: pricing.total,
    status: 'placed',
    paymentStatus: 'pending',
    deliveryMethod: deliveryDetails.method,
    addressId: deliveryDetails.addressId,
    timing: deliveryDetails.timing,
    paymentPreference,
    createdBy: adminUserId,
    isAdminCreated: true,
    metadata
  })

  return order
}

/**
 * Initiate payment based on method
 */
const initiateAdminPayment = async ({ order, paymentPreference, customerInfo }) => {
  const { mode, method } = paymentPreference

  if (mode === 'post_to_bill') {
    // No payment initiation needed
    return { method: 'post_to_bill', status: 'pending' }
  }

  if (mode === 'cash') {
    // No payment initiation needed
    return { method: 'cash', status: 'pending' }
  }

  if (mode === 'pay_now') {
    if (method === 'mpesa_stk') {
      const result = await initiateStkPush({
        amount: order.total,
        phone: customerInfo.phone,
        accountReference: order.orderNumber
      })
      return { method: 'mpesa_stk', status: 'pending', ...result }
    }
    
    if (method === 'paystack') {
      const callbackUrl = `${process.env.API_BASE_URL}/api/payments/webhooks/paystack`
      const result = await initTransaction({
        amount: order.total,
        email: customerInfo.email,
        reference: order.orderNumber,
        callbackUrl
      })
      return { method: 'paystack', status: 'pending', ...result }
    }
  }

  throw new Error('Invalid payment method')
}

/**
 * Send order notifications
 */
const sendOrderNotifications = async ({ order, customerInfo, paymentResult }) => {
  // Send order notification (SMS and email)
  if (customerInfo.phone || customerInfo.email) {
    await sendOrderNotification(
      customerInfo.phone,
      order.orderNumber,
      'placed',
      customerInfo.name
    )
  }
}

