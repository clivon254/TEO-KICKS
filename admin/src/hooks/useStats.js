import { useQuery } from '@tanstack/react-query'
import { statsAPI } from '../utils/api'


export const useOverviewStats = () => {
    return useQuery({
        queryKey: ['stats', 'overview'],
        queryFn: async () => {
            const response = await statsAPI.getOverview()
            return response.data
        },
        staleTime: 1000 * 60, // 1 min
    })
}


export const useAnalytics = (params) => {
    return useQuery({
        queryKey: ['stats', 'analytics', params],
        queryFn: async () => {
            const response = await statsAPI.getAnalytics(params)
            return response.data
        },
        staleTime: 1000 * 60, // 1 min
        keepPreviousData: true,
    })
}

