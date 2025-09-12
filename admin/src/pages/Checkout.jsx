import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
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

  // Payment modal & tracking
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [activePaymentId, setActivePaymentId] = useState(null)
  const [paymentView, setPaymentView] = useState({ status: 'PENDING', title: 'Payment Processing', message: 'Awaiting approval on your phone…', provider: null })
  const [orderBreakdown, setOrderBreakdown] = useState(null)
  const pollRef = useRef(null)
  const timeoutRef = useRef(null)
  const socketRef = useRef(null)

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
      const createdInvoiceId = inv?._id || inv
      setInvoiceId(createdInvoiceId)
      toast.success('Order created')
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
          setActivePaymentId(paymentId)
          setShowPaymentModal(true)
          setPaymentView({ status: 'PENDING', title: 'Payment Processing', message: 'Awaiting approval on your phone…', provider: 'mpesa' })
          startPaymentTracking({ paymentId, provider: 'mpesa', ensuredOrderId: orderId })
          toast.success('STK push sent. Complete on your phone.')
        }
      } else if (paymentMethod === 'paystack_card') {
        if (!payerEmail) return toast.error('Email required')
        const res = await paymentAPI.payInvoice({ invoiceId: targetInvoiceId, method: 'paystack_card', payerEmail })
        const paymentId = res.data?.data?.paymentId
        setActivePaymentId(paymentId)
        setShowPaymentModal(true)
        setPaymentView({ status: 'PENDING', title: 'Payment Processing', message: 'Complete the Paystack flow in the opened tab…', provider: 'paystack' })
        startPaymentTracking({ paymentId, provider: 'paystack', ensuredOrderId: orderId })
        const url = res.data?.data?.authorizationUrl
        if (url) window.open(url, '_blank')
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setPaying(false)
    }
  }

  const clearPaymentTimers = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (socketRef.current) {
      try { socketRef.current.disconnect() } catch {}
      socketRef.current = null
    }
  }

  const startPaymentTracking = ({ paymentId, provider, ensuredOrderId }) => {
    clearPaymentTimers()

    // Socket.IO subscription (best-effort)
    try {
      const baseUrl = (import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
      socketRef.current = io(baseUrl, { transports: ['websocket', 'polling'], withCredentials: false })
      socketRef.current.on('connect', () => {
        // subscribe to payment room
        socketRef.current.emit('subscribe-to-payment', String(paymentId))
      })
      socketRef.current.on('payment.updated', async (payload) => {
        if (!payload || String(payload.paymentId) !== String(paymentId)) return
        if (payload.status === 'SUCCESS') {
          clearPaymentTimers()
          setPaymentView({ status: 'SUCCESS', title: 'Order paid successfully', message: 'Payment confirmed.' , provider })
          const oid = ensuredOrderId || orderId
          if (oid) {
            try {
              const detail = await orderAPI.getOrderById(oid)
              const ord = detail?.data?.data?.order
              setOrderBreakdown(ord?.pricing || null)
            } catch {}
          }
        } else if (payload.status === 'FAILED') {
          clearPaymentTimers()
          setPaymentView({ status: 'FAILED', title: 'Order payment failed', message: 'The payment was not completed.' , provider })
        }
      })
      socketRef.current.on('receipt.created', (payload) => {
        // Optional: we could also use this to mark success and show receipt link later
      })
    } catch {}

    // Timeout after 75s
    timeoutRef.current = setTimeout(() => {
      setPaymentView((prev) => ({ ...prev, status: 'FAILED', title: 'Payment timed out', message: 'No confirmation received. You can retry the payment.' }))
      clearPaymentTimers()
    }, 75 * 1000)

    const poll = async () => {
      try {
        const payRes = await paymentAPI.getPaymentById(paymentId)
        const status = payRes?.data?.data?.payment?.status

        if (status === 'SUCCESS') {
          clearPaymentTimers()
          setPaymentView({ status: 'SUCCESS', title: 'Order paid successfully', message: 'Payment confirmed.' , provider })
          // Fetch fresh order breakdown
          const oid = ensuredOrderId || orderId
          if (oid) {
            try {
              const detail = await orderAPI.getOrderById(oid)
              const ord = detail?.data?.data?.order
              setOrderBreakdown(ord?.pricing || null)
            } catch {}
          }
          return
        }

        if (status === 'FAILED') {
          clearPaymentTimers()
          const desc = payRes?.data?.data?.payment?.rawPayload?.Body?.stkCallback?.ResultDesc
          setPaymentView({ status: 'FAILED', title: 'Order payment failed', message: desc || 'The payment was not completed.' , provider })
          return
        }

        // Pending — enrich message using provider-specific query
        if (provider === 'mpesa') {
          try {
            const q = await paymentAPI.getMpesaStatus(paymentId)
            const rc = q?.data?.data?.resultCode
            const rd = q?.data?.data?.resultDesc
            if (rc === 0) {
              // Success just in — next poll will capture SUCCESS; we can proactively treat as success
              clearPaymentTimers()
              setPaymentView({ status: 'SUCCESS', title: 'Order paid successfully', message: 'Payment confirmed.' , provider })
              const oid = ensuredOrderId || orderId
              if (oid) {
                try {
                  const detail = await orderAPI.getOrderById(oid)
                  const ord = detail?.data?.data?.order
                  setOrderBreakdown(ord?.pricing || null)
                } catch {}
              }
              return
            }
            if (rd) {
              setPaymentView((prev) => ({ ...prev, message: rd }))
            }
          } catch {}
        }

      } catch {}
    }

    // Start interval every 3s
    pollRef.current = setInterval(poll, 3000)
    // Fire immediately for faster feedback
    poll()
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
      await payInvoiceNow(ensuredInvoiceId)
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
    <>
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

    {/* Payment Modal */}
    {showPaymentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{paymentView.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{paymentView.message}</p>

          {paymentView.status === 'PENDING' && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Processing...</span>
            </div>
          )}

          {paymentView.status === 'SUCCESS' && orderBreakdown && (
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>KSh {Number(orderBreakdown.subtotal || 0).toFixed(2)}</span></div>
              {Number(orderBreakdown.discounts || 0) > 0 && (
                <div className="flex justify-between text-green-700"><span>Discounts</span><span>-KSh {Number(orderBreakdown.discounts).toFixed(2)}</span></div>
              )}
              {Number(orderBreakdown.packagingFee || 0) > 0 && (
                <div className="flex justify-between"><span>Packaging</span><span>KSh {Number(orderBreakdown.packagingFee).toFixed(2)}</span></div>
              )}
              {Number(orderBreakdown.schedulingFee || 0) > 0 && (
                <div className="flex justify-between"><span>Scheduling</span><span>KSh {Number(orderBreakdown.schedulingFee).toFixed(2)}</span></div>
              )}
              {Number(orderBreakdown.deliveryFee || 0) > 0 && (
                <div className="flex justify-between"><span>Delivery</span><span>KSh {Number(orderBreakdown.deliveryFee).toFixed(2)}</span></div>
              )}
              {Number(orderBreakdown.tax || 0) > 0 && (
                <div className="flex justify-between"><span>Tax</span><span>KSh {Number(orderBreakdown.tax).toFixed(2)}</span></div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Total</span><span>KSh {Number(orderBreakdown.total || 0).toFixed(2)}</span></div>
            </div>
          )}

          <div className="flex gap-3">
            {paymentView.status === 'SUCCESS' ? (
              <button onClick={() => navigate('/orders')} className="flex-1 btn-primary">Go to Orders</button>
            ) : paymentView.status === 'FAILED' ? (
              <>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    clearPaymentTimers()
                    // Retry payment
                    if (invoiceId) {
                      payInvoiceNow(invoiceId)
                    }
                  }}
                  className="flex-1 btn-primary"
                >
                  Retry Payment
                </button>
                <button
                  onClick={() => { setShowPaymentModal(false); clearPaymentTimers() }}
                  className="flex-1 btn-outline"
                >
                  Close
                </button>
              </>
            ) : (
              <button onClick={() => { setShowPaymentModal(false); clearPaymentTimers() }} className="flex-1 btn-outline">Hide</button>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  )
}


export default Checkout



