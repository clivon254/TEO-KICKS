import { useQuery } from '@tanstack/react-query'
import { collectionAPI } from '../utils/api'

// Get all collections
export const useGetCollections = (params = {}) => {
    return useQuery({
        queryKey: ['collections', params],
        queryFn: async () => {
            const response = await collectionAPI.getAllCollections(params)
            return response.data
        },
        staleTime: 1000 * 60 * 10, // 10 minutes - collections don't change often
        gcTime: 1000 * 60 * 30, // 30 minutes
    })
}

// Get collection by ID
export const useGetCollectionById = (collectionId) => {
    return useQuery({
        queryKey: ['collection', collectionId],
        queryFn: async () => {
            const response = await collectionAPI.getCollectionById(collectionId)
            return response.data
        },
        enabled: !!collectionId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    })
}
