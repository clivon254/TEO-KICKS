import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { io } from 'socket.io-client'


// Hook for managing notifications
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [socket, setSocket] = useState(null)
    const { user, isAuthenticated } = useAuth()
    const queryClient = useQueryClient()

    // Connect to socket for real-time updates
    useEffect(() => {
        if (!isAuthenticated || !user?.token) return

        const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
            auth: { token: user.token }
        })

        newSocket.on('connect', () => {
            console.log('Connected to notification socket')
            newSocket.emit('authenticate', user._id)
        })

        newSocket.on('notification', (notification) => {
            console.log('New notification received:', notification)
            setNotifications(prev => [notification, ...prev])
            if (!notification.read) {
                setUnreadCount(prev => prev + 1)
            }
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries(['notifications'])
            queryClient.invalidateQueries(['notifications', 'unread'])
        })

        newSocket.on('order.updated', (orderData) => {
            console.log('Order updated:', orderData)
            // Update order-related notifications if needed
            queryClient.invalidateQueries(['notifications'])
        })

        newSocket.on('payment.updated', (paymentData) => {
            console.log('Payment updated:', paymentData)
            // Update payment-related notifications if needed
            queryClient.invalidateQueries(['notifications'])
        })

        newSocket.on('disconnect', () => {
            console.log('Disconnected from notification socket')
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [isAuthenticated, user?.token, user?._id, queryClient])

    // Get notifications
    const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await api.get('/notifications')
            return response.data
        },
        enabled: isAuthenticated,
        refetchOnWindowFocus: false
    })

    // Get unread count
    const { data: unreadData } = useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: async () => {
            const response = await api.get('/notifications/unread')
            return response.data
        },
        enabled: isAuthenticated,
        refetchInterval: 30000, // Refetch every 30 seconds
        refetchOnWindowFocus: true
    })

    // Update notifications and unread count when data changes
    useEffect(() => {
        if (notificationsData?.notifications) {
            setNotifications(notificationsData.notifications)
        }
    }, [notificationsData])

    useEffect(() => {
        if (unreadData?.unreadCount !== undefined) {
            setUnreadCount(unreadData.unreadCount)
        }
    }, [unreadData])

    // Mark notification as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId) => {
            const response = await api.put(`/notifications/${notificationId}/read`)
            return response.data
        },
        onSuccess: (data, notificationId) => {
            // Update local state
            setNotifications(prev => 
                prev.map(n => 
                    n._id === notificationId ? { ...n, read: true } : n
                )
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
            
            // Invalidate queries
            queryClient.invalidateQueries(['notifications'])
            queryClient.invalidateQueries(['notifications', 'unread'])
        }
    })

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            const response = await api.put('/notifications/read-all')
            return response.data
        },
        onSuccess: () => {
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
            
            // Invalidate queries
            queryClient.invalidateQueries(['notifications'])
            queryClient.invalidateQueries(['notifications', 'unread'])
        }
    })

    // Delete notification mutation
    const deleteNotificationMutation = useMutation({
        mutationFn: async (notificationId) => {
            const response = await api.delete(`/notifications/${notificationId}`)
            return response.data
        },
        onSuccess: (data, notificationId) => {
            // Update local state
            setNotifications(prev => prev.filter(n => n._id !== notificationId))
            
            // Check if deleted notification was unread
            const deletedNotification = notifications.find(n => n._id === notificationId)
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
            
            // Invalidate queries
            queryClient.invalidateQueries(['notifications'])
            queryClient.invalidateQueries(['notifications', 'unread'])
        }
    })

    // Clear read notifications mutation
    const clearReadNotificationsMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete('/notifications/clear-read')
            return response.data
        },
        onSuccess: () => {
            // Update local state
            setNotifications(prev => prev.filter(n => !n.read))
            
            // Invalidate queries
            queryClient.invalidateQueries(['notifications'])
            queryClient.invalidateQueries(['notifications', 'unread'])
        }
    })

    // Helper functions
    const markAsRead = useCallback((notificationId) => {
        markAsReadMutation.mutate(notificationId)
    }, [markAsReadMutation])

    const markAllAsRead = useCallback(() => {
        markAllAsReadMutation.mutate()
    }, [markAllAsReadMutation])

    const deleteNotification = useCallback((notificationId) => {
        deleteNotificationMutation.mutate(notificationId)
    }, [deleteNotificationMutation])

    const clearReadNotifications = useCallback(() => {
        clearReadNotificationsMutation.mutate()
    }, [clearReadNotificationsMutation])

    return {
        notifications,
        unreadCount,
        isLoadingNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearReadNotifications,
        isMarkingAsRead: markAsReadMutation.isPending,
        isMarkingAllAsRead: markAllAsReadMutation.isPending,
        isDeleting: deleteNotificationMutation.isPending,
        isClearing: clearReadNotificationsMutation.isPending,
        socket
    }
}


// Hook for getting notifications with filters
export const useNotificationsWithFilters = (filters = {}) => {
    const { page = 1, limit = 20, type, read } = filters

    return useQuery({
        queryKey: ['notifications', 'filtered', { page, limit, type, read }],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (page) params.append('page', page)
            if (limit) params.append('limit', limit)
            if (type) params.append('type', type)
            if (read !== undefined) params.append('read', read)

            const response = await api.get(`/notifications?${params.toString()}`)
            return response.data
        },
        keepPreviousData: true
    })
}


// Hook for admin notification management
export const useAdminNotifications = (filters = {}) => {
    const { page = 1, limit = 20, type, userId, read } = filters

    return useQuery({
        queryKey: ['admin', 'notifications', { page, limit, type, userId, read }],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (page) params.append('page', page)
            if (limit) params.append('limit', limit)
            if (type) params.append('type', type)
            if (userId) params.append('userId', userId)
            if (read !== undefined) params.append('read', read)

            const response = await api.get(`/notifications/admin?${params.toString()}`)
            return response.data
        },
        keepPreviousData: true
    })
}


// Hook for sending broadcast notifications (admin)
export const useBroadcastNotification = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (broadcastData) => {
            const response = await api.post('/notifications/admin/broadcast', broadcastData)
            return response.data
        },
        onSuccess: () => {
            // Invalidate all notification queries
            queryClient.invalidateQueries(['notifications'])
            queryClient.invalidateQueries(['admin', 'notifications'])
        }
    })
}


// Hook for notification statistics (admin)
export const useNotificationStats = (period = '30d') => {
    return useQuery({
        queryKey: ['admin', 'notifications', 'stats', period],
        queryFn: async () => {
            const response = await api.get(`/notifications/admin/stats?period=${period}`)
            return response.data
        }
    })
}
