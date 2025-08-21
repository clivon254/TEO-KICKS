import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { brandAPI } from '../utils/api'


export const useCreateBrand = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: brandAPI.createBrand,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['brands'] })
            return data
        },
        onError: (error) => {
            console.error('Error creating brand:', error)
            throw error
        }
    })
}


export const useGetBrands = (params = {}) => {
    return useQuery({
        queryKey: ['brands', params],
        queryFn: () => brandAPI.getAllBrands(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useGetBrandById = (brandId) => {
    return useQuery({
        queryKey: ['brands', brandId],
        queryFn: () => brandAPI.getBrandById(brandId),
        enabled: !!brandId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useUpdateBrand = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ brandId, ...brandData }) => brandAPI.updateBrand(brandId, brandData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['brands'] })
            queryClient.invalidateQueries({ queryKey: ['brands', variables.brandId] })
            return data
        },
        onError: (error) => {
            console.error('Error updating brand:', error)
            throw error
        }
    })
}


export const useDeleteBrand = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: brandAPI.deleteBrand,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['brands'] })
            return data
        },
        onError: (error) => {
            console.error('Error deleting brand:', error)
            throw error
        }
    })
}