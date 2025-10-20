import { useQuery } from '@tanstack/react-query'
import { brandAPI } from '../utils/api'

// Get all brands
export const useGetBrands = (params = {}) => {
    return useQuery({
        queryKey: ['brands', params],
        queryFn: async () => {
            const response = await brandAPI.getAllBrands(params)
            return response.data
        },
        staleTime: 1000 * 60 * 10, // 10 minutes - brands don't change often
        gcTime: 1000 * 60 * 30, // 30 minutes
    })
}

// Get brand by ID
export const useGetBrandById = (brandId) => {
    return useQuery({
        queryKey: ['brand', brandId],
        queryFn: async () => {
            const response = await brandAPI.getBrandById(brandId)
            return response.data
        },
        enabled: !!brandId,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    })
}

// Get popular brands
export const useGetPopularBrands = (params = {}) => {
    return useQuery({
        queryKey: ['brands', 'popular', params],
        queryFn: async () => {
            const response = await brandAPI.getPopularBrands(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    })
}
