import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tagAPI } from '../utils/api'


export const useCreateTag = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: tagAPI.createTag,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            return data
        },
        onError: (error) => {
            console.error('Error creating tag:', error)
            throw error
        }
    })
}


export const useGetTags = (params = {}) => {
    return useQuery({
        queryKey: ['tags', params],
        queryFn: () => tagAPI.getAllTags(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useGetTagById = (tagId) => {
    return useQuery({
        queryKey: ['tags', tagId],
        queryFn: () => tagAPI.getTagById(tagId),
        enabled: !!tagId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useUpdateTag = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tagId, ...tagData }) => tagAPI.updateTag(tagId, tagData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            queryClient.invalidateQueries({ queryKey: ['tags', variables.tagId] })
            return data
        },
        onError: (error) => {
            console.error('Error updating tag:', error)
            throw error
        }
    })
}


export const useDeleteTag = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: tagAPI.deleteTag,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            return data
        },
        onError: (error) => {
            console.error('Error deleting tag:', error)
            throw error
        }
    })
}