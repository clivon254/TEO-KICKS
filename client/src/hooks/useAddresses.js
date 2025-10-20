import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addressAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Get user addresses
export const useGetAddresses = () => {
    return useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            const response = await addressAPI.getUserAddresses()
            return response.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    })
}

// Get address by ID
export const useGetAddressById = (addressId) => {
    return useQuery({
        queryKey: ['address', addressId],
        queryFn: async () => {
            const response = await addressAPI.getAddressById(addressId)
            return response.data
        },
        enabled: !!addressId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })
}

// Get default address
export const useGetDefaultAddress = () => {
    return useQuery({
        queryKey: ['address', 'default'],
        queryFn: async () => {
            const response = await addressAPI.getDefaultAddress()
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })
}

// Create address
export const useCreateAddress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: addressAPI.createAddress,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            queryClient.invalidateQueries({ queryKey: ['address', 'default'] })
            toast.success('Address added successfully!')
        },
        onError: (error) => {
            console.error('Error creating address:', error)
            toast.error(error.response?.data?.message || 'Failed to add address')
        }
    })
}

// Update address
export const useUpdateAddress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ addressId, addressData }) => addressAPI.updateAddress(addressId, addressData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            queryClient.invalidateQueries({ queryKey: ['address', 'default'] })
            toast.success('Address updated successfully!')
        },
        onError: (error) => {
            console.error('Error updating address:', error)
            toast.error(error.response?.data?.message || 'Failed to update address')
        }
    })
}

// Delete address
export const useDeleteAddress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: addressAPI.deleteAddress,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            queryClient.invalidateQueries({ queryKey: ['address', 'default'] })
            toast.success('Address deleted successfully!')
        },
        onError: (error) => {
            console.error('Error deleting address:', error)
            toast.error(error.response?.data?.message || 'Failed to delete address')
        }
    })
}

// Set default address
export const useSetDefaultAddress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: addressAPI.setDefaultAddress,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            queryClient.invalidateQueries({ queryKey: ['address', 'default'] })
            toast.success('Default address updated!')
        },
        onError: (error) => {
            console.error('Error setting default address:', error)
            toast.error(error.response?.data?.message || 'Failed to set default address')
        }
    })
}
