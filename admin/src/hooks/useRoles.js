import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

// Simple roles fetcher for filters
export const useGetRoles = (params = {}) => {
    return useQuery({
        queryKey: ['roles', params],
        queryFn: async () => {
            const res = await api.get('/roles', { params })
            return res.data
        },
        staleTime: 1000 * 60 * 10,
    })
}

