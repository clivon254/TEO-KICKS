import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { orderAPI } from '../../utils/api'
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

  if (loading) {
    return (
      <div className="p-4">
        <div className="container-sm">Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4">
        <div className="container-sm">Order not found</div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="container-sm">
        <div className="mb-4">
          <button className="btn-outline mb-2" onClick={() => navigate('/orders')}>Back to Orders</button>
          <h1 className="title2">Order {order?.invoiceId?.number || order._id}</h1>
          <p className="text-gray-600">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="divide-y">
              {items.map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{it.title}</div>
                    <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                  </div>
                  <div className="text-sm text-gray-900">KSh {(it.unitPrice * it.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>KSh {order?.pricing?.subtotal?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Total</span><span className="font-semibold">KSh {order?.pricing?.total?.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Order Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {['PLACED','CONFIRMED','PACKED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button className="btn-primary w-full" onClick={handleUpdateStatus} disabled={saving}>{saving ? 'Saving...' : 'Update Status'}</button>
              <div className="text-xs text-gray-500">Payment: <span className="font-medium">{order.paymentStatus}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default OrderDetail

