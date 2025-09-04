import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { storeConfigAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Get store configuration
export const useGetStoreConfig = () => {
    return useQuery({
        queryKey: ['storeConfig'],
        queryFn: () => storeConfigAPI.getStoreConfig(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Get store configuration status
export const useGetStoreConfigStatus = () => {
    return useQuery({
        queryKey: ['storeConfig', 'status'],
        queryFn: () => storeConfigAPI.getStoreConfigStatus(),
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Create store configuration
export const useCreateStoreConfig = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (configData) => storeConfigAPI.createStoreConfig(configData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeConfig'] })
            toast.success(data.data?.message || 'Store configuration created successfully')
        },
        onError: (error) => {
            console.error('Create store config error:', error)
            toast.error(error.response?.data?.message || 'Failed to create store configuration')
        }
    })
}

// Update store configuration
export const useUpdateStoreConfig = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (configData) => storeConfigAPI.updateStoreConfig(configData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeConfig'] })
            toast.success(data.data?.message || 'Store configuration updated successfully')
        },
        onError: (error) => {
            console.error('Update store config error:', error)
            toast.error(error.response?.data?.message || 'Failed to update store configuration')
        }
    })
}

// Delete store configuration
export const useDeleteStoreConfig = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => storeConfigAPI.deleteStoreConfig(),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeConfig'] })
            toast.success(data.data?.message || 'Store configuration deleted successfully')
        },
        onError: (error) => {
            console.error('Delete store config error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete store configuration')
        }
    })
}

// Initialize default store configuration
export const useInitStoreConfig = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => storeConfigAPI.initStoreConfig(),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeConfig'] })
            toast.success(data.data?.message || 'Default store configuration initialized successfully')
        },
        onError: (error) => {
            console.error('Init store config error:', error)
            toast.error(error.response?.data?.message || 'Failed to initialize store configuration')
        }
    })
}