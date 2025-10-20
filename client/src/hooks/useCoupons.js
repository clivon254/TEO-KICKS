import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { couponAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Validate coupon
export const useValidateCoupon = () => {
    return useMutation({
        mutationFn: ({ code, orderAmount }) => couponAPI.validateCoupon(code, orderAmount),
        onError: (error) => {
            console.error('Error validating coupon:', error)
            toast.error(error.response?.data?.message || 'Invalid coupon code')
        }
    })
}

// Apply coupon
export const useApplyCoupon = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ code, orderAmount }) => couponAPI.applyCoupon(code, orderAmount),
        onSuccess: (data) => {
            toast.success('Coupon applied successfully!')
        },
        onError: (error) => {
            console.error('Error applying coupon:', error)
            toast.error(error.response?.data?.message || 'Failed to apply coupon')
        }
    })
}
