import { useQuery } from '@tanstack/react-query'
import { categoryAPI } from '../utils/api'

// Get all categories
export const useGetCategories = (params = {}) => {
    return useQuery({
        queryKey: ['categories', params],
        queryFn: async () => {
            const response = await categoryAPI.getAllCategories(params)
            return response.data
        },
        staleTime: 1000 * 60 * 10, // 10 minutes - categories don't change often
        gcTime: 1000 * 60 * 30, // 30 minutes
    })
}

// Get category by ID
export const useGetCategoryById = (categoryId) => {
    return useQuery({
        queryKey: ['category', categoryId],
        queryFn: async () => {
            const response = await categoryAPI.getCategoryById(categoryId)
            return response.data
        },
        enabled: !!categoryId,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    })
}

// Get category tree
export const useGetCategoryTree = () => {
    return useQuery({
        queryKey: ['categories', 'tree'],
        queryFn: async () => {
            const response = await categoryAPI.getCategoryTree()
            return response.data
        },
        staleTime: 1000 * 60 * 15, // 15 minutes - tree structure changes rarely
        gcTime: 1000 * 60 * 60, // 1 hour
    })
}

// Get categories with products
export const useGetCategoriesWithProducts = () => {
    return useQuery({
        queryKey: ['categories', 'with-products'],
        queryFn: async () => {
            const response = await categoryAPI.getCategoriesWithProducts()
            return response.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    })
}
