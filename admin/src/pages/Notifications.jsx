import React, { useState } from 'react'
import { useNotifications, useNotificationsWithFilters } from '../hooks/useNotifications'
import NotificationItem from '../components/common/NotificationItem'
import Pagination from '../components/common/Pagination'


const Notifications = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [filter, setFilter] = useState('all') // all, unread, read
    const [type, setType] = useState('all') // all, order, payment, system
    const [isMarkingAll, setIsMarkingAll] = useState(false)
    const [isClearing, setIsClearing] = useState(false)

    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        clearReadNotifications,
        isLoadingNotifications 
    } = useNotifications()

    const { data: filteredData, isLoading: isLoadingFiltered } = useNotificationsWithFilters({
        page: currentPage,
        limit: 20,
        type: type === 'all' ? undefined : type,
        read: filter === 'all' ? undefined : filter === 'unread' ? false : true
    })

    const filteredNotifications = filteredData?.notifications || []
    const pagination = filteredData?.pagination

    const handleMarkAllAsRead = async () => {
        setIsMarkingAll(true)
        try {
            await markAllAsRead()
        } finally {
            setIsMarkingAll(false)
        }
    }

    const handleClearRead = async () => {
        setIsClearing(true)
        try {
            await clearReadNotifications()
        } finally {
            setIsClearing(false)
        }
    }

    const handleNotificationClick = (notificationId) => {
        markAsRead(notificationId)
    }

    const handleDeleteNotification = (notificationId) => {
        deleteNotification(notificationId)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const getFilterOptions = () => {
        return [
            { value: 'all', label: 'All', count: notifications.length },
            { value: 'unread', label: 'Unread', count: unreadCount },
            { value: 'read', label: 'Read', count: notifications.length - unreadCount }
        ]
    }

    const getTypeOptions = () => {
        return [
            { value: 'all', label: 'All Types' },
            { value: 'order', label: 'Orders' },
            { value: 'payment', label: 'Payments' },
            { value: 'system', label: 'System' }
        ]
    }

    const getNotificationType = (notificationType) => {
        if (['order_created', 'order_status_changed', 'order_cancelled', 'order_delivered'].includes(notificationType)) {
            return 'order'
        }
        if (['payment_success', 'payment_failed', 'payment_pending'].includes(notificationType)) {
            return 'payment'
        }
        return 'system'
    }

    const filteredNotificationsByType = type === 'all' 
        ? filteredNotifications 
        : filteredNotifications.filter(n => getNotificationType(n.type) === type)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your notifications and stay updated with order and payment status
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAll}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isMarkingAll ? 'Marking...' : 'Mark All as Read'}
                            </button>
                        )}
                        
                        {notifications.length - unreadCount > 0 && (
                            <button
                                onClick={handleClearRead}
                                disabled={isClearing}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isClearing ? 'Clearing...' : 'Clear Read'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-wrap gap-4">
                    {/* Filter by read status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <div className="flex space-x-2">
                            {getFilterOptions().map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setFilter(option.value)
                                        setCurrentPage(1)
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filter === option.value
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {option.label}
                                    {option.count > 0 && (
                                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                                            {option.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter by type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Type
                        </label>
                        <div className="flex space-x-2">
                            {getTypeOptions().map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setType(option.value)
                                        setCurrentPage(1)
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        type === option.value
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white shadow rounded-lg">
                {isLoadingNotifications || isLoadingFiltered ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                ) : filteredNotificationsByType.length > 0 ? (
                    <>
                        <div className="divide-y divide-gray-200">
                            {filteredNotificationsByType.map(notification => (
                                <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    onMarkAsRead={handleNotificationClick}
                                    onDelete={handleDeleteNotification}
                                    isCompact={false}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="p-4 border-t border-gray-200">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                    totalItems={pagination.totalItems}
                                    pageSize={20}
                                    currentPageCount={filteredNotificationsByType.length}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a7.5 7.5 0 0115 0v10z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'all' 
                                ? "You don't have any notifications yet."
                                : filter === 'unread'
                                ? "You're all caught up! No unread notifications."
                                : "No read notifications to show."
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}


export default Notifications
