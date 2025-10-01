import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartAPI, orderAPI, paymentAPI } from '../utils/api'
import { useGetActivePackagingPublic } from '../hooks/usePackaging'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { FiEdit2, FiShoppingBag, FiClock, FiCreditCard, FiList } from 'react-icons/fi'


const ALL_STEPS = [
  { key: 'location', label: 'Location' },
  { key: 'orderType', label: 'Order Type' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'timing', label: 'Timing' },
  { key: 'address', label: 'Address' },
  { key: 'payment', label: 'Payment' },
  { key: 'summary', label: 'Summary' },
]


const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
      ></div>
    </div>
  )
}




const CheckmarksRow = ({ current, steps }) => {
  return (
    <div className="flex items-center justify-between gap-2 mb-4">
      {steps.map((_, idx) => (
        <div key={idx} className="flex items-center">
          <div className={` w-5 h-5 sm:w-8 sm:h-8 text-xs sm:text-sm md:text-base  font-semibold rounded-full flex items-center justify-center ${
            idx < current 
              ? 'bg-primary text-white' 
              : 'bg-light text-gray-500'
          }`}>
            {idx < current ? (
              <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              idx + 1
            )}
          </div>
          {idx < steps.length - 1 && (
            <div className={`sm:w-12 h-0.5 mx-2 ${
              idx < current ? 'bg-primary' : 'bg-gray-200'
            }`}/>
          )}
        </div>
      ))}
    </div>
  )
}


const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [paying, setPaying] = useState(false)

  // Form state
  const [location, setLocation] = useState('in_shop')
  const [orderType, setOrderType] = useState('pickup')
  const [timing, setTiming] = useState({ isScheduled: false, scheduledAt: null })
  const [addressId, setAddressId] = useState(null)
  const [paymentMode, setPaymentMode] = useState('post_to_bill')
  const [paymentMethod, setPaymentMethod] = useState(null) // mpesa_stk | paystack_card | null
  // Coupon: load from localStorage if set by Cart page
  const [coupon, setCoupon] = useState(() => {
    try {
      const raw = localStorage.getItem('appliedCoupon')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  // Format phone number to M-Pesa format (254XXXXXXXXX)
  const formatPhoneForMpesa = (phone) => {
    if (!phone) return ''
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '')
    // If it starts with 0, replace with 254
    if (digits.startsWith('0')) {
      return '254' + digits.substring(1)
    }
    // If it starts with 254, return as is
    if (digits.startsWith('254')) {
      return digits
    }
    // If it's 9 digits, add 254 prefix
    if (digits.length === 9) {
      return '254' + digits
    }
    // Return as is if it doesn't match expected patterns
    return digits
  }

  const [payerPhone, setPayerPhone] = useState('')
  const [payerEmail, setPayerEmail] = useState('')

  const [orderId, setOrderId] = useState(null)
  const [invoiceId, setInvoiceId] = useState(null)
  const [receiptId, setReceiptId] = useState(null)

  const canShowAddress = orderType === 'delivery'
  const { data: packagingPublic } = useGetActivePackagingPublic()
  const packagingOptions = packagingPublic?.data?.data?.packaging || packagingPublic?.data?.packaging || []
  const canShowPackaging = (packagingOptions || []).length > 0

  const [selectedPackagingId, setSelectedPackagingId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await cartAPI.getCart()
        setCart(res.data?.data)
        // If no items, clear persisted coupon
        const items = res.data?.data?.items || []
        if (!items || items.length === 0) {
          try { localStorage.removeItem('appliedCoupon') } catch {}
          setCoupon(null)
        }
      } catch (e) {
        toast.error('Failed to load cart')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Cart protection - redirect to cart if empty
  useEffect(() => {
    if (cart && (!cart.items || cart.items.length === 0)) {
      //toast.error('Your cart is empty')
      navigate('/cart')
    }
  }, [cart, navigate])

  // Prefill user phone and email
  useEffect(() => {
    if (user) {
      if (user.phone) {
        setPayerPhone(formatPhoneForMpesa(user.phone))
      }
      if (user.email) {
        setPayerEmail(user.email)
      }
    }
  }, [user])

  // Auto-select default packaging when available
  useEffect(() => {
    if (!canShowPackaging) return
    if (selectedPackagingId) return
    const def = packagingOptions.find((p) => p.isDefault) || packagingOptions[0]
    if (def) setSelectedPackagingId(def._id)
  }, [canShowPackaging, packagingOptions, selectedPackagingId])

  const totals = useMemo(() => {
    const items = cart?.items || []
    const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0)
    const packagingFee = canShowPackaging ? Number((packagingOptions.find(p => p._id === selectedPackagingId)?.price) || 0) : 0
    const discount = Math.min(subtotal, Math.max(0, Number(coupon?.discountAmount || 0)))
    const total = subtotal + packagingFee - discount
    return { subtotal, packagingFee, discount, total }
  }, [cart, canShowPackaging, packagingOptions, selectedPackagingId, coupon])

  const formatVariantOptions = (variantOptions) => {
    if (!variantOptions || Object.keys(variantOptions).length === 0) return null
    return Object.entries(variantOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
  }

  const gotoStep = (key) => {
    const idx = activeSteps.findIndex((s) => s.key === key)
    if (idx >= 0) setCurrentStep(idx)
  }

  const activeSteps = useMemo(() => {
    const isPickup = orderType === 'pickup'
    if (isPickup) {
      return ALL_STEPS.filter((s) => s.key !== 'address')
    }
    return ALL_STEPS
  }, [orderType])

  const currentStepKey = activeSteps[currentStep]?.key


  const next = () => {
    setCurrentStep((s) => Math.min(s + 1, activeSteps.length - 1))
  }


  const back = () => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  useEffect(() => {
    if (currentStep >= activeSteps.length) {
      setCurrentStep(Math.max(0, activeSteps.length - 1))
    }
  }, [activeSteps, currentStep])

  const createOrder = async () => {
    try {
      setCreating(true)

      const payload = {
        location,
        type: orderType,
        timing,
        addressId: canShowAddress ? addressId : null,
        paymentPreference: {
          mode: paymentMode,
          method: paymentMode === 'pay_now' ? paymentMethod : null,
        },
        packagingOptionId: canShowPackaging ? selectedPackagingId : null,
        couponCode: coupon?.code || null,
        cartId: null,
        metadata: {},
      }

      const res = await orderAPI.createOrder(payload)
      const createdOrderId = res.data?.data?.orderId
      setOrderId(createdOrderId)

      // fetch invoice
      const orderDetail = await orderAPI.getOrderById(createdOrderId)
      const inv = orderDetail.data?.data?.order?.invoiceId
      const createdInvoiceId = inv?._id || inv
      setInvoiceId(createdInvoiceId)
      
      // Refresh cart after successful order creation (items will be removed by backend)
      try {
        const cartRes = await cartAPI.getCart()
        setCart(cartRes.data?.data)
        console.log('✅ Cart refreshed after order creation')
      } catch (cartError) {
        console.warn('Failed to refresh cart:', cartError)
        // Don't fail the order creation if cart refresh fails
      }
      
      // Clear applied coupon from localStorage
      try {
        localStorage.removeItem('appliedCoupon')
      } catch (e) {
        console.warn('Failed to clear applied coupon:', e)
      }
      
      return { orderId: createdOrderId, invoiceId: createdInvoiceId }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create order')
      throw e
    } finally {
      setCreating(false)
    }
  }

  const payInvoiceNow = async (explicitInvoiceId, explicitOrderId) => {
    const targetInvoiceId = explicitInvoiceId || invoiceId
    const targetOrderId = explicitOrderId || orderId
    if (!targetInvoiceId) return
    try {
      setPaying(true)
      if (paymentMethod === 'mpesa_stk') {
        if (!payerPhone) return toast.error('Phone required')
        const res = await paymentAPI.payInvoice({ invoiceId: targetInvoiceId, method: 'mpesa_stk', payerPhone })
        if (res.data?.success) {
          const paymentId = res.data?.data?.paymentId
          const checkoutRequestId = res.data?.data?.daraja?.checkoutRequestId
          
          // Navigate to payment status page with method parameter
          const params = new URLSearchParams({
            method: 'mpesa',
            paymentId,
            orderId: targetOrderId,
            provider: 'mpesa',
            checkoutRequestId: checkoutRequestId || '',
            invoiceId: targetInvoiceId,
            payerPhone: payerPhone
          })
          navigate(`/payment-status?${params.toString()}`)
          
          toast.success('STK push sent. Complete on your phone.')
        }
      } else if (paymentMethod === 'paystack_card') {
        if (!payerEmail) return toast.error('Email required')
        const res = await paymentAPI.payInvoice({ invoiceId: targetInvoiceId, method: 'paystack_card', payerEmail })
        const paymentId = res.data?.data?.paymentId
        const reference = res.data?.data?.reference
        
        // Navigate to payment status page with method parameter
        const params = new URLSearchParams({
          method: 'paystack',
          paymentId,
          orderId: targetOrderId,
          provider: 'paystack',
          reference: reference || '',
          invoiceId: targetInvoiceId,
          payerEmail: payerEmail
        })
        navigate(`/payment-status?${params.toString()}`)
        
        const url = res.data?.data?.authorizationUrl
        if (url) window.open(url, '_blank')
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setPaying(false)
    }
  }


  const handleCompleteOrder = async () => {
    // Handle Cash and Post-to-Bill (order creation with instant navigation)
    if (paymentMode === 'post_to_bill' || (paymentMode === 'pay_now' && paymentMethod === 'cash')) {
      try {
        setCreating(true)
        
        const payload = {
          location,
          type: orderType,
          timing,
          addressId: canShowAddress ? addressId : null,
          paymentPreference: {
            mode: paymentMode,
            method: paymentMode === 'pay_now' ? paymentMethod : null,
          },
          packagingOptionId: canShowPackaging ? selectedPackagingId : null,
          couponCode: coupon?.code || null,
          cartId: null,
          metadata: {},
        }

        // Save checkout data to localStorage for retry functionality
        try {
          localStorage.setItem('checkoutData', JSON.stringify({
            payload,
            method: paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
          }))
        } catch (e) {
          console.warn('Failed to save checkout data:', e)
        }

        const res = await orderAPI.createOrder(payload)
        const createdOrderId = res.data?.data?.orderId
        const orderDetail = await orderAPI.getOrderById(createdOrderId)
        const inv = orderDetail.data?.data?.order?.invoiceId
        const createdInvoiceId = inv?._id || inv
        
        // Refresh cart after successful order creation (backend clears cart items)
        try {
          const cartRes = await cartAPI.getCart()
          setCart(cartRes.data?.data)
          console.log('✅ Cart refreshed after order creation')
        } catch (cartError) {
          console.warn('Failed to refresh cart:', cartError)
          // Don't fail the order creation if cart refresh fails
        }
        
        // Clear applied coupon from localStorage
        try {
          localStorage.removeItem('appliedCoupon')
        } catch (e) {
          console.warn('Failed to clear applied coupon:', e)
        }
        
        // Navigate to payment status with method parameter
        const method = paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
        const params = new URLSearchParams({
          method: method,
          orderId: createdOrderId,
          invoiceId: createdInvoiceId
        })
        navigate(`/payment-status?${params.toString()}`)
        
      } catch (error) {
        // Order creation failed - navigate to payment status with error indication
        const method = paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
        const params = new URLSearchParams({
          method: method,
          error: error?.response?.data?.message || 'Failed to create order'
        })
        navigate(`/payment-status?${params.toString()}`)
      } finally {
        setCreating(false)
      }
      return
    }

    // Handle M-Pesa and Paystack (order creation first, then payment initiation)
    if (paymentMode === 'pay_now' && (paymentMethod === 'mpesa_stk' || paymentMethod === 'paystack_card')) {
    let ensuredOrderId = orderId
    let ensuredInvoiceId = invoiceId

    if (!ensuredOrderId || !ensuredInvoiceId) {
      const created = await createOrder()
      ensuredOrderId = created?.orderId
      ensuredInvoiceId = created?.invoiceId
    }

    console.log('✅ handleCompleteOrder - Order IDs:', { ensuredOrderId, ensuredInvoiceId })

      // Initiate payment
        await payInvoiceNow(ensuredInvoiceId, ensuredOrderId)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto">
      <h1 className="title3">Checkout</h1>
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm text-primary font-semibold">{activeSteps[currentStep]?.label}</h1>
          <div className="text-xs text-gray-600">
            Step {currentStep + 1} of {activeSteps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={activeSteps.length} />

        {/* Checkmarks Row */}
        <CheckmarksRow current={currentStep} steps={activeSteps} />

        {/* Step content */}
        <div className="">
          {/* STEP 0: Location */}
          {currentStepKey === 'location' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Where are you ordering from?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    location === 'in_shop' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setLocation('in_shop')}
                >
                  <div className="flex  gap-x-5">
                    <div className="text-2xl mb-2">🏪</div>

                    <div className="flex flex-col items-start ">

                    <div className="font-medium">In Shop</div>
                    <div className="text-sm text-gray-500">Ordering while in the store</div>

                    </div>
                  </div>
                </button>
                <button 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    location === 'away' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setLocation('away')}
                >
                  <div className="flex  gap-x-5">
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="flex flex-col items-start ">
                    
                    <div className="flex flex-col items-start ">
                    <div className="font-medium">Away</div>
                    <div className="text-sm text-gray-500">Ordering from home or office</div>
                    </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Order Type */}
          {currentStepKey === 'orderType' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">How would you like to receive your order?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    orderType === 'pickup' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setOrderType('pickup')}
                >
                  <div className="flex i gap-x-5">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="flex flex-col items-start ">
                      <div className="font-medium">Pickup</div>
                      <div className="text-sm text-gray-500">Collect from store</div>
                    
                    </div>
                  </div>
                </button>
                <button 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    orderType === 'delivery' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  onClick={() => setOrderType('delivery')}
                >
                  <div className="flex  gap-x-5">
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="flex flex-col items-start ">
                      <div className="font-medium">Delivery</div>
                      <div className="text-sm text-gray-500">Delivered to your address</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Packaging */}
          {currentStepKey === 'packaging' && canShowPackaging && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Packaging Options</h3>
              <div className="space-y-3">
                {packagingOptions.map((opt) => (
                  <label key={opt._id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer ${selectedPackagingId === opt._id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="packaging" checked={selectedPackagingId === opt._id} onChange={() => setSelectedPackagingId(opt._id)} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {opt.name} {opt.isDefault && <span className="ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Default</span>}
                        </div>
                        <div className="text-sm text-gray-600">KES {Number(opt.price).toFixed(0)}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Timing */}
          {currentStepKey === 'timing' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">When would you like your order?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="now" 
                    name="timing" 
                    checked={!timing.isScheduled}
                    onChange={() => setTiming({ isScheduled: false, scheduledAt: null })}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="now" className="flex-1">
                    <div className="font-medium">Order now (30-45 mins)</div>
                    <div className="text-sm text-gray-500">Ready for immediate pickup/delivery</div>
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="schedule" 
                    name="timing" 
                    checked={timing.isScheduled}
                    onChange={() => setTiming({ isScheduled: true, scheduledAt: new Date().toISOString().slice(0, 16) })}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="schedule" className="flex-1">
                    <div className="font-medium">Schedule for later</div>
                    <div className="text-sm text-gray-500">Choose a specific date and time</div>
                </label>
                </div>

                {timing.isScheduled && (
                  <div className="ml-7">
                  <input
                    type="datetime-local"
                      className="input w-full max-w-sm"
                      value={timing.scheduledAt || ''}
                    onChange={(e) => setTiming({ ...timing, scheduledAt: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                  />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Address */}
          {currentStepKey === 'address' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
              {canShowAddress ? (
                <div className="space-y-3">
                  <input 
                    className="input" 
                    placeholder="Enter your delivery address" 
                    value={addressId || ''} 
                    onChange={(e) => setAddressId(e.target.value)} 
                  />
                  <p className="text-sm text-gray-500">Enter the full address where you'd like your order delivered.</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Pickup Selected</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">No delivery address required for pickup orders.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Payment */}
          {currentStepKey === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment Method</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      paymentMode === 'post_to_bill' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`} 
                    onClick={() => setPaymentMode('post_to_bill')}
                  >
                    <div className="flex  gap-x-5">
                      <div className="text-2xl mb-2">📋</div>
                      <div className="flex flex-col items-start ">
                      <div className="font-medium">Post to Bill</div>
                      <div className="text-sm text-gray-500">Pay later</div>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      paymentMode === 'pay_now' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`} 
                    onClick={() => setPaymentMode('pay_now')}
                  >
                    <div className="flex  gap-x-5">
                      <div className="text-2xl mb-2">💳</div>
                      <div className="flex flex-col items-start ">
                      <div className="font-medium">Pay Now</div>
                      <div className="text-sm text-gray-500">Pay immediately</div>
                     </div>
                    </div>

                  </button>
                </div>

                {paymentMode === 'pay_now' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3">Choose Payment Method</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === 'cash' 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <div className="flex  gap-x-5">
                          <div className="text-2xl mb-2">💵</div>
                          <div className="flex flex-col items-start ">
                            <div className="font-medium">Cash</div>
                            <div className="text-sm text-gray-500">Pay on delivery</div>
                          </div>
                        </div>
                      </button>
                      
                      <button 
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === 'mpesa_stk' 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setPaymentMethod('mpesa_stk')}
                      >
                        <div className="flex  gap-x-5">
                          <div className="text-2xl mb-2">📱</div>
                          <div className="flex flex-col items-start ">
                            <div className="font-medium">M-Pesa</div>
                            <div className="text-sm text-gray-500">STK Push</div>
                          </div>
                        </div>
                      </button>
                      
                      <button 
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === 'paystack_card' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setPaymentMethod('paystack_card')}
                      >
                        <div className="flex  gap-x-5">
                          <div className="text-2xl mb-2">💳</div>
                          <div className="flex flex-col items-start ">
                            <div className="font-medium">Card</div>
                            <div className="text-sm text-gray-500">Visa/Mastercard</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {paymentMethod === 'mpesa_stk' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input 
                          className="input w-full max-w-sm" 
                          placeholder="2547XXXXXXXX" 
                          value={payerPhone} 
                          onChange={(e) => setPayerPhone(e.target.value)} 
                        />
                      </div>
                    )}
                    
                    {paymentMethod === 'paystack_card' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input 
                          className="input w-full max-w-sm" 
                          placeholder="email@example.com" 
                          value={payerEmail} 
                          onChange={(e) => setPayerEmail(e.target.value)} 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: Summary */}
          {currentStepKey === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {activeSteps.length}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
              </div>

              {/* Order Items (no edit) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FiList className="text-gray-600" /> Order Items
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {(cart?.items || []).map((it) => (
                    <div key={it._id} className="flex items-start justify-between text-sm">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{it.productId?.title || 'Product'}</div>
                        {formatVariantOptions(it.variantOptions) && (
                          <div className="text-gray-500">{formatVariantOptions(it.variantOptions)}</div>
                        )}
                        <div className="text-gray-500">Qty: {it.quantity}</div>
                      </div>
                      <div className="font-medium text-gray-900">KES {(it.price * it.quantity).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FiShoppingBag className="text-gray-600" /> Fulfillment
                    </span>
                  </div>
                  <button onClick={() => gotoStep('orderType')} className="text-gray-400 hover:text-gray-600">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Method: <span className="font-medium capitalize">{orderType}</span>
                </div>
              </div>

              {/* Timing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FiClock className="text-gray-600" /> Timing
                    </span>
                  </div>
                  <button onClick={() => gotoStep('timing')} className="text-gray-400 hover:text-gray-600">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  When: <span className="font-medium">{timing.isScheduled ? `Scheduled for ${new Date(timing.scheduledAt).toLocaleString()}` : 'Order now (30-45 mins)'}</span>
                </div>
              </div>

              {/* Packaging (editable shortcut) */}
              {canShowPackaging && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      
                      <span className="font-medium text-gray-800 flex items-center gap-2">
                        <FiList className="text-gray-600" /> Packaging
                      </span>
                    </div>
                    <button onClick={() => gotoStep('packaging')} className="text-gray-400 hover:text-gray-600">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{packagingOptions.find(p => p._id === selectedPackagingId)?.name || 'Standard'}</span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FiCreditCard className="text-gray-600" /> Payment Method
                    </span>
                  </div>
                  <button onClick={() => gotoStep('payment')} className="text-gray-400 hover:text-gray-600">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Method: <span className="font-medium capitalize">{paymentMode === 'post_to_bill' ? 'Post to Bill' : paymentMode === 'pay_now' ? (paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'mpesa_stk' ? 'M-Pesa' : paymentMethod === 'paystack_card' ? 'Card' : 'Not selected') : 'Not selected'}</span>
                </div>
                {paymentMode === 'pay_now' && paymentMethod === 'mpesa_stk' && payerPhone && (
                  <div className="text-sm text-gray-600 mt-1">Phone: <span className="font-medium">{payerPhone}</span></div>
                )}
                {paymentMode === 'pay_now' && paymentMethod === 'paystack_card' && payerEmail && (
                  <div className="text-sm text-gray-600 mt-1">Email: <span className="font-medium">{payerEmail}</span></div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-gray-800">Price Breakdown</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">KES {totals.subtotal.toFixed(0)}</span>
                  </div>
                  <hr className="my-2" />
                  {canShowPackaging && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Packaging:</span>
                      <span className="font-medium">KES {Number(totals.packagingFee || 0).toFixed(0)}</span>
                    </div>
                  )}
                  {coupon?.code && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Coupon ({coupon.code}):</span>
                      <span>- KES {Number(totals.discount || 0).toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold mt-2">
                    <span>Total:</span>
                    <span>KES {totals.total.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-10">
          <button 
            className="btn-outline flex items-center gap-2" 
            onClick={() => currentStep === 0 ? navigate('/cart') : back()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {currentStep < activeSteps.length - 1 ? (
            <button 
              className="btn-primary flex items-center gap-2" 
              onClick={next}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button 
              className="btn-primary flex items-center gap-2" 
              onClick={handleCompleteOrder} 
              disabled={creating || paying}
            >
              {creating || paying ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete Order
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


export default Checkout




