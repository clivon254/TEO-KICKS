import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryAPI } from '../utils/api'


// React Query hooks
export const useCreateCategory = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: categoryAPI.createCategory,
        onSuccess: (data) => {
            // Invalidate and refetch categories list
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            return data
        },
        onError: (error) => {
            console.error('Error creating category:', error)
            throw error
        }
    })
}


export const useGetCategories = (params = {}) => {
    return useQuery({
        queryKey: ['categories', params],
        queryFn: () => categoryAPI.getAllCategories(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useGetCategoryById = (categoryId) => {
    return useQuery({
        queryKey: ['category', categoryId],
        queryFn: () => categoryAPI.getCategoryById(categoryId),
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}


export const useUpdateCategory = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ categoryId, categoryData }) => categoryAPI.updateCategory(categoryId, categoryData),
        onSuccess: (data, variables) => {
            // Invalidate and refetch categories list
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            // Update the specific category in cache
            queryClient.setQueryData(['category', variables.categoryId], data)
            return data
        },
        onError: (error) => {
            console.error('Error updating category:', error)
            throw error
        }
    })
}


export const useDeleteCategory = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: categoryAPI.deleteCategory,
        onSuccess: (data) => {
            // Invalidate and refetch categories list
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            return data
        },
        onError: (error) => {
            console.error('Error deleting category:', error)
            throw error
        }
    })
} 