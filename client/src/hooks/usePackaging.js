import { useQuery } from '@tanstack/react-query'
import { packagingAPI } from '../utils/api'

// Get active packaging options
export const useGetActivePackaging = () => {
    return useQuery({
        queryKey: ['packaging', 'active'],
        queryFn: async () => {
            const response = await packagingAPI.getActivePublic()
            return response.data
        },
        staleTime: 1000 * 60 * 10, // 10 minutes - packaging options don't change often
        gcTime: 1000 * 60 * 30, // 30 minutes
    })
}

// Get default packaging option
export const useGetDefaultPackaging = () => {
    return useQuery({
        queryKey: ['packaging', 'default'],
        queryFn: async () => {
            const response = await packagingAPI.getDefaultPublic()
            return response.data
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    })
}
