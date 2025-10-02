import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGetProducts } from '../../hooks/useProducts'
import { useGetUsers } from '../../hooks/useUsers'
import { useGetPackaging } from '../../hooks/usePackaging'
import { useGetAllCoupons } from '../../hooks/useCoupons'
import VariantSelector from '../../components/common/VariantSelector'
import Pagination from '../../components/common/Pagination'
import { adminOrderAPI } from '../../utils/api'

const CreateOrder = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Customer Selection
  const [customerType, setCustomerType] = useState('registered')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState([])

  // Step 2: Product Selection
  const [selectedProducts, setSelectedProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [productPage, setProductPage] = useState(1)
  const [productFilters, setProductFilters] = useState({
    category: '',
    brand: '',
    status: 'active'
  })

  // Step 3: Checkout Details
  const [deliveryMethod, setDeliveryMethod] = useState('pickup')
  const [addressId, setAddressId] = useState(null)
  const [timing, setTiming] = useState({ isScheduled: false, scheduledAt: null })
  const [packagingOptionId, setPackagingOptionId] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [paymentPreference, setPaymentPreference] = useState({
    mode: 'post_to_bill',
    method: null
  })

  // Hooks
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useGetProducts({
    page: productPage,
    limit: 12,
    search: productSearch,
    ...productFilters
  })

  const { data: customers, isLoading: customersLoading } = useGetUsers({
    role: 'customer',
    search: customerSearch,
    limit: 10
  })

  const { data: packagingOptions } = useGetPackaging({ isActive: true })
  const { data: coupons } = useGetAllCoupons({ isActive: true })

  // Search customers
  useEffect(() => {
    if (customerSearch.length > 2) {
      setCustomerResults(customers?.users || [])
    } else {
      setCustomerResults([])
    }
  }, [customerSearch, customers])

  // Load products when filters change
  useEffect(() => {
    refetchProducts()
  }, [productSearch, productFilters, productPage])

  const handleCustomerTypeChange = (type) => {
    setCustomerType(type)
    setSelectedCustomer(null)
    setGuestInfo({ name: '', phone: '', email: '' })
  }

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch('')
    setCustomerResults([])
  }

  const handleGuestInfoChange = (field, value) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleProductSelect = (product) => {
    const existingIndex = selectedProducts.findIndex(p => p.productId === product._id)
    
    if (existingIndex >= 0) {
      // Update existing product
      const updated = [...selectedProducts]
      updated[existingIndex].quantity += 1
      setSelectedProducts(updated)
    } else {
      // Add new product
      const newProduct = {
        productId: product._id,
        skuId: null,
        variantOptions: {},
        quantity: 1,
        price: product.basePrice,
        product: product
      }
      setSelectedProducts([...selectedProducts, newProduct])
    }
  }

  const handleVariantSelect = (productId, variantId, optionId) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const updated = { ...p }
        updated.variantOptions[variantId] = optionId
        
        // Find the SKU that matches the selected options
        const product = p.product
        const matchingSku = product.skus?.find(sku => {
          return Object.entries(updated.variantOptions).every(([vId, oId]) => {
            const variant = product.variants?.find(v => v._id === vId)
            const option = variant?.options?.find(o => o._id === oId)
            return sku.attributes?.[variant.name] === option?.name
          })
        })
        
        if (matchingSku) {
          updated.skuId = matchingSku._id
          updated.price = matchingSku.price
        }
        
        return updated
      }
      return p
    }))
  }

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(prev => prev.map(p => 
      p.productId === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    ))
  }

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId))
  }

  const handlePaymentMethodChange = (mode, method = null) => {
    setPaymentPreference({ mode, method })
  }

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const packagingCost = packagingOptions?.find(p => p._id === packagingOptionId)?.fee || 0
    const deliveryCost = deliveryMethod === 'delivery' ? 50 : 0 // TODO: Calculate based on distance
    const total = subtotal + packagingCost + deliveryCost
    
    return { subtotal, packagingCost, deliveryCost, total }
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (customerType === 'registered' && !selectedCustomer) {
          setError('Please select a customer')
          return false
        }
        if (customerType === 'guest' && !guestInfo.name) {
          setError('Please enter guest name')
          return false
        }
        return true
      
      case 2:
        if (selectedProducts.length === 0) {
          setError('Please add at least one product')
          return false
        }
        return true
      
      case 3:
        if (deliveryMethod === 'delivery' && !addressId) {
          setError('Please select a delivery address')
          return false
        }
        if (paymentPreference.mode === 'pay_now' && !paymentPreference.method) {
          setError('Please select a payment method')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('')
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsLoading(true)
    setError('')

    try {
      const orderData = {
        customerType,
        customerInfo: customerType === 'guest' ? guestInfo : undefined,
        customerId: customerType === 'registered' ? selectedCustomer._id : undefined,
        items: selectedProducts.map(item => ({
          productId: item.productId,
          skuId: item.skuId,
          variantOptions: item.variantOptions,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryDetails: {
          method: deliveryMethod,
          addressId: deliveryMethod === 'delivery' ? addressId : null,
          timing
        },
        paymentPreference,
        packagingOptionId: packagingOptionId || null,
        couponCode: couponCode || null,
        metadata: {
          customerName: customerType === 'registered' ? selectedCustomer.name : guestInfo.name,
          customerPhone: customerType === 'registered' ? selectedCustomer.phone : guestInfo.phone,
          customerEmail: customerType === 'registered' ? selectedCustomer.email : guestInfo.email
        }
      }

      const response = await adminOrderAPI.createAdminOrder(orderData)
      
      if (response.success) {
        navigate(`/orders/${response.data.orderId}`)
      } else {
        setError(response.message || 'Failed to create order')
      }
    } catch (err) {
      setError(err.message || 'Failed to create order')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Select Customer</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleCustomerTypeChange('registered')}
          className={`p-4 rounded-lg border-2 ${
            customerType === 'registered' 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <h3 className="font-semibold">Registered Customer</h3>
          <p className="text-sm text-gray-600">Existing customer with account</p>
        </button>
        
        <button
          onClick={() => handleCustomerTypeChange('guest')}
          className={`p-4 rounded-lg border-2 ${
            customerType === 'guest' 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <h3 className="font-semibold">Guest Customer</h3>
          <p className="text-sm text-gray-600">New customer without account</p>
        </button>
        
        <button
          onClick={() => handleCustomerTypeChange('anonymous')}
          className={`p-4 rounded-lg border-2 ${
            customerType === 'anonymous' 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <h3 className="font-semibold">Anonymous</h3>
          <p className="text-sm text-gray-600">No customer information</p>
        </button>
      </div>

      {customerType === 'registered' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customer
            </label>
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="input w-full"
            />
          </div>
          
          {customerResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customerResults.map(customer => (
                <div
                  key={customer._id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                </div>
              ))}
            </div>
          )}
          
          {selectedCustomer && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800">Selected Customer:</div>
              <div className="text-green-700">{selectedCustomer.name}</div>
              <div className="text-sm text-green-600">{selectedCustomer.email}</div>
            </div>
          )}
        </div>
      )}

      {customerType === 'guest' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Name *
            </label>
            <input
              type="text"
              value={guestInfo.name}
              onChange={(e) => handleGuestInfoChange('name', e.target.value)}
              placeholder="Enter guest name"
              className="input w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={guestInfo.phone}
              onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className="input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={guestInfo.email}
              onChange={(e) => handleGuestInfoChange('email', e.target.value)}
              placeholder="Enter email address"
              className="input w-full"
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Select Products</h2>
      
      <div className="flex gap-4">
        <input
          type="text"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Search products..."
          className="input flex-1"
        />
        <select
          value={productFilters.category}
          onChange={(e) => setProductFilters(prev => ({ ...prev, category: e.target.value }))}
          className="input"
        >
          <option value="">All Categories</option>
          {/* TODO: Add categories */}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.products?.map(product => (
          <div key={product._id} className="border rounded-lg p-4">
            <div className="aspect-square bg-gray-100 rounded-lg mb-3">
              {product.primaryImage ? (
                <img 
                  src={product.primaryImage} 
                  alt={product.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            
            <h3 className="font-medium mb-2">{product.title}</h3>
            <div className="text-sm text-gray-600 mb-2">KSh {product.basePrice}</div>
            
            <button
              onClick={() => handleProductSelect(product)}
              className="btn-primary w-full"
            >
              Add to Order
            </button>
          </div>
        ))}
      </div>

      {selectedProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Selected Products</h3>
          <div className="space-y-4">
            {selectedProducts.map(item => (
              <div key={item.productId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.title}</h4>
                    <div className="text-sm text-gray-600">KSh {item.price}</div>
                    
                    {item.product.variants && item.product.variants.length > 0 && (
                      <VariantSelector
                        variants={item.product.variants}
                        selectedOptions={item.variantOptions}
                        onOptionSelect={(variantId, optionId) => 
                          handleVariantSelect(item.productId, variantId, optionId)
                        }
                        className="mt-2"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="btn-outline px-2 py-1"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="btn-outline px-2 py-1"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveProduct(item.productId)}
                      className="btn-outline text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => {
    const { subtotal, packagingCost, deliveryCost, total } = calculateTotals()
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Checkout Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mr-2"
                  />
                  Pickup from Store
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mr-2"
                  />
                  Delivery to Address
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="post_to_bill"
                    checked={paymentPreference.mode === 'post_to_bill'}
                    onChange={() => handlePaymentMethodChange('post_to_bill')}
                    className="mr-2"
                  />
                  Post to Bill (Pay Later)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentPreference.mode === 'cash'}
                    onChange={() => handlePaymentMethodChange('cash')}
                    className="mr-2"
                  />
                  Cash on Delivery/Pickup
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pay_now"
                    checked={paymentPreference.mode === 'pay_now'}
                    onChange={() => handlePaymentMethodChange('pay_now')}
                    className="mr-2"
                  />
                  Pay Now
                </label>
              </div>
            </div>

            {paymentPreference.mode === 'pay_now' && (
              <div className="ml-4 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="mpesa_stk"
                    checked={paymentPreference.method === 'mpesa_stk'}
                    onChange={() => handlePaymentMethodChange('pay_now', 'mpesa_stk')}
                    className="mr-2"
                  />
                  M-Pesa STK Push
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="paystack_card"
                    checked={paymentPreference.method === 'paystack_card'}
                    onChange={() => handlePaymentMethodChange('pay_now', 'paystack_card')}
                    className="mr-2"
                  />
                  Card Payment
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packaging Option
              </label>
              <select
                value={packagingOptionId}
                onChange={(e) => setPackagingOptionId(e.target.value)}
                className="input w-full"
              >
                <option value="">Select Packaging</option>
                {packagingOptions?.map(option => (
                  <option key={option._id} value={option._id}>
                    {option.name} - KSh {option.fee}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="input w-full"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>KSh {subtotal}</span>
              </div>
              {packagingCost > 0 && (
                <div className="flex justify-between">
                  <span>Packaging:</span>
                  <span>KSh {packagingCost}</span>
                </div>
              )}
              {deliveryCost > 0 && (
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>KSh {deliveryCost}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>KSh {total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Order Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4">Customer Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {customerType === 'registered' && selectedCustomer ? (
              <div>
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-600">{selectedCustomer.email}</div>
                <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
              </div>
            ) : customerType === 'guest' ? (
              <div>
                <div className="font-medium">{guestInfo.name}</div>
                {guestInfo.email && <div className="text-sm text-gray-600">{guestInfo.email}</div>}
                {guestInfo.phone && <div className="text-sm text-gray-600">{guestInfo.phone}</div>}
              </div>
            ) : (
              <div className="text-gray-600">Anonymous Customer</div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Order Details</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="capitalize">{deliveryMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="capitalize">
                  {paymentPreference.mode === 'pay_now' 
                    ? `${paymentPreference.mode} (${paymentPreference.method})`
                    : paymentPreference.mode
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{selectedProducts.length}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>KSh {calculateTotals().total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Selected Products</h3>
        <div className="space-y-2">
          {selectedProducts.map(item => (
            <div key={item.productId} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">{item.product.title}</div>
                <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
              </div>
              <div className="text-right">
                <div>KSh {item.price}</div>
                <div className="text-sm text-gray-600">Total: KSh {item.price * item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Order</h1>
          <p className="text-gray-600">Create an order for a customer</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Customer</span>
            <span>Products</span>
            <span>Details</span>
            <span>Summary</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="btn-outline"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Order...' : 'Create Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateOrder