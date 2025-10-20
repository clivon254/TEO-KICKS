import { useQuery } from '@tanstack/react-query'
import { storeConfigAPI } from '../utils/api'

// Get store configuration
export const useGetStoreConfig = () => {
    return useQuery({
        queryKey: ['store-config'],
        queryFn: async () => {
            const response = await storeConfigAPI.getStoreConfig()
            return response.data
        },
        staleTime: 1000 * 60 * 15, // 15 minutes - store config changes rarely
        gcTime: 1000 * 60 * 60, // 1 hour
    })
}
