import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewAPI } from '../utils/api.js'
import toast from 'react-hot-toast'

// Get reviews for a product
export const useGetProductReviews = (productId, params = {}) => {
    return useQuery({
        queryKey: ['reviews', 'product', productId, params],
        queryFn: async () => {
            const response = await reviewAPI.getProductReviews(productId, params)
            console.log('useGetProductReviews response:', response)
            return response
        },
        enabled: !!productId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Get a single review
export const useGetReviewById = (reviewId) => {
    return useQuery({
        queryKey: ['reviews', 'single', reviewId],
        queryFn: () => reviewAPI.getReviewById(reviewId),
        enabled: !!reviewId,
    })
}

// Get user's reviews
export const useGetUserReviews = (params = {}) => {
    return useQuery({
        queryKey: ['reviews', 'user', params],
        queryFn: () => reviewAPI.getUserReviews(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Create review mutation
export const useCreateReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ productId, reviewData }) => reviewAPI.createReview(productId, reviewData),
        onSuccess: (data, variables) => {
            toast.success('Review created successfully!')
            
            // Invalidate and refetch reviews for this product
            queryClient.invalidateQueries({
                queryKey: ['reviews', 'product', variables.productId]
            })
            
            // Invalidate user reviews
            queryClient.invalidateQueries({
                queryKey: ['reviews', 'user']
            })
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to create review'
            toast.error(message)
        }
    })
}

// Update review mutation
export const useUpdateReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ reviewId, reviewData }) => reviewAPI.updateReview(reviewId, reviewData),
        onSuccess: (data, variables) => {
            toast.success('Review updated successfully!')
            
            // Invalidate and refetch reviews
            queryClient.invalidateQueries({
                queryKey: ['reviews']
            })
            
            // Update the specific review in cache
            queryClient.setQueryData(
                ['reviews', 'single', variables.reviewId],
                data
            )
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to update review'
            toast.error(message)
        }
    })
}

// Delete review mutation
export const useDeleteReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (reviewId) => reviewAPI.deleteReview(reviewId),
        onSuccess: (data, reviewId) => {
            toast.success('Review deleted successfully!')
            
            // Invalidate and refetch reviews
            queryClient.invalidateQueries({
                queryKey: ['reviews']
            })
            
            // Remove the specific review from cache
            queryClient.removeQueries({
                queryKey: ['reviews', 'single', reviewId]
            })
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to delete review'
            toast.error(message)
        }
    })
}

// Approve/Reject review mutation (Admin only)
export const useApproveReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ reviewId, isApproved }) => reviewAPI.approveReview(reviewId, isApproved),
        onSuccess: (data, variables) => {
            const action = variables.isApproved ? 'approved' : 'rejected'
            toast.success(`Review ${action} successfully!`)
            
            // Invalidate and refetch reviews
            queryClient.invalidateQueries({
                queryKey: ['reviews']
            })
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to update review status'
            toast.error(message)
        }
    })
} 