import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponAPI } from '../utils/api.js'
import toast from 'react-hot-toast'


// Get all coupons (admin only)
export const useGetAllCoupons = (params = {}) => {
    return useQuery({
        queryKey: ['coupons', 'all', params],
        queryFn: () => couponAPI.getAllCoupons(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}


// Get coupon by ID
export const useGetCouponById = (couponId) => {
    return useQuery({
        queryKey: ['coupons', 'byId', couponId],
        queryFn: () => couponAPI.getCouponById(couponId),
        enabled: !!couponId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}


// Get coupon statistics
export const useGetCouponStats = () => {
    return useQuery({
        queryKey: ['coupons', 'stats'],
        queryFn: () => couponAPI.getCouponStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}


// Create coupon
export const useCreateCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (couponData) => couponAPI.createCoupon(couponData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            toast.success('Coupon created successfully')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create coupon')
        }
    })
}


// Update coupon
export const useUpdateCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ couponId, couponData }) => couponAPI.updateCoupon(couponId, couponData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            queryClient.invalidateQueries({ queryKey: ['coupons', 'byId', variables.couponId] })
            toast.success('Coupon updated successfully')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update coupon')
        }
    })
}


// Delete coupon
export const useDeleteCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (couponId) => couponAPI.deleteCoupon(couponId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
            toast.success('Coupon deleted successfully')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete coupon')
        }
    })
}


// Validate coupon (public)
export const useValidateCoupon = () => {
    return useMutation({
        mutationFn: ({ code, orderAmount }) => couponAPI.validateCoupon(code, orderAmount),
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to validate coupon')
        }
    })
}


// Apply coupon to order
export const useApplyCoupon = () => {
    return useMutation({
        mutationFn: ({ code, orderAmount }) => couponAPI.applyCoupon(code, orderAmount),
        onSuccess: () => {
            toast.success('Coupon applied successfully')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to apply coupon')
        }
    })
}


// Generate new coupon code
export const useGenerateNewCode = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (couponId) => couponAPI.generateNewCode(couponId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coupons', 'byId', variables] })
            toast.success('New coupon code generated successfully')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to generate new code')
        }
    })
} 