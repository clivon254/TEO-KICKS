import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Get all users (admin)
export const useGetUsers = (params = {}) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const response = await userAPI.getAllUsers(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}

// Get user by id (admin)
export const useGetUserById = (userId) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const response = await userAPI.getUserById(userId)
            return response.data
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}

// Update user status/roles (admin)
export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, data }) => {
            const response = await userAPI.updateUserStatus(userId, data)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['user'] })
            toast.success(data.message || 'User updated successfully')
        },
        onError: (error) => {
            console.error('Update user error:', error)
            toast.error(error.response?.data?.message || 'Failed to update user')
        }
    })
}

// Delete user (admin)
export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId) => {
            const response = await userAPI.deleteUser(userId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success(data.message || 'User deleted successfully')
        },
        onError: (error) => {
            console.error('Delete user error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete user')
        }
    })
}

