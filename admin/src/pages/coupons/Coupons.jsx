import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiFilter, FiX, FiEdit2, FiTrash2, FiEye, FiPlus, FiRefreshCw, FiList } from 'react-icons/fi'
import { useGetAllCoupons, useDeleteCoupon } from '../../hooks/useCoupons'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'


const Coupons = () => {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [discountTypeFilter, setDiscountTypeFilter] = useState('all')
    const [selectedCoupons, setSelectedCoupons] = useState([])
    const [deleteModal, setDeleteModal] = useState({ show: false, couponId: null })

    // Get all coupons
    const {
        data: couponsData,
        isLoading,
        error,
        refetch
    } = useGetAllCoupons({ 
        page: currentPage, 
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
    })

    const deleteCouponMutation = useDeleteCoupon()

    const coupons = couponsData?.data?.data?.coupons || []
    const pagination = couponsData?.data?.data?.pagination



    // Handle clear search
    const clearSearch = () => {
        setSearchTerm('')
        setStatusFilter('all')
        setDiscountTypeFilter('all')
        setCurrentPage(1)
        refetch()
    }



    // Handle select coupon
    const handleSelectCoupon = (couponId) => {
        setSelectedCoupons(prev => 
            prev.includes(couponId) 
                ? prev.filter(id => id !== couponId)
                : [...prev, couponId]
        )
    }

    // Handle select all
    const handleSelectAll = () => {
        if (selectedCoupons.length === coupons.length) {
            setSelectedCoupons([])
        } else {
            setSelectedCoupons(coupons.map(coupon => coupon._id))
        }
    }

    // Handle delete coupon
    const handleDeleteCoupon = async () => {
        try {
            await deleteCouponMutation.mutateAsync(deleteModal.couponId)
            setDeleteModal({ show: false, couponId: null })
            refetch()
            toast.success('Coupon deleted successfully')
        } catch (error) {
            toast.error('Failed to delete coupon')
        }
    }

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedCoupons.length === 0) {
            toast.error('Please select coupons to delete')
            return
        }

        try {
            // Delete multiple coupons
            await Promise.all(selectedCoupons.map(couponId => 
                deleteCouponMutation.mutateAsync(couponId)
            ))
            setSelectedCoupons([])
            refetch()
            toast.success(`${selectedCoupons.length} coupons deleted successfully`)
        } catch (error) {
            toast.error('Failed to delete some coupons')
        }
    }

    // Format discount value
    const formatDiscountValue = (coupon) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}%`
        } else {
            return `$${coupon.discountValue.toFixed(2)}`
        }
    }

    // Get status for coupon
    const getCouponStatus = (coupon) => {
        if (!coupon.isActive) return 'inactive'
        if (coupon.isExpired) return 'expired'
        if (coupon.isUsageLimitReached) return 'limit-reached'
        return 'active'
    }

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
            </div>
        </div>
    )

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Coupons Management</h1>
                <p className="text-gray-600 mt-1">Manage discount coupons and promotional codes</p>
            </div>

            {/* Search Bar and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search coupons by code, name, or description..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                                refetch()
                            }}
                            className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Clear search"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="sm:w-auto">
                    <button
                        onClick={() => navigate('/coupons/add')}
                        className="btn-primary inline-flex items-center justify-center w-full sm:w-auto"
                    >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Add Coupon
                    </button>
                </div>
            </div>

            {/* Coupon Count and Filters */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <p className="text-sm text-gray-600">Total {pagination?.totalCoupons || 0} coupons</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setCurrentPage(1)
                                refetch()
                            }}
                            className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                        >
                            <option value="all">Status: All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                            <option value="limit-reached">Limit Reached</option>
                        </select>
                    </div>

                    {/* Discount Type Filter */}
                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                        <select
                            value={discountTypeFilter}
                            onChange={(e) => {
                                setDiscountTypeFilter(e.target.value)
                                setCurrentPage(1)
                                refetch()
                            }}
                            className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                        >
                            <option value="all">Type: All</option>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                    </div>

                    {/* Rows per page */}
                    <div className="relative">
                        <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                        <select
                            value={10}
                            onChange={(e) => { /* Handle rows per page */ }}
                            className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                        >
                            <option value={5}>Rows: 5</option>
                            <option value={10}>Rows: 10</option>
                            <option value={20}>Rows: 20</option>
                            <option value={50}>Rows: 50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedCoupons.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800">
                            {selectedCoupons.length} coupon(s) selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupons Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-6">
                        <LoadingSkeleton />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <p className="text-red-600">Failed to load coupons. Please try again.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedCoupons.length === coupons.length && coupons.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Coupon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Discount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expiry
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {coupons.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <FiSearch className="h-12 w-12 text-gray-300 mb-4" />
                                                    <p className="text-lg font-medium">No coupons found</p>
                                                    <p className="text-sm">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        coupons.map((coupon) => (
                                            <tr key={coupon._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCoupons.includes(coupon._id)}
                                                        onChange={() => handleSelectCoupon(coupon._id)}
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {coupon.code}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {coupon.name}
                                                        </div>
                                                        {coupon.description && (
                                                            <div className="text-xs text-gray-400 truncate max-w-xs">
                                                                {coupon.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDiscountValue(coupon)}
                                                    </div>
                                                    {coupon.minimumOrderAmount > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            Min: ${coupon.minimumOrderAmount}
                                                        </div>
                                                    )}
                                                    {coupon.maximumDiscountAmount && (
                                                        <div className="text-xs text-gray-500">
                                                            Max: ${coupon.maximumDiscountAmount}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {coupon.usedCount} used
                                                    </div>
                                                    {coupon.hasUsageLimit && (
                                                        <div className="text-xs text-gray-500">
                                                            Limit: {coupon.usageLimit}
                                                        </div>
                                                    )}
                                                    {coupon.remainingUsage !== null && (
                                                        <div className="text-xs text-gray-500">
                                                            {coupon.remainingUsage} remaining
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {coupon.hasExpiry ? (
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500">
                                                            No expiry
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={getCouponStatus(coupon)} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(coupon.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/coupons/${coupon._id}`)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="View Coupon"
                                                        >
                                                            <FiEye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/coupons/${coupon._id}/edit`)}
                                                            className="text-gray-600 hover:text-gray-900 transition-colors"
                                                            title="Edit Coupon"
                                                        >
                                                            <FiEdit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModal({
                                                                show: true,
                                                                couponId: coupon._id
                                                            })}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete Coupon"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={pagination.totalCoupons}
                                    pageSize={10}
                                    currentPageCount={coupons.length}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delete Coupon
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this coupon? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, couponId: null })}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCoupon}
                                disabled={deleteCouponMutation.isPending}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleteCouponMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default Coupons 