import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartAPI, orderAPI, paymentAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'


const steps = [
  'Location',
  'Order Type',
  'Packaging',
  'Timing',
  'Address',
  'Payment',
  'Summary',
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




const CheckmarksRow = ({ current }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
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
            }`}></div>
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
  const canShowPackaging = (cart?.items || []).some((it) => Boolean(it.packagingOptions?.length))

  useEffect(() => {
    const load = async () => {
      try {
        const res = await cartAPI.getCart()
        setCart(res.data?.data)
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
      toast.error('Your cart is empty')
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

  const totals = useMemo(() => {
    const items = cart?.items || []
    const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0)
    return { subtotal, total: subtotal }
  }, [cart])

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  const back = () => setCurrentStep((s) => Math.max(s - 1, 0))

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
        packagingSelections: [],
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
      } catch (cartError) {
        console.warn('Failed to refresh cart:', cartError)
        // Don't fail the order creation if cart refresh fails
      }
      
      return { orderId: createdOrderId, invoiceId: createdInvoiceId }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create order')
      throw e
    } finally {
      setCreating(false)
    }
  }

  const payInvoiceNow = async (explicitInvoiceId) => {
    const targetInvoiceId = explicitInvoiceId || invoiceId
    if (!targetInvoiceId) return
    try {
      setPaying(true)
      if (paymentMethod === 'mpesa_stk') {
        if (!payerPhone) return toast.error('Phone required')
        const res = await paymentAPI.payInvoice({ invoiceId: targetInvoiceId, method: 'mpesa_stk', payerPhone })
        if (res.data?.success) {
          const paymentId = res.data?.data?.paymentId
          const checkoutRequestId = res.data?.data?.daraja?.checkoutRequestId
          
          // Navigate to payment status page instead of showing modal
          const params = new URLSearchParams({
            paymentId,
            orderId: orderId,
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
        
        // Navigate to payment status page instead of showing modal
        const params = new URLSearchParams({
          paymentId,
          orderId: orderId,
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
    // 1) Ensure order (+ invoice) exists
    let ensuredOrderId = orderId
    let ensuredInvoiceId = invoiceId

    if (!ensuredOrderId || !ensuredInvoiceId) {
      const created = await createOrder()
      ensuredOrderId = created?.orderId
      ensuredInvoiceId = created?.invoiceId
    }

    // 2) If pay now, initiate payment immediately using the ensured invoice id
    if (paymentMode === 'pay_now' && paymentMethod) {
      if (paymentMethod === 'cash') {
        toast.success('Order placed. Collect cash at counter.')
      } else {
        await payInvoiceNow(ensuredInvoiceId)
      }
    } else if (paymentMode === 'post_to_bill') {
      toast.success('Order posted to bill.')
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
        <h1 className="text-sm text-primary font-semibold">{steps[currentStep]}</h1>
          <div className="text-xs text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

        {/* Checkmarks Row */}
        <CheckmarksRow current={currentStep} />

        {/* Step content */}
        <div className="">
          {currentStep === 0 && (
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
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏪</div>
                    <div className="font-medium">In Shop</div>
                    <div className="text-sm text-gray-500">Ordering while in the store</div>
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
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="font-medium">Away</div>
                    <div className="text-sm text-gray-500">Ordering from home or office</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
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
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="font-medium">Pickup</div>
                    <div className="text-sm text-gray-500">Collect from store</div>
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
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="font-medium">Delivery</div>
                    <div className="text-sm text-gray-500">Delivered to your address</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Packaging Options</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Standard Packaging</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">Your items will be packaged in our standard eco-friendly packaging.</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
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

          {currentStep === 4 && (
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

          {currentStep === 5 && (
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
                    <div className="text-center">
                      <div className="text-2xl mb-2">📋</div>
                      <div className="font-medium">Post to Bill</div>
                      <div className="text-sm text-gray-500">Pay later</div>
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
                    <div className="text-center">
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-medium">Pay Now</div>
                      <div className="text-sm text-gray-500">Pay immediately</div>
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
                        <div className="flex items-center gap-2">
                          <div className="text-xl">💵</div>
                          <div>
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
                        <div className="flex items-center gap-2">
                          <div className="text-xl">📱</div>
                          <div>
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
                        <div className="flex items-center gap-2">
                          <div className="text-xl">💳</div>
                          <div>
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

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {steps.length}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Order Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Fulfillment</h3>
                    <div className="text-sm text-gray-600">
                      Method: <span className="font-medium capitalize">{orderType}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Timing</h3>
                    <div className="text-sm text-gray-600">
                      When: <span className="font-medium">
                        {timing.isScheduled 
                          ? `Scheduled for ${new Date(timing.scheduledAt).toLocaleString()}` 
                          : 'Order now (30-45 mins)'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Payment Method</h3>
                    <div className="text-sm text-gray-600">
                      Method: <span className="font-medium capitalize">
                        {paymentMode === 'post_to_bill' ? 'Post to Bill' : 
                         paymentMode === 'pay_now' ? (
                           paymentMethod === 'cash' ? 'Cash' :
                           paymentMethod === 'mpesa_stk' ? 'M-Pesa' : 
                           paymentMethod === 'paystack_card' ? 'Card' : 'Not selected'
                         ) : 'Not selected'}
                      </span>
                    </div>
                    {paymentMode === 'pay_now' && paymentMethod === 'mpesa_stk' && payerPhone && (
                      <div className="text-sm text-gray-600 mt-1">
                        Phone: <span className="font-medium">{payerPhone}</span>
                      </div>
                    )}
                    {paymentMode === 'pay_now' && paymentMethod === 'paystack_card' && payerEmail && (
                      <div className="text-sm text-gray-600 mt-1">
                        Email: <span className="font-medium">{payerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Price Breakdown */}
            <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Price Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">KES {totals.subtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Charge:</span>
                        <span className="font-medium">KES 53</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Packaging:</span>
                        <span className="font-medium">KES 60</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total:</span>
                        <span>KES {(totals.subtotal + 53 + 60).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">Order Items</h3>
                    <div className="text-sm text-green-700">
                      {cart?.items?.length || 0} item{(cart?.items?.length || 0) !== 1 ? 's' : ''} in your order
                    </div>
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
            onClick={back} 
            disabled={currentStep === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {currentStep < steps.length - 1 ? (
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



