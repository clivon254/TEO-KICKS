import { useQuery } from '@tanstack/react-query'
import { collectionAPI } from '../utils/api'


export const useGetCollections = (params = {}) => {
  return useQuery({
    queryKey: ['collections', params],
    queryFn: () => collectionAPI.getAllCollections(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}


export const useGetCollectionById = (collectionId) => {
  return useQuery({
    queryKey: ['collections', collectionId],
    queryFn: () => collectionAPI.getCollectionById(collectionId),
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
