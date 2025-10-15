import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartAPI, orderAPI, paymentAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'


const STEPS = [
  { key: 'location', label: 'Location' },
  { key: 'orderType', label: 'Order Type' },
  { key: 'timing', label: 'Timing' },
  { key: 'address', label: 'Address' },
  { key: 'payment', label: 'Payment' },
  { key: 'summary', label: 'Summary' },
]


const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [paying, setPaying] = useState(false)

  const [location, setLocation] = useState('away')
  const [orderType, setOrderType] = useState('delivery')
  const [timing, setTiming] = useState({ isScheduled: false, scheduledAt: null })
  const [addressId, setAddressId] = useState('')
  const [paymentMode, setPaymentMode] = useState('post_to_bill')
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [payerPhone, setPayerPhone] = useState('')
  const [payerEmail, setPayerEmail] = useState('')
  const [coupon, setCoupon] = useState(() => {
    try { const raw = localStorage.getItem('appliedCoupon'); return raw ? JSON.parse(raw) : null } catch { return null }
  })
  const canShowAddress = orderType === 'delivery'

  const [orderId, setOrderId] = useState(null)
  const [invoiceId, setInvoiceId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await cartAPI.getCart()
        setCart(res.data?.data)
      } catch { toast.error('Failed to load cart') } finally { setLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    if (cart && (!cart.items || cart.items.length === 0)) navigate('/cart')
  }, [cart, navigate])

  useEffect(() => {
    if (user?.phone) setPayerPhone(user.phone)
    if (user?.email) setPayerEmail(user.email)
  }, [user])

  const totals = useMemo(() => {
    const items = cart?.items || []
    const subtotal = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0)
    const discount = Math.min(subtotal, Math.max(0, Number(coupon?.discountAmount || 0)))
    const total = subtotal - discount
    return { subtotal, discount, total }
  }, [cart, coupon])

  const activeSteps = useMemo(() => {
    return orderType === 'pickup' ? STEPS.filter((s) => s.key !== 'address') : STEPS
  }, [orderType])

  const stepKey = activeSteps[currentStep]?.key

  useEffect(() => {
    if (currentStep >= activeSteps.length) setCurrentStep(Math.max(0, activeSteps.length - 1))
  }, [activeSteps, currentStep])

  const next = () => setCurrentStep((s) => Math.min(s + 1, activeSteps.length - 1))
  const back = () => setCurrentStep((s) => Math.max(s - 1, 0))
  const gotoStep = (key) => { const idx = activeSteps.findIndex((s) => s.key === key); if (idx >= 0) setCurrentStep(idx) }

  const createOrder = async () => {
    try {
      setCreating(true)
      const payload = {
        location,
        type: orderType,
        timing,
        addressId: canShowAddress ? addressId : null,
        paymentPreference: { mode: paymentMode, method: paymentMode === 'pay_now' ? paymentMethod : null },
        packagingOptionId: null,
        couponCode: coupon?.code || null,
        cartId: null,
        metadata: {},
      }
      const res = await orderAPI.createOrder(payload)
      const createdOrderId = res.data?.data?.orderId
      setOrderId(createdOrderId)
      const orderDetail = await orderAPI.getOrderById(createdOrderId)
      const inv = orderDetail.data?.data?.order?.invoiceId
      const createdInvoiceId = inv?._id || inv
      setInvoiceId(createdInvoiceId)
      try { const c = await cartAPI.getCart(); setCart(c.data?.data) } catch {}
      try { localStorage.removeItem('appliedCoupon') } catch {}
      return { orderId: createdOrderId, invoiceId: createdInvoiceId }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create order')
      throw e
    } finally { setCreating(false) }
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
        const paymentId = res.data?.data?.paymentId
        const checkoutRequestId = res.data?.data?.daraja?.checkoutRequestId
        const params = new URLSearchParams({ method: 'mpesa', paymentId, orderId: targetOrderId, provider: 'mpesa', checkoutRequestId: checkoutRequestId || '', invoiceId: targetInvoiceId, payerPhone })
        navigate(`/payment-status?${params.toString()}`)
        toast.success('STK push sent')
      } else if (paymentMethod === 'paystack_card') {
        if (!payerEmail) return toast.error('Email required')
        const res = await paymentAPI.payInvoice({ invoiceId: targetInvoiceId, method: 'paystack_card', payerEmail })
        const paymentId = res.data?.data?.paymentId
        const reference = res.data?.data?.reference
        const params = new URLSearchParams({ method: 'paystack', paymentId, orderId: targetOrderId, provider: 'paystack', reference: reference || '', invoiceId: targetInvoiceId, payerEmail })
        navigate(`/payment-status?${params.toString()}`)
        const url = res.data?.data?.authorizationUrl
        if (url) window.open(url, '_blank')
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to initiate payment')
    } finally { setPaying(false) }
  }

  const handleComplete = async () => {
    if (paymentMode === 'post_to_bill' || (paymentMode === 'pay_now' && paymentMethod === 'cash')) {
      try {
        setCreating(true)
        const payload = {
          location,
          type: orderType,
          timing,
          addressId: canShowAddress ? addressId : null,
          paymentPreference: { mode: paymentMode, method: paymentMode === 'pay_now' ? paymentMethod : null },
          packagingOptionId: null,
          couponCode: coupon?.code || null,
          cartId: null,
          metadata: {},
        }
        try { localStorage.setItem('checkoutData', JSON.stringify({ payload, method: paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash' })) } catch {}
        const res = await orderAPI.createOrder(payload)
        const createdOrderId = res.data?.data?.orderId
        const orderDetail = await orderAPI.getOrderById(createdOrderId)
        const inv = orderDetail.data?.data?.order?.invoiceId
        const createdInvoiceId = inv?._id || inv
        try { const c = await cartAPI.getCart(); setCart(c.data?.data) } catch {}
        try { localStorage.removeItem('appliedCoupon') } catch {}
        const method = paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
        const params = new URLSearchParams({ method, orderId: createdOrderId, invoiceId: createdInvoiceId })
        navigate(`/payment-status?${params.toString()}`)
      } catch (error) {
        const method = paymentMode === 'post_to_bill' ? 'post_to_bill' : 'cash'
        const params = new URLSearchParams({ method, error: error?.response?.data?.message || 'Failed to create order' })
        navigate(`/payment-status?${params.toString()}`)
      } finally { setCreating(false) }
      return
    }
    if (paymentMode === 'pay_now' && (paymentMethod === 'mpesa_stk' || paymentMethod === 'paystack_card')) {
      let ensuredOrderId = orderId
      let ensuredInvoiceId = invoiceId
      if (!ensuredOrderId || !ensuredInvoiceId) {
        const created = await createOrder()
        ensuredOrderId = created?.orderId
        ensuredInvoiceId = created?.invoiceId
      }
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
          <div className="text-xs text-gray-600">Step {currentStep + 1} of {activeSteps.length}</div>
        </div>

        <div className="space-y-6">
          {stepKey === 'location' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Where are you ordering from?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className={`p-4 rounded-lg border-2 ${location === 'in_shop' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`} onClick={() => setLocation('in_shop')}>In Shop</button>
                <button className={`p-4 rounded-lg border-2 ${location === 'away' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`} onClick={() => setLocation('away')}>Away</button>
              </div>
            </div>
          )}

          {stepKey === 'orderType' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">How would you like to receive your order?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className={`p-4 rounded-lg border-2 ${orderType === 'pickup' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`} onClick={() => setOrderType('pickup')}>Pickup</button>
                <button className={`p-4 rounded-lg border-2 ${orderType === 'delivery' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`} onClick={() => setOrderType('delivery')}>Delivery</button>
              </div>
            </div>
          )}

          {stepKey === 'timing' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">When would you like your order?</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!timing.isScheduled} onChange={() => setTiming({ isScheduled: false, scheduledAt: null })} />
                  <span>Order now</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={timing.isScheduled} onChange={() => setTiming({ isScheduled: true, scheduledAt: new Date().toISOString().slice(0, 16) })} />
                  <span>Schedule for later</span>
                </label>
                {timing.isScheduled && (
                  <input type="datetime-local" className="input w-full max-w-sm" value={timing.scheduledAt || ''} min={new Date().toISOString().slice(0, 16)} onChange={(e) => setTiming({ ...timing, scheduledAt: e.target.value })} />
                )}
              </div>
            </div>
          )}

          {stepKey === 'address' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
              {canShowAddress ? (
                <input className="input" placeholder="Enter your delivery address" value={addressId} onChange={(e) => setAddressId(e.target.value)} />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">Pickup selected</div>
              )}
            </div>
          )}

          {stepKey === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className={`p-4 rounded-lg border-2 ${paymentMode === 'post_to_bill' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`} onClick={() => setPaymentMode('post_to_bill')}>Post to Bill</button>
                <button className={`p-4 rounded-lg border-2 ${paymentMode === 'pay_now' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`} onClick={() => setPaymentMode('pay_now')}>Pay Now</button>
              </div>
              {paymentMode === 'pay_now' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className={`p-3 rounded-lg border-2 ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`} onClick={() => setPaymentMethod('cash')}>Cash</button>
                    <button className={`p-3 rounded-lg border-2 ${paymentMethod === 'mpesa_stk' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`} onClick={() => setPaymentMethod('mpesa_stk')}>M‑Pesa</button>
                    <button className={`p-3 rounded-lg border-2 ${paymentMethod === 'paystack_card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`} onClick={() => setPaymentMethod('paystack_card')}>Card</button>
                  </div>
                  {paymentMethod === 'mpesa_stk' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input className="input w-full max-w-sm" placeholder="2547XXXXXXXX" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} />
                    </div>
                  )}
                  {paymentMethod === 'paystack_card' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input className="input w-full max-w-sm" placeholder="email@example.com" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {stepKey === 'summary' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2 font-medium">Order Items</div>
                <div className="space-y-2 text-sm">
                  {(cart?.items || []).map((it) => (
                    <div key={it._id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{it.productId?.title || 'Product'}</div>
                        <div className="text-gray-500">Qty: {it.quantity}</div>
                      </div>
                      <div className="font-medium text-gray-900">KES {(Number(it.price || 0) * Number(it.quantity || 0)).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2 font-medium">Price Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal:</span><span className="font-medium">KES {totals.subtotal.toFixed(0)}</span></div>
                  {coupon?.code && <div className="flex justify-between text-sm text-green-700"><span>Coupon ({coupon.code}):</span><span>- KES {totals.discount.toFixed(0)}</span></div>}
                  <div className="flex justify-between text-base font-semibold mt-2"><span>Total:</span><span>KES {totals.total.toFixed(0)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-10">
          <button className="btn-outline" onClick={() => currentStep === 0 ? navigate('/cart') : back()}>Back</button>
          {currentStep < activeSteps.length - 1 ? (
            <button className="btn-primary" onClick={next}>Next</button>
          ) : (
            <button className="btn-primary" onClick={handleComplete} disabled={creating || paying}>{creating || paying ? 'Processing...' : 'Complete Order'}</button>
          )}
        </div>
      </div>
    </div>
  )
}


export default Checkout


