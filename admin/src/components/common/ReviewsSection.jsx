import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useGetProductReviews, useCreateReview } from '../../hooks/useReviews.js'
import StarRating from './StarRating'
import ReviewForm from './ReviewForm'
import ReviewItem from './ReviewItem'
import Pagination from './Pagination'
import { FiMessageSquare, FiPlus } from 'react-icons/fi'


const ReviewsSection = ({ productId, className = '' }) => {
    const { user, isAuthenticated } = useAuth()
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const {
        data: reviewsData,
        isLoading,
        error,
        refetch
    } = useGetProductReviews(productId, { page: currentPage, limit: 5 })

    const createReviewMutation = useCreateReview()

    // Handle the nested response structure from React Query + Backend
    const reviews = reviewsData?.data?.data?.reviews || reviewsData?.data?.reviews || reviewsData?.reviews || []
    const pagination = reviewsData?.data?.data?.pagination || reviewsData?.data?.pagination || reviewsData?.pagination
    const stats = reviewsData?.data?.data?.stats || reviewsData?.data?.stats || reviewsData?.stats

    // Debug logging
    console.log('ReviewsSection Debug:', {
        productId,
        reviewsData,
        reviewsDataStructure: {
            hasData: !!reviewsData?.data,
            hasDataData: !!reviewsData?.data?.data,
            hasReviews: !!reviewsData?.reviews,
            hasDataReviews: !!reviewsData?.data?.reviews,
            hasDataDataReviews: !!reviewsData?.data?.data?.reviews,
            reviewsLength: reviews.length,
            stats,
            error,
            isLoading
        }
    })

    const handleCreateReview = async (formData) => {
        try {
            await createReviewMutation.mutateAsync({
                productId,
                reviewData: formData
            })
            setShowReviewForm(false)
            refetch()
        } catch (error) {
            console.error('Failed to create review:', error)
        }
    }

    const handleReviewUpdate = (reviewId, updatedData) => {
        // The review will be automatically updated via query invalidation
        refetch()
    }

    const handleReviewDelete = (reviewId) => {
        // The review will be automatically removed via query invalidation
        refetch()
    }

    const canCreateReview = isAuthenticated // Temporarily allow all authenticated users for testing

    if (isLoading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-200 h-32 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-gray-500">Failed to load reviews. Please try again.</p>
            </div>
        )
    }

    return (
        <div className={`space-y-6 p-3 ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <FiMessageSquare className="w-6 h-6 text-gray-600 flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Customer Reviews
                    </h2>
                    {stats && (
                        <span className="text-sm text-gray-500">
                            ({stats.totalReviews} reviews)
                        </span>
                    )}
                </div>

                {canCreateReview && !showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-button transition-colors self-start sm:self-auto"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Write Review</span>
                        <span className="sm:hidden">Write</span>
                    </button>
                )}
            </div>

            {/* Review Stats */}
            {stats && stats.totalReviews > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <StarRating
                                rating={Math.round(stats.averageRating)}
                                readonly={true}
                                size="sm"
                            />
                            <div className="text-sm text-gray-500 mt-1">
                                Average Rating
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-2">
                                Rating Distribution
                            </div>
                            <div className="space-y-1">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = stats.ratingDistribution.find(d => d._id === rating)?.count || 0
                                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                                    return (
                                        <div key={rating} className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 w-4">{rating}★</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-orange-400 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-500 w-8">{count}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
                <ReviewForm
                    onSubmit={handleCreateReview}
                    onCancel={() => setShowReviewForm(false)}
                    isLoading={createReviewMutation.isPending}
                />
            )}

            {/* Reviews List */}
            {console.log('Rendering reviews list:', { reviewsLength: reviews.length, reviews })}
            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewItem
                            key={review._id}
                            review={review}
                            onReviewUpdate={handleReviewUpdate}
                            onReviewDelete={handleReviewDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    {!isAuthenticated && (
                        <p className="text-sm text-gray-400 mt-2">
                            Please log in to write a review.
                        </p>
                    )}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={pagination.totalReviews}
                    pageSize={5}
                    currentPageCount={reviews.length}
                />
            )}
        </div>
    )
}


export default ReviewsSection 