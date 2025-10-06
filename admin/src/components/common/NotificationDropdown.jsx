import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationItem from './NotificationItem'


const NotificationDropdown = ({ 
    isOpen, 
    onClose, 
    className = '' 
}) => {
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const dropdownRef = useRef(null)
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        isLoadingNotifications 
    } = useNotifications()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    // Show only recent notifications (last 10)
    const recentNotifications = notifications.slice(0, 10)

    const handleMarkAllAsRead = () => {
        markAllAsRead()
        onClose()
    }

    const handleNotificationClick = (notificationId) => {
        markAsRead(notificationId)
    }

    const handleDeleteNotification = (notificationId) => {
        deleteNotification(notificationId)
    }

    return (
        <div 
            ref={dropdownRef}
            className={`absolute  mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {unreadCount}
                        </span>
                    )}
                </h3>
                
                <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {isLoadingNotifications ? (
                    <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                ) : recentNotifications.length > 0 ? (
                    <div>
                        {recentNotifications.map(notification => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onMarkAsRead={handleNotificationClick}
                                onDelete={handleDeleteNotification}
                                isCompact={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a7.5 7.5 0 0115 0v10z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You're all caught up! Check back later for updates.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    )
}


export default NotificationDropdown
