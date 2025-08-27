import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiFilter, FiX, FiEdit2, FiTrash2, FiEye, FiCheck, FiX as FiXIcon } from 'react-icons/fi'
import { useGetAllReviews, useDeleteReview, useApproveReview } from '../../hooks/useReviews'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'


const Reviews = () => {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [ratingFilter, setRatingFilter] = useState('all')
    const [selectedReviews, setSelectedReviews] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [deleteModal, setDeleteModal] = useState({ show: false, reviewId: null })
    const [approveModal, setApproveModal] = useState({ show: false, reviewId: null, isApproved: true })

    // Get all reviews
    const {
        data: reviewsData,
        isLoading,
        error,
        refetch
    } = useGetAllReviews({ 
        page: currentPage, 
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        rating: ratingFilter !== 'all' ? ratingFilter : undefined
    })

    const deleteReviewMutation = useDeleteReview()
    const approveReviewMutation = useApproveReview()

    const reviews = reviewsData?.data?.data?.reviews || []
    const pagination = reviewsData?.data?.data?.pagination

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        refetch()
    }

    // Handle clear search
    const clearSearch = () => {
        setSearchTerm('')
        setCurrentPage(1)
        refetch()
    }

    // Handle clear filters
    const clearFilters = () => {
        setStatusFilter('all')
        setRatingFilter('all')
        setCurrentPage(1)
        refetch()
    }

    // Handle select review
    const handleSelectReview = (reviewId) => {
        setSelectedReviews(prev => 
            prev.includes(reviewId) 
                ? prev.filter(id => id !== reviewId)
                : [...prev, reviewId]
        )
    }

    // Handle select all
    const handleSelectAll = () => {
        if (selectedReviews.length === reviews.length) {
            setSelectedReviews([])
        } else {
            setSelectedReviews(reviews.map(review => review._id))
        }
    }

    // Handle delete review
    const handleDeleteReview = async () => {
        try {
            await deleteReviewMutation.mutateAsync(deleteModal.reviewId)
            setDeleteModal({ show: false, reviewId: null })
            refetch()
            toast.success('Review deleted successfully')
        } catch (error) {
            toast.error('Failed to delete review')
        }
    }

    // Handle approve/reject review
    const handleApproveReview = async () => {
        try {
            await approveReviewMutation.mutateAsync({
                reviewId: approveModal.reviewId,
                isApproved: approveModal.isApproved
            })
            setApproveModal({ show: false, reviewId: null, isApproved: true })
            refetch()
            toast.success(`Review ${approveModal.isApproved ? 'approved' : 'rejected'} successfully`)
        } catch (error) {
            toast.error(`Failed to ${approveModal.isApproved ? 'approve' : 'reject'} review`)
        }
    }

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedReviews.length === 0) {
            toast.error('Please select reviews to delete')
            return
        }

        try {
            // Delete multiple reviews
            await Promise.all(selectedReviews.map(reviewId => 
                deleteReviewMutation.mutateAsync(reviewId)
            ))
            setSelectedReviews([])
            refetch()
            toast.success(`${selectedReviews.length} reviews deleted successfully`)
        } catch (error) {
            toast.error('Failed to delete some reviews')
        }
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
                    <p className="text-gray-600 mt-1">Manage all product reviews in the system</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <form onSubmit={handleSearch} className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search reviews by product name, user name, or comment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <FiFilter className="h-4 w-4" />
                        Filters
                        {showFilters && <FiX className="h-4 w-4" />}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating
                                </label>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedReviews.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800">
                            {selectedReviews.length} review(s) selected
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

            {/* Reviews Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-6">
                        <LoadingSkeleton />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <p className="text-red-600">Failed to load reviews. Please try again.</p>
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
                                                checked={selectedReviews.length === reviews.length && reviews.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Review
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reviews.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <FiSearch className="h-12 w-12 text-gray-300 mb-4" />
                                                    <p className="text-lg font-medium">No reviews found</p>
                                                    <p className="text-sm">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        reviews.map((review) => (
                                            <tr key={review._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedReviews.includes(review._id)}
                                                        onChange={() => handleSelectReview(review._id)}
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs">
                                                        <p className="text-sm text-gray-900 font-medium truncate">
                                                            {review.comment}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {review.product?.title || 'Product Name'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            {review.user?.avatar ? (
                                                                <img
                                                                    src={review.user.avatar}
                                                                    alt={review.user.name}
                                                                    className="h-8 w-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xs text-gray-500">
                                                                    {review.user?.name?.charAt(0) || 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {review.user?.name || 'Unknown User'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {review.user?.email || 'No email'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-900 mr-2">
                                                            {review.rating}
                                                        </span>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span
                                                                    key={star}
                                                                    className={`text-sm ${
                                                                        star <= review.rating
                                                                            ? 'text-orange-400'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge 
                                                        status={review.isApproved ? 'approved' : 'pending'} 
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/reviews/${review._id}`)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="View Review"
                                                        >
                                                            <FiEye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/reviews/${review._id}/edit`)}
                                                            className="text-gray-600 hover:text-gray-900 transition-colors"
                                                            title="Edit Review"
                                                        >
                                                            <FiEdit2 className="h-4 w-4" />
                                                        </button>
                                                        {!review.isApproved && (
                                                            <button
                                                                onClick={() => setApproveModal({
                                                                    show: true,
                                                                    reviewId: review._id,
                                                                    isApproved: true
                                                                })}
                                                                className="text-green-600 hover:text-green-900 transition-colors"
                                                                title="Approve Review"
                                                            >
                                                                <FiCheck className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {review.isApproved && (
                                                            <button
                                                                onClick={() => setApproveModal({
                                                                    show: true,
                                                                    reviewId: review._id,
                                                                    isApproved: false
                                                                })}
                                                                className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                                                title="Reject Review"
                                                            >
                                                                <FiXIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setDeleteModal({
                                                                show: true,
                                                                reviewId: review._id
                                                            })}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete Review"
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
                                    totalItems={pagination.totalReviews}
                                    pageSize={10}
                                    currentPageCount={reviews.length}
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
                            Delete Review
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this review? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, reviewId: null })}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteReview}
                                disabled={deleteReviewMutation.isPending}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleteReviewMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve/Reject Confirmation Modal */}
            {approveModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {approveModal.isApproved ? 'Approve' : 'Reject'} Review
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to {approveModal.isApproved ? 'approve' : 'reject'} this review?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setApproveModal({ show: false, reviewId: null, isApproved: true })}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApproveReview}
                                disabled={approveReviewMutation.isPending}
                                className={`flex-1 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
                                    approveModal.isApproved 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-yellow-600 hover:bg-yellow-700'
                                }`}
                            >
                                {approveReviewMutation.isPending 
                                    ? (approveModal.isApproved ? 'Approving...' : 'Rejecting...') 
                                    : (approveModal.isApproved ? 'Approve' : 'Reject')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default Reviews 