import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { collectionAPI } from '../utils/api'


export const useCreateCollection = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: collectionAPI.createCollection,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] })
            return data
        },
        onError: (error) => {
            console.error('Error creating collection:', error)
            throw error
        }
    })
}


export const useGetCollections = (params = {}) => {
    return useQuery({
        queryKey: ['collections', params],
        queryFn: () => collectionAPI.getAllCollections(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useGetCollectionById = (collectionId) => {
    return useQuery({
        queryKey: ['collections', collectionId],
        queryFn: () => collectionAPI.getCollectionById(collectionId),
        enabled: !!collectionId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useUpdateCollection = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ collectionId, ...collectionData }) => collectionAPI.updateCollection(collectionId, collectionData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] })
            queryClient.invalidateQueries({ queryKey: ['collections', variables.collectionId] })
            return data
        },
        onError: (error) => {
            console.error('Error updating collection:', error)
            throw error
        }
    })
}


export const useDeleteCollection = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: collectionAPI.deleteCollection,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] })
            return data
        },
        onError: (error) => {
            console.error('Error deleting collection:', error)
            throw error
        }
    })
}