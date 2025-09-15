import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { variantAPI } from '../utils/api'


export const useCreateVariant = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: variantAPI.createVariant,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['variants'] })
            return data
        },
        onError: (error) => {
            console.error('Error creating variant:', error)
            throw error
        }
    })
}


export const useGetVariants = (params = {}) => {
    return useQuery({
        queryKey: ['variants', params],
        queryFn: () => variantAPI.getAllVariants(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useGetVariantById = (variantId) => {
    return useQuery({
        queryKey: ['variants', variantId],
        queryFn: () => variantAPI.getVariantById(variantId),
        enabled: !!variantId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useUpdateVariant = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ variantId, ...variantData }) => variantAPI.updateVariant(variantId, variantData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['variants'] })
            queryClient.invalidateQueries({ queryKey: ['variants', variables.variantId] })
            return data
        },
        onError: (error) => {
            console.error('Error updating variant:', error)
            throw error
        }
    })
}


export const useDeleteVariant = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: variantAPI.deleteVariant,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['variants'] })
            return data
        },
        onError: (error) => {
            console.error('Error deleting variant:', error)
            throw error
        }
    })
}


export const useGetActiveVariants = () => {
    return useQuery({
        queryKey: ['variants', 'active'],
        queryFn: () => variantAPI.getActiveVariants(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}