# Admin Order Creation Strategy

## Overview

This document outlines the comprehensive strategy for implementing admin-assisted order creation in the TEO KICKS platform, including support for multiple customers simultaneously and anonymous/guest customers.

---

## 🎯 Core Requirements

### **Primary Goals**
1. **Admin Order Creation**: Staff can create orders for customers directly
2. **Multi-Customer Support**: Handle multiple customer orders simultaneously
3. **Guest Customer Support**: Create orders for customers without accounts
4. **Seamless Integration**: Reuse existing payment and order flows

### **Key Scenarios**
- Admin taking orders for multiple customers at the same time
- Walk-in customers who don't want to create accounts
- Phone orders for customers who prefer not to register
- Event/party orders for multiple guests
- Quick orders for repeat customers

---

## 🏗️ Architecture Strategy

### **1. Multi-Draft Order Management**

#### **Approach: Session-Based Draft Orders**
```
Draft Order System:
├── Each draft gets unique session ID (draft_ABC123)
├── Multiple drafts stored in localStorage
├── Active draft tracking (which draft is currently being edited)
├── Draft persistence across browser sessions
└── Auto-cleanup of completed drafts
```

#### **State Management Structure**
```javascript
MultiDraftState = {
  activeDraftId: "draft_ABC123",
  drafts: {
    "draft_ABC123": {
      id: "draft_ABC123",
      customerType: "registered" | "guest" | "anonymous",
      customer: { /* customer data */ },
      items: [ /* order items */ ],
      deliveryDetails: { /* delivery config */ },
      paymentPreference: { /* payment config */ },
      status: "draft" | "completed" | "abandoned",
      createdAt: "2025-01-01T10:00:00Z",
      lastModified: "2025-01-01T10:30:00Z"
    },
    "draft_XYZ789": { /* another draft */ }
  }
}
```

### **2. Customer Type Handling**

#### **Customer Types**
```
1. Registered Customer
   ├── Has account in system
   ├── Full profile information
   ├── Order history available
   └── Can receive notifications

2. Guest Customer
   ├── Minimal information (name, phone)
   ├── No account required
   ├── Orders tracked by phone number
   └── Can convert to registered later

3. Anonymous Customer
   ├── No personal information
   ├── Order-only records
   ├── Cash payments preferred
   └── Limited tracking capabilities
```

#### **Customer Selection Logic**
```
Tab 1: Customer Selection
├── Search registered customers
├── "Guest Customer" options:
│   ├── "Quick Guest" (use default guest profile)
│   ├── "Named Guest" (enter name and phone)
│   └── "Anonymous" (no customer info)
├── "Create Account" (full registration)
└── "Convert Guest" (upgrade existing guest)
```

---

## 🔄 Order Creation Flow

### **Complete Admin Order Creation Process**

#### **Step-by-Step Flow Overview**
```
1. Orders Page
   └── Click "Create Order" button
   
2. Tab 1: Customer Selection
   ├── Search customer by name/email/phone
   ├── Select from results
   └── OR create new customer
   
3. Tab 2: Product Selection
   ├── Browse active products
   ├── Click product → Variant selector (if applicable)
   ├── Add products to draft order
   └── View items list with quantity controls
   
4. Tab 3: Checkout Details
   ├── Delivery method (Pickup/Delivery)
   ├── Address (if delivery)
   ├── Timing (Now/Scheduled)
   ├── Packaging options
   ├── Coupon code
   └── Payment method:
       ├── Post to Bill (customer pays later)
       ├── Cash (pay on delivery)
       ├── M-Pesa (send STK to customer)
       └── Card (send link to customer)
       
5. Tab 4: Summary
   ├── Review all details
   ├── Edit any section (click edit icon)
   ├── View price breakdown
   └── Click "Complete Order"
   
6. Payment Status Page
   └── Works exactly like customer checkout
       (M-Pesa socket tracking, Paystack webhooks, etc.)
```

#### **Detailed Tab Navigation Logic**
```
Tab Progression:
├── Tab 1 → Tab 2: Customer must be selected
├── Tab 2 → Tab 3: At least 1 product must be added
├── Tab 3 → Tab 4: All required checkout fields completed
└── Tab 4 → Complete: All validations passed

Tab Validation Rules:
├── Customer Selection: Must select customer or create new
├── Product Selection: Must add at least 1 product
├── Checkout Details: 
│   ├── If delivery: Address required
│   ├── If pay_now: Payment method required
│   ├── If M-Pesa: Phone number required
│   └── If Card: Email required
└── Summary: All previous validations must pass
```

#### **Multi-Draft Order Management**
```
Draft Switcher Interface:
├── Current Draft: "Order for John Doe (2 items)" [Active]
├── Other Drafts:
│   ├── "Order for Jane Smith (1 item)" [Switch]
│   ├── "Guest Order (3 items)" [Switch]
│   └── "Anonymous Order (1 item)" [Switch]
├── Actions:
│   ├── "+ Create New Order"
│   ├── "Complete Current Order"
│   └── "Abandon Current Order"
└── Status Indicators:
    ├── Draft (editing)
    ├── Ready (can complete)
    └── Completed (finished)
```

### **Phase 1: Customer Selection**

#### **Registered Customer Flow**
```
1. Search customer by name/email/phone
2. Select from search results
3. Auto-fill payment preferences
4. Proceed to product selection
```

#### **Guest Customer Flow**
```
1. Select "Guest Customer"
2. Choose guest type:
   ├── Quick Guest → Use default guest profile
   ├── Named Guest → Enter name and phone
   └── Anonymous → No customer info
3. Configure minimal details
4. Proceed to product selection
```

#### **New Customer Flow**
```
1. Select "Create New Customer"
2. Navigate to customer creation page
3. Create customer account
4. Return to order creation with customer selected
```

### **Phase 2: Product Selection**

#### **Product Selection Logic**
```
1. Browse available products
2. Click product:
   ├── No variants → Add directly
   └── Has variants → Open variant selector
3. Variant selector:
   ├── Select all required variants
   ├── Set quantity
   └── Add to draft order
4. Draft order management:
   ├── View items list
   ├── Adjust quantities
   ├── Remove items
   └── View subtotal
```

#### **Multi-Draft Product Selection**
```
Draft Switcher:
├── "Order for John Doe (2 items)" [Active]
├── "Order for Jane Smith (1 item)"
├── "Guest Order (3 items)"
└── "+ Create New Order"

Each draft independent:
├── Separate product selections
├── Different quantities
├── Different pricing
└── Independent progress
```

### **Phase 3: Checkout Configuration**

#### **Delivery Configuration**
```
Delivery Method:
├── Pickup (collect from store)
└── Delivery (deliver to address)

Address Handling:
├── Registered customers: Use saved addresses
├── Guest customers: Enter address manually
└── Anonymous customers: Store address only

Timing Options:
├── Order Now (30-45 minutes)
└── Scheduled (choose date/time)
```

#### **Payment Configuration**
```
Payment Methods by Customer Type:

Registered Customers:
├── Post to Bill (pay later)
├── Cash (collect on delivery)
├── M-Pesa (send STK to registered phone)
└── Card (send link to registered email)

Guest Customers:
├── Post to Bill (pay later)
├── Cash (collect on delivery)
├── M-Pesa (send STK to provided phone)
└── Card (send link to provided email)

Anonymous Customers:
├── Cash (collect on delivery/pickup)
└── Post to Bill (pay later)
```

### **Phase 4: Order Completion**

#### **Order Creation Logic**
```
Backend Processing:
1. Determine customer type
2. Create/update customer record if needed
3. Create order with appropriate customer linking
4. Handle payment initiation based on method
5. Send notifications to customer
6. Update draft status to "completed"
```

#### **Payment Flow Integration**
```
Payment Status Navigation:
├── Post to Bill → /payment-status?method=post_to_bill
├── Cash → /payment-status?method=cash
├── M-Pesa → /payment-status?method=mpesa
└── Card → /payment-status?method=paystack

All flows reuse existing PaymentStatus page
```

---

## 🗄️ Data Management Strategy

### **1. Draft Order Storage**

#### **LocalStorage Structure**
```javascript
localStorage.setItem('adminDrafts', JSON.stringify({
  activeDraftId: "draft_ABC123",
  drafts: {
    "draft_ABC123": {
      id: "draft_ABC123",
      customerType: "guest",
      customer: {
        name: "John Doe",
        phone: "254712345678",
        email: null,
        isGuest: true
      },
      items: [
        {
          productId: "prod_123",
          skuId: "sku_456",
          variantOptions: { Size: "10", Color: "Red" },
          quantity: 2,
          price: 1500,
          product: { /* full product object */ }
        }
      ],
      deliveryDetails: {
        method: "delivery",
        addressId: "addr_789",
        timing: { isScheduled: false, scheduledAt: null }
      },
      paymentPreference: {
        mode: "pay_now",
        method: "mpesa_stk",
        payerPhone: "254712345678",
        payerEmail: null
      },
      status: "draft",
      createdAt: "2025-01-01T10:00:00Z",
      lastModified: "2025-01-01T10:30:00Z"
    }
  }
}))
```

#### **Draft Management Operations**
```javascript
// Create new draft
const createDraft = () => {
  const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const newDraft = {
    id: draftId,
    customerType: null,
    customer: null,
    items: [],
    deliveryDetails: { method: 'pickup', addressId: null, timing: { isScheduled: false, scheduledAt: null } },
    paymentPreference: { mode: 'post_to_bill', method: null, payerPhone: '', payerEmail: '' },
    status: 'draft',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
  // Add to drafts and set as active
}

// Switch between drafts
const switchDraft = (draftId) => {
  // Update activeDraftId
  // Load draft data into current state
}

// Save draft changes
const saveDraft = (draftId, updates) => {
  // Update draft in localStorage
  // Update lastModified timestamp
}

// Complete draft
const completeDraft = (draftId) => {
  // Create order via API
  // Update draft status to 'completed'
  // Navigate to payment status
}

// Abandon draft
const abandonDraft = (draftId) => {
  // Update draft status to 'abandoned'
  // Optionally delete after timeout
}
```

### **2. Customer Data Handling**

#### **Guest Customer Creation**
```javascript
// Backend: Create guest customer
const createGuestCustomer = async (guestData) => {
  const guestCustomer = await User.create({
    name: guestData.name || 'Guest Customer',
    phone: guestData.phone || null,
    email: guestData.email || null,
    role: 'customer',
    isGuest: true,
    isActive: true,
    // No password or login credentials
  })
  return guestCustomer
}

// Frontend: Guest customer selection
const selectGuestCustomer = (guestType, guestData = {}) => {
  switch (guestType) {
    case 'quick_guest':
      return {
        id: 'guest_default',
        name: 'Guest Customer',
        phone: null,
        email: null,
        isGuest: true
      }
    
    case 'named_guest':
      return {
        id: null, // Will be created on order completion
        name: guestData.name,
        phone: guestData.phone,
        email: guestData.email || null,
        isGuest: true
      }
    
    case 'anonymous':
      return {
        id: null,
        name: null,
        phone: null,
        email: null,
        isGuest: true,
        isAnonymous: true
      }
  }
}
```

#### **Customer Conversion Logic**
```javascript
// Convert guest to registered customer
const convertGuestToRegistered = async (guestCustomerId, registrationData) => {
  const guestCustomer = await User.findById(guestCustomerId)
  
  // Update customer with registration data
  guestCustomer.name = registrationData.name
  guestCustomer.email = registrationData.email
  guestCustomer.phone = registrationData.phone
  guestCustomer.password = await bcrypt.hash(registrationData.password, 10)
  guestCustomer.isGuest = false
  guestCustomer.isActive = true
  
  await guestCustomer.save()
  
  // Link all guest orders to registered customer
  await Order.updateMany(
    { customerId: guestCustomerId },
    { customerId: guestCustomerId, isGuestOrder: false }
  )
  
  return guestCustomer
}
```

---

## 🔧 Backend Modifications

### **1. Enhanced Order Controller Strategy**

#### **Updated Order Controller (`orderController.js`)**
```javascript
// EXISTING FILE: server/controllers/orderController.js
// Adding admin order creation functionality to existing controller

export const createAdminOrder = async (req, res, next) => {
  try {
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
 * Prepare customer for order creation
 * Handles registered, guest, and anonymous customers
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
      return await initiateMpesaPayment(order, customerInfo.phone)
    }
    
    if (method === 'paystack') {
      return await initiatePaystackPayment(order, customerInfo.email)
    }
  }

  throw new Error('Invalid payment method')
}

/**
 * Send order notifications
 */
const sendOrderNotifications = async ({ order, customerInfo, paymentResult }) => {
  // Send SMS notification
  if (customerInfo.phone) {
    await sendOrderNotificationSMS(
      customerInfo.phone,
      order.orderNumber,
      'placed',
      customerInfo.name
    )
  }

  // Send email notification
  if (customerInfo.email) {
    await sendOrderNotificationEmail(
      customerInfo.email,
      order,
      customerInfo.name
    )
  }

  // Send in-app notification if customer has account
  if (order.customerType === 'registered') {
    await sendInAppNotification(
      order.customerId,
      'order_created',
      `Order ${order.orderNumber} has been created`
    )
  }
}
```

#### **Enhanced Order Controller (Existing + Admin Functions)**
```javascript
// EXISTING: server/controllers/orderController.js
// Keep existing createOrder function for customer-initiated orders
// Add new createAdminOrder function for admin-initiated orders
// Both functions coexist in the same controller
```

#### **Enhanced Order Functions (Added to orderController.js)**
```javascript
// Enhanced functions for unified order management
// These will be added to the existing orderController.js

/**
 * Get all orders with enhanced filtering (customer + admin created)
 * This replaces the need for separate admin order endpoints
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
```

#### **Route Configuration (Updated orderRoute.js)**
```javascript
// EXISTING FILE: server/routes/orderRoute.js
// Enhanced with unified order management

import express from "express"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.js"
import { 
  createOrder, 
  getOrderById, 
  updateOrderStatus, 
  assignRider, 
  getOrders, 
  deleteOrder,
  // New admin functions
  createAdminOrder, 
  getAllOrders, // Enhanced unified order listing
  getOrderStats, // Enhanced unified statistics
  convertGuestToRegistered 
} from "../controllers/orderController.js"

const router = express.Router()

// Existing customer routes
router.post('/', authenticateToken, createOrder)
router.get('/', authenticateToken, getOrders) // This will be enhanced to show all orders
router.get('/:id', authenticateToken, getOrderById)
router.patch('/:id/status', authenticateToken, updateOrderStatus)
router.patch('/:id/assign-rider', authenticateToken, assignRider)
router.delete('/:id', authenticateToken, deleteOrder)

// New admin routes (require admin/staff role)
router.post('/admin/create', authenticateToken, authorizeRoles(['admin', 'staff', 'manager']), createAdminOrder)
router.get('/admin/all', authenticateToken, authorizeRoles(['admin', 'staff', 'manager']), getAllOrders) // Unified order listing
router.get('/admin/stats', authenticateToken, authorizeRoles(['admin', 'staff', 'manager']), getOrderStats) // Unified statistics
router.post('/admin/convert-guest', authenticateToken, authorizeRoles(['admin', 'staff', 'manager']), convertGuestToRegistered)

export default router
```

#### **Main Route Integration (No Changes Needed)**
```javascript
// EXISTING: server/index.js
// No changes needed - existing orderRoute.js already integrated
// New admin routes are added to existing orderRoute.js
```

#### **Benefits of Enhanced Order Controller**

**1. Unified Order Management**
- **Single Controller**: All order logic (customer and admin) in one place
- **Shared Logic**: Common order processing functions can be reused
- **Consistent API**: Unified approach to order creation and management

**2. Enhanced Security**
- **Role-Based Access**: Admin order routes require specific roles (admin, staff, manager)
- **Audit Trail**: All admin-created orders are marked with `isAdminCreated: true`
- **Admin Tracking**: Orders include `createdBy` field to track which admin created the order

**3. Specialized Logic**
- **Customer Type Handling**: Dedicated functions for registered, guest, and anonymous customers
- **Guest Management**: Built-in guest customer creation and conversion logic
- **Admin-Specific Features**: Statistics, filtering, and management functions

**4. Maintainability**
- **Single Source**: All order-related logic in one controller
- **Easier Testing**: All order functions can be tested together
- **Clear API Structure**: `/api/orders` for customers, `/api/orders/admin/*` for admin functions

**5. Performance Optimization**
- **Shared Resources**: Common order processing logic can be optimized once
- **Reduced Duplication**: No need to duplicate order validation and processing logic
- **Better Caching**: Unified caching strategy for all order-related data

#### **API Endpoint Summary**

**Unified Order Endpoints** (All orders in one place)
```
POST /api/orders          - Customer creates order
GET  /api/orders          - View all orders (customer + admin created)
GET  /api/orders/:id      - View specific order
PATCH /api/orders/:id/status - Update order status
PATCH /api/orders/:id/assign-rider - Assign rider to order
DELETE /api/orders/:id    - Delete order
```

**Admin-Specific Endpoints** (New - Added to existing orderRoute.js)
```
POST /api/orders/admin/create        - Admin creates order for customer
GET  /api/orders/admin/all          - Enhanced order listing with filters
GET  /api/orders/admin/stats        - Unified order statistics
POST /api/orders/admin/convert-guest - Convert guest to registered customer
```

**Enhanced Filtering Options** (for GET /api/orders and GET /api/orders/admin/all)
```
?createdBy=customer|admin|all     - Filter by creation method
?customerType=registered|guest|anonymous - Filter by customer type
?status=placed|confirmed|delivered - Filter by order status
?dateFrom=2025-01-01&dateTo=2025-01-31 - Date range filter
?search=order123                   - Search by order number or customer name
```

### **2. Customer Model Updates**

#### **Enhanced User Model**
```javascript
// Add to User schema
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  isGuest: {
    type: Boolean,
    default: false
  },
  
  guestOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  conversionDate: {
    type: Date,
    default: null
  }
})
```

### **3. Order Model Updates**

#### **Enhanced Order Model**
```javascript
// Add to Order schema
const orderSchema = new mongoose.Schema({
  // ... existing fields ...
  
  customerType: {
    type: String,
    enum: ['registered', 'guest', 'anonymous'],
    default: 'registered'
  },
  
  isGuestOrder: {
    type: Boolean,
    default: false
  },
  
  guestCustomerInfo: {
    name: String,
    phone: String,
    email: String
  }
})
```

---

## 🎨 User Interface Strategy

### **1. Unified Order Management Interface**

#### **Orders List Page (All Orders Together)**
```
Orders List:
├── Filter Options:
│   ├── Creation Method: [All Orders] [Customer Created] [Admin Created]
│   ├── Customer Type: [All] [Registered] [Guest] [Anonymous]
│   ├── Status: [All] [Placed] [Confirmed] [Delivered] [Cancelled]
│   ├── Date Range: [Last 7 days] [Last 30 days] [Custom range]
│   └── Search: [Order number, Customer name]
├── Order List:
│   ├── Order #12345 - John Doe (Registered) - Placed - Customer Created
│   ├── Order #12346 - Jane Smith (Guest) - Confirmed - Admin Created
│   ├── Order #12347 - Anonymous - Delivered - Admin Created
│   └── Order #12348 - Mike Johnson (Registered) - Placed - Customer Created
├── Actions:
│   ├── "Create New Order" (Admin only)
│   ├── "Export Orders"
│   └── "Bulk Actions"
└── Order Indicators:
    ├── Customer Created (blue badge)
    ├── Admin Created (green badge)
    └── Guest/Anonymous (orange badge)
```

#### **Order Detail Page (Unified View)**
```
Order Detail:
├── Order Information:
│   ├── Order #12346
│   ├── Status: Confirmed
│   ├── Created: Admin Created (by John Admin)
│   ├── Customer: Jane Smith (Guest)
│   └── Total: KSh 2,500
├── Customer Information:
│   ├── Name: Jane Smith
│   ├── Type: Guest Customer
│   ├── Phone: +254712345678
│   └── Email: jane@example.com
├── Order Items:
│   ├── Product 1 - Size M, Red - Qty 2
│   └── Product 2 - Size L, Blue - Qty 1
├── Actions:
│   ├── "Update Status"
│   ├── "Assign Rider"
│   ├── "Convert Guest to Registered" (if guest)
│   └── "Print Receipt"
└── Timeline:
    ├── Order Created (Admin) - 2 hours ago
    ├── Status: Confirmed - 1 hour ago
    └── Payment: Pending - 1 hour ago
```

### **2. Admin Order Creation Interface**

#### **Create Order Page (Admin-Initiated)**
```
Create Order:
├── Step 1: Customer Selection
│   ├── Search Registered Customers
│   │   ├── Search input
│   │   ├── Results list
│   │   └── Select customer
│   ├── Guest Customer Options
│   │   ├── "Quick Guest" (default profile)
│   │   ├── "Named Guest" (enter name/phone)
│   │   └── "Anonymous" (no info)
│   ├── New Customer
│   │   └── "Create New Customer" button
│   └── Customer Conversion
│       └── "Convert Guest to Registered"
├── Step 2: Product Selection
│   ├── Browse products
│   ├── Add to order
│   └── Manage quantities
├── Step 3: Checkout Details
│   ├── Delivery method
│   ├── Address selection
│   ├── Payment method
│   └── Special instructions
└── Step 4: Order Summary
    ├── Review all details
    ├── Calculate totals
    └── Complete order
```

#### **Guest Customer Form**
```
Guest Customer Form:
├── Name (required for named guests)
├── Phone (optional but recommended)
├── Email (optional)
├── Notes (internal admin notes)
└── Actions:
    ├── "Save as Guest"
    ├── "Create Account Instead"
    └── "Cancel"
```

### **3. Multi-Draft Management Interface**

#### **Draft Overview Dashboard**
```
Draft Overview:
├── Active Drafts (3)
│   ├── Draft #1: John Doe - 2 items - Ready
│   ├── Draft #2: Jane Smith - 1 item - In Progress
│   └── Draft #3: Guest - 3 items - Draft
├── Completed Today (5)
├── Abandoned Drafts (2)
└── Quick Actions:
    ├── "Complete All Ready Orders"
    ├── "Clear Abandoned Drafts"
    └── "Export Draft Summary"
```

---

## 🔄 Workflow Examples

### **Scenario 1: Multiple Registered Customers**

```
Admin Workflow:
1. Start Order 1 for Customer A
   ├── Search "John Doe" → Select
   ├── Add products → 2 items
   └── Configure delivery → Ready

2. Start Order 2 for Customer B
   ├── Search "Jane Smith" → Select
   ├── Add products → 1 item
   └── Configure delivery → Ready

3. Complete Order 1
   ├── Review summary
   ├── Complete order
   └── Navigate to payment status

4. Complete Order 2
   ├── Review summary
   ├── Complete order
   └── Navigate to payment status

Result: 2 orders created, 2 customers notified
```

### **Scenario 2: Guest Customer Orders**

```
Admin Workflow:
1. Guest walks in → "Create Order"
2. Select "Named Guest"
   ├── Enter name: "Mike Johnson"
   ├── Enter phone: "254712345678"
   └── Proceed to products

3. Add products → 3 items
4. Configure delivery → Address: "123 Main St"
5. Choose payment → M-Pesa to 254712345678
6. Complete order → Guest receives M-Pesa prompt

Result: Guest order created, customer can pay via M-Pesa
```

### **Scenario 3: Anonymous Customer**

```
Admin Workflow:
1. Anonymous customer → "Create Order"
2. Select "Anonymous"
   ├── No customer info required
   └── Proceed to products

3. Add products → 1 item
4. Configure pickup → No address needed
5. Choose payment → Cash on pickup
6. Complete order → Instant success

Result: Anonymous order created, cash collection on pickup
```

### **Scenario 4: Guest to Registered Conversion**

```
Customer Journey:
1. Guest places order → Receives M-Pesa prompt
2. Pays successfully → Order completed
3. Admin shows "Create Account" option
4. Customer creates account with order info pre-filled
5. Future orders linked to registered account

Result: Guest converted to registered customer
```

---


## 📊 Analytics and Reporting

### **1. Unified Order Analytics**

#### **Order Creation Method Breakdown**
```
Order Analytics:
├── Customer Created: 60% (120 orders)
├── Admin Created: 40% (80 orders)
└── Total Orders: 200

Customer Type Breakdown:
├── Registered Customers: 60% (120 orders)
├── Guest Customers: 35% (70 orders)
└── Anonymous Customers: 5% (10 orders)

Conversion Metrics:
├── Guest to Registered: 25% conversion rate
├── Average orders per registered customer: 3.2
└── Guest customer repeat rate: 15%
```

#### **Admin Order Efficiency**
```
Admin Order Management:
├── Average admin orders per session: 2.3
├── Admin order completion rate: 85%
├── Average time per admin order: 8 minutes
└── Guest conversion rate: 25%
```

### **2. Customer Insights**

#### **Guest Customer Behavior**
```
Guest Customer Insights:
├── Most common guest order value: KSh 2,500
├── Preferred payment method: M-Pesa (70%)
├── Delivery vs Pickup: 60% delivery
└── Peak guest order times: 2-4 PM
```

#### **Conversion Opportunities**
```
Conversion Tracking:
├── Guests with phone numbers: 80%
├── Guests with email addresses: 30%
├── Conversion rate by contact method:
│   ├── Phone + Email: 40%
│   ├── Phone only: 25%
│   └── No contact info: 5%
└── Average time to conversion: 7 days
```

---




This comprehensive strategy provides a robust foundation for admin-assisted order creation while supporting multiple customer types and scenarios. The phased approach ensures manageable implementation while delivering immediate value to the business.

The key to success lies in:
1. **Flexible customer handling** (registered, guest, anonymous)
2. **Efficient multi-draft management** (simultaneous orders)
3. **Seamless payment integration** (reuse existing flows)
4. **User-friendly interface** (intuitive admin experience)
5. **Comprehensive analytics** (business insights)

This strategy positions TEO KICKS to handle any order creation scenario while maintaining operational efficiency and customer satisfaction.

---

**Document Version**: 1.0  
**Last Updated**: January 1, 2025  
**Status**: Strategy Complete  
**Next Steps**: Begin Phase 1 Implementation