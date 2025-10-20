import { useQuery } from '@tanstack/react-query'
import { productAPI } from '../utils/api'

// Get all products (public)
export const useGetProducts = (params = {}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const response = await productAPI.getAllProducts(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    })
}

// Get product by ID (public)
export const useGetProductById = (productId) => {
    return useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const response = await productAPI.getProductById(productId)
            return response.data
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })
}

// Get optimized product images
export const useGetOptimizedImages = (productId) => {
    return useQuery({
        queryKey: ['product-images', productId],
        queryFn: async () => {
            const response = await productAPI.getOptimizedImages(productId)
            return response.data
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 10, // 10 minutes - images don't change often
        gcTime: 1000 * 60 * 30, // 30 minutes
    })
}
