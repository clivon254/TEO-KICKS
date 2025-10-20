import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Get user's orders
export const useGetOrders = (params = {}) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: async () => {
            const response = await orderAPI.getOrders(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    })
}

// Get order by ID
export const useGetOrderById = (orderId) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await orderAPI.getOrderById(orderId)
            return response.data
        },
        enabled: !!orderId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })
}

// Create order
export const useCreateOrder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: orderAPI.createOrder,
        onSuccess: (data) => {
            // Invalidate cart and orders queries
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            toast.success('Order created successfully!')
        },
        onError: (error) => {
            console.error('Error creating order:', error)
            toast.error(error.response?.data?.message || 'Failed to create order')
        }
    })
}
