import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { packagingAPI } from '../utils/api'
import toast from 'react-hot-toast'


export const useGetPackaging = (params = {}) => {
    return useQuery({
        queryKey: ['packaging', params],
        queryFn: () => packagingAPI.getPackaging(params),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}


export const useGetPackagingById = (id) => {
    return useQuery({
        queryKey: ['packaging', id],
        queryFn: () => packagingAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}


export const useCreatePackaging = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data) => packagingAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            toast.success('Packaging option created')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create packaging option')
        }
    })
}


export const useUpdatePackaging = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => packagingAPI.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            queryClient.invalidateQueries({ queryKey: ['packaging', variables.id] })
            toast.success('Packaging option updated')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update packaging option')
        }
    })
}


export const useDeletePackaging = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => packagingAPI.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            toast.success('Packaging option deleted')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete packaging option')
        }
    })
}


export const useSetDefaultPackaging = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => packagingAPI.setDefault(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packaging'] })
            toast.success('Default packaging updated')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to set default packaging')
        }
    })
}


// Public consumption (checkout)
export const useGetActivePackagingPublic = () => {
    return useQuery({
        queryKey: ['packaging', 'public', 'active'],
        queryFn: () => packagingAPI.getActivePublic(),
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })
}


export const useGetDefaultPackagingPublic = () => {
    return useQuery({
        queryKey: ['packaging', 'public', 'default'],
        queryFn: () => packagingAPI.getDefaultPublic(),
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })
}


