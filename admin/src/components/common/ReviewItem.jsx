import { useState } from 'react'
import StarRating from './StarRating'
import ReviewForm from './ReviewForm'
import { FiEdit2, FiTrash2, FiUser } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useUpdateReview, useDeleteReview } from '../../hooks/useReviews.js'


const ReviewItem = ({ review, onReviewUpdate, onReviewDelete, className = '' }) => {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    
    const updateReviewMutation = useUpdateReview()
    const deleteReviewMutation = useDeleteReview()

    const canEdit = user && (user.id === review.user._id || user.roles?.includes('admin'))
    const canDelete = user && (user.id === review.user._id || user.roles?.includes('admin'))

    // Debug logging
    console.log('ReviewItem Debug:', {
        user: user ? { id: user.id, roles: user.roles } : null,
        reviewUser: review.user,
        canEdit,
        canDelete
    })

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
    }

    const handleUpdateReview = async (formData) => {
        try {
            await updateReviewMutation.mutateAsync({
                reviewId: review._id,
                reviewData: formData
            })
            setIsEditing(false)
            if (onReviewUpdate) {
                onReviewUpdate(review._id, formData)
            }
        } catch (error) {
            console.error('Failed to update review:', error)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteReviewMutation.mutateAsync(review._id)
            setShowDeleteModal(false)
            if (onReviewDelete) {
                onReviewDelete(review._id)
            }
        } catch (error) {
            console.error('Failed to delete review:', error)
        }
    }

    const getUserAvatar = () => {
        if (review.user.avatar) {
            return (
                <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
            )
        }
        return (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FiUser className="w-5 h-5 text-gray-500" />
            </div>
        )
    }

    if (isEditing) {
        return (
            <div className={className}>
                <ReviewForm
                    initialData={review}
                    isEditing={true}
                    onSubmit={handleUpdateReview}
                    onCancel={handleCancelEdit}
                    isLoading={updateReviewMutation.isPending}
                />
            </div>
        )
    }

    return (
        <>
            <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {getUserAvatar()}
                        <div>
                            <h4 className="font-medium text-gray-900">
                                {review.user.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                <StarRating
                                    rating={review.rating}
                                    readonly={true}
                                    size="sm"
                                />
                                <span className="text-sm text-gray-500">
                                    {review.timeAgo}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {(canEdit || canDelete) && (
                        <div className="flex items-center gap-2">
                            {canEdit && (
                                <button
                                    onClick={handleEdit}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    title="Edit review"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                    title="Delete review"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Review Content */}
                <div className="text-gray-700 leading-relaxed">
                    {review.comment}
                </div>

                {/* Verified Purchase Badge */}
                {review.isVerifiedPurchase && (
                    <div className="mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Verified Purchase
                        </span>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
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
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteReviewMutation.isPending}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleteReviewMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}


export default ReviewItem 