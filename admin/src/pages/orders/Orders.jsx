import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI, adminOrderAPI } from '../../utils/api'
import { FiSearch, FiX, FiFilter, FiList, FiAlertTriangle, FiEye, FiTrash2, FiTag, FiPlus } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge'
import toast from 'react-hot-toast'


const Orders = () => {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [filterCreatedBy, setFilterCreatedBy] = useState('all')
  const [filterCustomerType, setFilterCustomerType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [confirmDelete, setConfirmDelete] = useState({ open: false, order: null })

  const [isLoading, setIsLoading] = useState(false)
  const [ordersData, setOrdersData] = useState({ orders: [], pagination: {} })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  const params = useMemo(() => {
    const p = {}
    if (filterStatus !== 'all') p.status = filterStatus
    if (filterPayment !== 'all') p.paymentStatus = filterPayment
    if (filterType !== 'all') p.type = filterType
    if (filterLocation !== 'all') p.location = filterLocation
    if (filterCreatedBy !== 'all') p.createdBy = filterCreatedBy
    if (filterCustomerType !== 'all') p.customerType = filterCustomerType
    if (debouncedSearch) p.search = debouncedSearch
    p.page = currentPage
    p.limit = itemsPerPage
    return p
  }, [filterStatus, filterPayment, filterType, filterLocation, filterCreatedBy, filterCustomerType, debouncedSearch, currentPage, itemsPerPage])

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await adminOrderAPI.getAllOrders(params)
      const payload = res.data?.data || {}
      setOrdersData({
        orders: payload.orders || [],
        pagination: payload.pagination || {}
      })
    } catch (e) {
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const orders = ordersData.orders
  const pagination = ordersData.pagination
  const totalItems = pagination.totalItems || orders.length
  const totalPages = Math.max(1, pagination.totalPages || Math.ceil((totalItems || 0) / (itemsPerPage || 1)))

  const handleSelectOrder = useCallback((orderId) => {
    setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId])
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedOrders(prev => (prev.length === orders.length ? [] : orders.map(o => o._id)))
  }, [orders])

  const handleDelete = useCallback((order) => {
    setConfirmDelete({ open: true, order })
  }, [])

  const confirmDeleteOrder = useCallback(async () => {
    try {
      await orderAPI.deleteOrder(confirmDelete.order._id)
      setConfirmDelete({ open: false, order: null })
      loadOrders()
      toast.success('Order deleted')
    } catch (e) {
      toast.error('Failed to delete order')
    }
  }, [confirmDelete.order, loadOrders])

  const clearSearch = useCallback(() => { setSearchTerm(''); setCurrentPage(1) }, [])
  const clearFilters = useCallback(() => {
    setFilterStatus('all'); setFilterPayment('all'); setFilterType('all'); setFilterLocation('all'); setFilterCreatedBy('all'); setFilterCustomerType('all'); setCurrentPage(1)
  }, [])

  const goToDetails = (orderId) => navigate(`/orders/${orderId}`)

  return (
    <div className="p-4">

      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this order?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirmDelete({ open: false, order: null })} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDeleteOrder} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-4">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h1 className="title2">Orders</h1>
            <p className="text-gray-600">Manage customer orders, statuses, and payments</p>
          </div>
          <button
            onClick={() => navigate('/orders/create')}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Create Order
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by order number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {searchTerm && (
                <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search">
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
              <option value="all">Status: All</option>
              <option value="PLACED">Placed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PACKED">Packed</option>
              <option value="OUT_FOR_DELIVERY">Out for delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="relative">
            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
              <option value="all">Payment: All</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
              <option value="all">Type: All</option>
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
              <option value="all">Location: All</option>
              <option value="in_shop">In shop</option>
              <option value="away">Away</option>
            </select>
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            <select value={filterCreatedBy} onChange={(e) => setFilterCreatedBy(e.target.value)} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
              <option value="all">Created By: All</option>
              <option value="customer">Customer Created</option>
              <option value="admin">Admin Created</option>
            </select>
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            <select value={filterCustomerType} onChange={(e) => setFilterCustomerType(e.target.value)} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
              <option value="all">Customer Type: All</option>
              <option value="registered">Registered</option>
              <option value="guest">Guest</option>
              <option value="anonymous">Anonymous</option>
            </select>
          </div>

          {(filterStatus !== 'all' || filterPayment !== 'all' || filterType !== 'all' || filterLocation !== 'all' || filterCreatedBy !== 'all' || filterCustomerType !== 'all') && (
            <button onClick={clearFilters} className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
              <FiX className="h-3 w-3" />
              Clear
            </button>
          )}

          <div className="relative">
            <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
              {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows: {n}</option>))}
            </select>
          </div>
        </div>
      </header>

      <div className="bg-light rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">📦</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">Orders will appear here once created.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-light">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" checked={selectedOrders.length === orders.length && orders.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 text-primary focus:ring-primary" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-light">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" checked={selectedOrders.includes(order._id)} onChange={() => handleSelectOrder(order._id)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order?.invoice?.number || order._id}</div>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{order?.customer?.name || order?.guestCustomerInfo?.name || 'Anonymous'}</div>
                        {order?.customerType && (
                          <div className="text-xs text-gray-500 capitalize">
                            {order.customerType === 'registered' && 'Registered'}
                            {order.customerType === 'guest' && 'Guest'}
                            {order.customerType === 'anonymous' && 'Anonymous'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.isAdminCreated 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.isAdminCreated ? 'Admin' : 'Customer'}
                          </span>
                          {order?.createdBy?.name && (
                            <span className="text-xs text-gray-500">{order.createdBy.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><PaymentStatusBadge status={order.paymentStatus} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {order?.pricing?.total?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => goToDetails(order._id)} className="text-blue-600 hover:text-blue-900" title="View order">
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(order)} className="text-red-600 hover:text-red-900" title="Delete order">
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.currentPage || currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                  totalItems={totalItems}
                  pageSize={itemsPerPage}
                  currentPageCount={orders.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}


export default Orders

