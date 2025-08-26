import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Get user's cart
export const useGetCart = () => {
    return useQuery({
        queryKey: ['cart'],
        queryFn: () => cartAPI.getCart(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Add item to cart
export const useAddToCart = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: cartAPI.addToCart,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(data.data.message || 'Item added to cart successfully')
        },
        onError: (error) => {
            console.error('Error adding to cart:', error)
            toast.error(error.response?.data?.message || 'Failed to add item to cart')
        }
    })
}

// Update cart item quantity
export const useUpdateCartItem = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ skuId, quantity }) => cartAPI.updateCartItem(skuId, quantity),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(data.data.message || 'Cart updated successfully')
        },
        onError: (error) => {
            console.error('Error updating cart item:', error)
            toast.error(error.response?.data?.message || 'Failed to update cart item')
        }
    })
}

// Remove item from cart
export const useRemoveFromCart = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: cartAPI.removeFromCart,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(data.data.message || 'Item removed from cart successfully')
        },
        onError: (error) => {
            console.error('Error removing from cart:', error)
            toast.error(error.response?.data?.message || 'Failed to remove item from cart')
        }
    })
}

// Clear cart
export const useClearCart = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: cartAPI.clearCart,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(data.data.message || 'Cart cleared successfully')
        },
        onError: (error) => {
            console.error('Error clearing cart:', error)
            toast.error(error.response?.data?.message || 'Failed to clear cart')
        }
    })
}

// Validate cart
export const useValidateCart = () => {
    return useQuery({
        queryKey: ['cart', 'validate'],
        queryFn: () => cartAPI.validateCart(),
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
} 