import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { orderAPI, invoiceAPI } from '../../utils/api'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge'
import { FiArrowLeft, FiPrinter, FiMoreVertical, FiUser, FiCreditCard, FiDownload, FiCheckCircle, FiBox, FiTruck, FiCalendar, FiMapPin } from 'react-icons/fi'
import toast from 'react-hot-toast'


const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('PLACED')

  const load = async () => {
    try {
      setLoading(true)
      const res = await orderAPI.getOrderById(id)
      const ord = res.data?.data?.order
      setOrder(ord)
      setStatus(ord?.status || 'PLACED')
    } catch (e) {
      toast.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleUpdateStatus = async () => {
    try {
      setSaving(true)
      await orderAPI.updateOrderStatus(id, status)
      toast.success('Order status updated')
      await load()
    } catch (e) {
      toast.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const items = useMemo(() => order?.items || [], [order])
  const invoiceNumber = order?.invoiceId?.number || order?.invoice?.number || ''
  const receiptNumber = order?.receiptId?.receiptNumber || ''
  const customer = order?.customerId
  const billingAddress = order?.addressId?.address || null
  const orderTypeLabel = order?.type ? (order.type.charAt(0).toUpperCase() + order.type.slice(1)) : '-'
  const locationLabel = order?.location === 'in_shop' ? 'In Shop' : order?.location === 'away' ? 'Away' : '-'
  const fulfillmentLabel = order?.timing?.isScheduled ? `Scheduled: ${order?.timing?.scheduledAt ? new Date(order.timing.scheduledAt).toLocaleString() : ''}` : 'Now'
  const packagingName = order?.metadata?.packaging?.name
  const statusOrder = ['PLACED','CONFIRMED','PACKED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED']
  const currentStatusIndex = statusOrder.indexOf(order?.status || 'PLACED')
  const timelineBase = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Processing' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ]
  const timeline = timelineBase.map((step, idx) => ({
    ...step,
    completed: idx <= currentStatusIndex,
    timestamp: idx === 0 ? order?.createdAt : order?.updatedAt,
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container-sm text-gray-900">Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container-sm text-gray-900">Order not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-primary/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              <span className="font-medium">All Orders</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <FiPrinter className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <FiMoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 divide-y divide-gray-200 [&>*]:py-3">

              {/* Order Header */}
              <div >
                <div className="flex flex-col ">
                  <div>
                    <h1 className="text-2xl font-bold text-primary mb-2">Invoice #{invoiceNumber || '-'}</h1>
                    <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-4">
                  {items.map((it, idx) => {
                    const productImage = it?.productId?.primaryImage || it?.productId?.images?.find(img => img?.isPrimary)?.url || it?.productId?.images?.[0]?.url
                    const variantEntries = (() => {
                      if (!it?.variantOptions) return []
                      if (typeof it.variantOptions.entries === 'function') {
                        try { return Array.from(it.variantOptions.entries()) } catch { return [] }
                      }
                      return Object.entries(it.variantOptions || {})
                    })()
                    const variantText = variantEntries.length > 0 ? variantEntries.map(([k, v]) => `${k}: ${v}`).join(', ') : null
                    return (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        
                        <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                            {productImage ? (
                              <img src={productImage} alt={it.title} className="h-full w-full object-cover" />
                            ) : (
                            <FiBox className="h-8 w-8 text-gray-400" />
                            )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{it.title }</h4>
                          <div className="">
                            <p className="font-semibold text-gray-900">KSH {((it.unitPrice || 1) * it.quantity).toFixed(2)}</p>
                          </div>
                          {variantText && (
                            <p className="text-gray-600 text-sm">{variantText}</p>
                          )}
                          <p className="text-gray-600 text-sm">Quantity: {it.quantity}</p>
                        </div>
                        
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Order Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Payment:</span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Order:</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-button text-primary">
                    <FiMapPin className="h-3.5 w-3.5" />
                    {locationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-button text-primary">
                    {order?.type === 'delivery' ? <FiTruck className="h-3.5 w-3.5" /> : <FiBox className="h-3.5 w-3.5" />}
                    {orderTypeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-button text-primary">
                    <FiCalendar className="h-3.5 w-3.5" />
                    {fulfillmentLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details & Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiUser className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-medium">{customer?.name?.charAt(0) || 'J'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer?.name || 'Jane Doe'}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1 text-sm">
                    <p className="text-gray-600">{customer?.email || 'jane.doe@example.com'}</p>
                    <p className="text-gray-600">{customer?.phone || '+254 712 345 678'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiCreditCard className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order?.paymentPreference?.method === 'mpesa_stk' ? 'M-Pesa STK Push' : 
                         order?.paymentPreference?.method === 'paystack_card' ? 'Card (Paystack)' : 
                         order?.paymentPreference?.mode === 'cash' ? 'Cash' : 'M-Pesa STK Push'}
                      </p>
                      <p className="text-gray-600 text-sm">Receipt: {receiptNumber || 'RCP-2025-994372'}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Delivery Address (only for delivery orders) */}
              {order?.type === 'delivery' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTruck className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium text-gray-900">{order?.addressId?.name || 'Delivery Address'}</p>
                    <p>{billingAddress || '-'}</p>
                    {order?.addressId?.details && <p className="text-gray-600">{order.addressId.details}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>KSH {order?.pricing?.subtotal?.toFixed(2) || '1.00'}</span>
                </div>
                {(order?.pricing?.discounts || 0) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discounts</span>
                    <span>- KSH {order?.pricing?.discounts?.toFixed(2)}</span>
                  </div>
                )}
                {order?.type === 'delivery' && (order?.pricing?.deliveryFee || 0) > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>KSH {order?.pricing?.deliveryFee?.toFixed(2)}</span>
                  </div>
                )}
                {(order?.pricing?.packagingFee || 0) > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Packaging Fee</span>
                    <span>KSH {order?.pricing?.packagingFee?.toFixed(2)}</span>
                  </div>
                )}
                {(order?.pricing?.tax || 0) > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span>KSH {order?.pricing?.tax?.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>KSH {order?.pricing?.total?.toFixed(2) || '1.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
              <div className="space-y-4">
                {timeline.map((t, idx) => (
                  <div key={t.key} className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      t.completed ? 'bg-primary' : 'bg-gray-300'
                    }`}>
                      <FiCheckCircle className={`h-4 w-4 ${t.completed ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${t.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {t.label}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {t.timestamp ? new Date(t.timestamp).toLocaleString() : 
                         idx === 0 ? '19/09/2025, 04:18' : 
                         idx === 1 ? '19/09/2025, 08:25' : 
                         idx === 2 ? '20/09/2025, 11:30' : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => invoiceNumber && window.open(`/api/invoices/${order.invoiceId}?download=true`, '_blank')}
                className="w-full mt-6 btn-primary py-3 flex items-center justify-center gap-2"
                disabled={!order?.invoiceId}
              >
                <FiDownload className="h-4 w-4" />
                Download Invoice
              </button>

              {/* Update Status (Admin only) */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm text-gray-600 mb-2">Update Status</label>
                <div className="flex gap-2">
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {['PLACED','CONFIRMED','PACKED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button 
                    className="btn-primary px-4 py-2 text-sm" 
                    onClick={handleUpdateStatus} 
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default OrderDetail

