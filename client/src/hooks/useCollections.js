import { useQuery } from '@tanstack/react-query'
import { collectionAPI } from '../utils/api'


export const useGetCollections = (params = {}) => {
  return useQuery({
    queryKey: ['collections', params],
    queryFn: async () => {
      const response = await collectionAPI.getAllCollections(params)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}


export const useGetCollectionById = (collectionId) => {
  return useQuery({
    queryKey: ['collections', collectionId],
    queryFn: async () => {
      const response = await collectionAPI.getCollectionById(collectionId)
      return response.data
    },
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
