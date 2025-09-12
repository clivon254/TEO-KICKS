import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartAPI, orderAPI, paymentAPI, invoiceAPI, receiptAPI } from '../utils/api'
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


const Stepper = ({ current, onGoto }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {steps.map((label, idx) => (
        <button
          key={label}
          onClick={() => onGoto(idx)}
          className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
            idx === current ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          {idx + 1}. {label}
        </button>
      ))}
    </div>
  )
}


const Checkout = () => {
  const navigate = useNavigate()

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
      setInvoiceId(inv?._id || inv)
      toast.success('Order created')
      return createdOrderId
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create order')
      throw e
    } finally {
      setCreating(false)
    }
  }

  const payInvoiceNow = async () => {
    if (!invoiceId) return
    try {
      setPaying(true)
      if (paymentMethod === 'mpesa_stk') {
        if (!payerPhone) return toast.error('Phone required')
        const res = await paymentAPI.payInvoice({ invoiceId, method: 'mpesa_stk', payerPhone })
        if (res.data?.success) {
          toast.success('STK push sent. Complete on your phone.')
        }
      } else if (paymentMethod === 'paystack_card') {
        if (!payerEmail) return toast.error('Email required')
        const res = await paymentAPI.payInvoice({ invoiceId, method: 'paystack_card', payerEmail })
        const url = res.data?.data?.authorizationUrl
        if (url) {
          window.open(url, '_blank')
        }
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setPaying(false)
    }
  }

  const handleCompleteOrder = async () => {
    // 1) Create order (+ invoice)
    const id = orderId || await createOrder()

    // 2) If pay now, initiate payment
    if (paymentMode === 'pay_now' && paymentMethod) {
      await payInvoiceNow()
    } else if (paymentMode === 'cash') {
      toast.success('Order placed. Collect cash at counter.')
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

        <Stepper current={currentStep} onGoto={setCurrentStep} />

        {/* Step content */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          {currentStep === 0 && (
            <div className="space-y-3">
              <label className="font-medium">Location</label>
              <div className="flex gap-3">
                <button className={`btn-outline ${location === 'in_shop' ? 'bg-secondary-button' : ''}`} onClick={() => setLocation('in_shop')}>In shop</button>
                <button className={`btn-outline ${location === 'away' ? 'bg-secondary-button' : ''}`} onClick={() => setLocation('away')}>Away</button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-3">
              <label className="font-medium">Order Type</label>
              <div className="flex gap-3">
                <button className={`btn-outline ${orderType === 'pickup' ? 'bg-secondary-button' : ''}`} onClick={() => setOrderType('pickup')}>Pickup</button>
                <button className={`btn-outline ${orderType === 'delivery' ? 'bg-secondary-button' : ''}`} onClick={() => setOrderType('delivery')}>Delivery</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <label className="font-medium">Packaging</label>
              <p className="text-sm text-gray-500">Optional — demo placeholder.</p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <label className="font-medium">Timing</label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={timing.isScheduled} onChange={(e) => setTiming({ ...timing, isScheduled: e.target.checked })} />
                  Schedule for later
                </label>
                {timing.isScheduled && (
                  <input
                    type="datetime-local"
                    className="input w-64"
                    onChange={(e) => setTiming({ ...timing, scheduledAt: e.target.value })}
                  />
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              <label className="font-medium">Delivery Address</label>
              {canShowAddress ? (
                <input className="input" placeholder="Enter Address ID (demo)" value={addressId || ''} onChange={(e) => setAddressId(e.target.value)} />
              ) : (
                <p className="text-sm text-gray-500">Pickup selected. No address required.</p>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <label className="font-medium">Payment</label>
              <div className="flex gap-2 flex-wrap">
                <button className={`btn-outline ${paymentMode === 'post_to_bill' ? 'bg-secondary-button' : ''}`} onClick={() => setPaymentMode('post_to_bill')}>Post to Bill</button>
                <button className={`btn-outline ${paymentMode === 'cash' ? 'bg-secondary-button' : ''}`} onClick={() => setPaymentMode('cash')}>Cash</button>
                <button className={`btn-outline ${paymentMode === 'pay_now' ? 'bg-secondary-button' : ''}`} onClick={() => setPaymentMode('pay_now')}>Pay Now</button>
              </div>

              {paymentMode === 'pay_now' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button className={`btn-outline ${paymentMethod === 'mpesa_stk' ? 'bg-secondary-button' : ''}`} onClick={() => setPaymentMethod('mpesa_stk')}>M‑Pesa STK</button>
                    <button className={`btn-outline ${paymentMethod === 'paystack_card' ? 'bg-secondary-button' : ''}`} onClick={() => setPaymentMethod('paystack_card')}>Paystack Card</button>
                  </div>

                  {paymentMethod === 'mpesa_stk' && (
                    <input className="input w-64" placeholder="2547XXXXXXXX" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} />
                  )}
                  {paymentMethod === 'paystack_card' && (
                    <input className="input w-64" placeholder="email@example.com" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} />
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <label className="font-medium">Summary</label>
              <div className="text-sm text-gray-700">Items: {(cart?.items || []).length}</div>
              <div className="text-sm text-gray-700">Subtotal: KSh {totals.subtotal.toFixed(2)}</div>
              <div className="text-sm text-gray-700">Total: KSh {totals.total.toFixed(2)}</div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between">
          <button className="btn-outline" onClick={back} disabled={currentStep === 0}>Back</button>

          {currentStep < steps.length - 1 ? (
            <button className="btn-primary" onClick={next}>Next</button>
          ) : (
            <button className="btn-primary" onClick={handleCompleteOrder} disabled={creating || paying}>
              {creating || paying ? 'Processing...' : 'Complete Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


export default Checkout

