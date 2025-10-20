import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Get reviews for a product
export const useGetProductReviews = (productId, params = {}) => {
    return useQuery({
        queryKey: ['reviews', 'product', productId, params],
        queryFn: async () => {
            const response = await reviewAPI.getProductReviews(productId, params)
            return response.data
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    })
}

// Get review by ID
export const useGetReviewById = (reviewId) => {
    return useQuery({
        queryKey: ['review', reviewId],
        queryFn: async () => {
            const response = await reviewAPI.getReviewById(reviewId)
            return response.data
        },
        enabled: !!reviewId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })
}

// Get user's reviews
export const useGetUserReviews = (params = {}) => {
    return useQuery({
        queryKey: ['reviews', 'user', params],
        queryFn: async () => {
            const response = await reviewAPI.getUserReviews(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })
}

// Create review
export const useCreateReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ productId, reviewData }) => reviewAPI.createReview(productId, reviewData),
        onSuccess: (data, variables) => {
            // Invalidate product reviews and user reviews
            queryClient.invalidateQueries({ queryKey: ['reviews', 'product', variables.productId] })
            queryClient.invalidateQueries({ queryKey: ['reviews', 'user'] })
            toast.success('Review submitted successfully!')
        },
        onError: (error) => {
            console.error('Error creating review:', error)
            toast.error(error.response?.data?.message || 'Failed to submit review')
        }
    })
}

// Update review
export const useUpdateReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ reviewId, reviewData }) => reviewAPI.updateReview(reviewId, reviewData),
        onSuccess: (data, variables) => {
            // Invalidate specific review and related queries
            queryClient.invalidateQueries({ queryKey: ['review', variables.reviewId] })
            queryClient.invalidateQueries({ queryKey: ['reviews', 'user'] })
            toast.success('Review updated successfully!')
        },
        onError: (error) => {
            console.error('Error updating review:', error)
            toast.error(error.response?.data?.message || 'Failed to update review')
        }
    })
}

// Delete review
export const useDeleteReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: reviewAPI.deleteReview,
        onSuccess: (data, variables) => {
            // Invalidate specific review and related queries
            queryClient.invalidateQueries({ queryKey: ['review', variables] })
            queryClient.invalidateQueries({ queryKey: ['reviews', 'user'] })
            toast.success('Review deleted successfully!')
        },
        onError: (error) => {
            console.error('Error deleting review:', error)
            toast.error(error.response?.data?.message || 'Failed to delete review')
        }
    })
}
