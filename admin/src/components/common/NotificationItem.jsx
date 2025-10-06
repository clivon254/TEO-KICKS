import React from 'react'
// Using React Icons instead of Heroicons
import { 
    BsBag, 
    BsCheckCircle, 
    BsTruck, 
    BsBell,
    BsExclamationTriangle,
    BsCurrencyDollar,
    BsReceipt,
    BsGift,
    BsPerson,
    BsKey
} from 'react-icons/bs'


const NotificationItem = ({ 
    notification, 
    onMarkAsRead, 
    onDelete, 
    isCompact = false,
    className = '' 
}) => {
    const getNotificationIcon = (type) => {
        switch(type) {
            case 'order_created':
                return <BsBag className="w-5 h-5 text-blue-600" />
            case 'payment_success':
                return <BsCheckCircle className="w-5 h-5 text-green-600" />
            case 'order_status_changed':
                return <BsTruck className="w-5 h-5 text-orange-600" />
            case 'order_cancelled':
                return <BsExclamationTriangle className="w-5 h-5 text-red-600" />
            case 'order_delivered':
                return <BsCheckCircle className="w-5 h-5 text-green-600" />
            case 'payment_failed':
                return <BsExclamationTriangle className="w-5 h-5 text-red-600" />
            case 'payment_pending':
                return <BsCurrencyDollar className="w-5 h-5 text-yellow-600" />
            case 'invoice_generated':
                return <BsReceipt className="w-5 h-5 text-indigo-600" />
            case 'receipt_issued':
                return <BsReceipt className="w-5 h-5 text-green-600" />
            case 'low_stock_alert':
                return <BsExclamationTriangle className="w-5 h-5 text-orange-600" />
            case 'promotion_alert':
                return <BsGift className="w-5 h-5 text-purple-600" />
            case 'welcome_message':
                return <BsPerson className="w-5 h-5 text-blue-600" />
            case 'password_reset':
                return <BsKey className="w-5 h-5 text-gray-600" />
            case 'otp_verification':
                return <BsKey className="w-5 h-5 text-gray-600" />
            case 'new_order_received':
                return <BsBag className="w-5 h-5 text-blue-600" />
            case 'payment_received':
                return <BsCurrencyDollar className="w-5 h-5 text-green-600" />
            default:
                return <BsBell className="w-5 h-5 text-gray-600" />
        }
    }

    const getNotificationMessage = (notification) => {
        const { type, payload } = notification

        switch(type) {
            case 'order_created':
                return `Order ${payload.orderNumber || payload.orderId} has been placed successfully. Total: KSh ${payload.totalAmount}`
            case 'payment_success':
                return `Payment of KSh ${payload.amount} for order ${payload.orderId} was successful`
            case 'order_status_changed':
                return `Order ${payload.orderId} status updated to ${payload.newStatus}`
            case 'order_cancelled':
                return `Order ${payload.orderId} has been cancelled`
            case 'order_delivered':
                return `Order ${payload.orderId} has been delivered successfully!`
            case 'payment_failed':
                return `Payment for order ${payload.orderId} failed. ${payload.reason || 'Please try again.'}`
            case 'payment_pending':
                return `Payment for order ${payload.orderId} is pending confirmation`
            case 'invoice_generated':
                return `Invoice generated for order ${payload.orderId}`
            case 'receipt_issued':
                return `Receipt ${payload.receiptNumber} has been issued for order ${payload.orderId}`
            case 'low_stock_alert':
                return `Low stock alert: ${payload.productName} (${payload.variant}) - ${payload.currentStock} remaining`
            case 'promotion_alert':
                return `${payload.title}: ${payload.description}`
            case 'welcome_message':
                return `Welcome to TEO KICKS! Your account has been created successfully.`
            case 'password_reset':
                return `Password reset instructions have been sent to your email`
            case 'otp_verification':
                return `OTP verification code has been sent`
            case 'new_order_received':
                return `New order received from ${payload.customerName} - KSh ${payload.totalAmount}`
            case 'payment_received':
                return `Payment received from ${payload.customerName} - KSh ${payload.amount}`
            default:
                return 'You have a new notification'
        }
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now - date) / (1000 * 60))

        if (diffInMinutes < 1) {
            return 'Just now'
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}h ago`
        } else {
            return `${Math.floor(diffInMinutes / 1440)}d ago`
        }
    }

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification._id)
        }
    }

    if (isCompact) {
        return (
            <div 
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-white'
                } ${className}`}
                onClick={handleClick}
            >
                <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                        {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                    </p>
                </div>
                {!notification.read && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div 
            className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
                !notification.read ? 'bg-blue-50' : 'bg-white'
            } ${className}`}
            onClick={handleClick}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                            {getNotificationMessage(notification)}
                        </p>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                            </span>
                            {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                        </div>
                    </div>
                    
                    {/* Additional details for certain notification types */}
                    {notification.payload && (
                        <div className="mt-2 text-xs text-gray-500">
                            {notification.type === 'order_created' && notification.payload.estimatedDelivery && (
                                <p>Estimated delivery: {notification.payload.estimatedDelivery}</p>
                            )}
                            {notification.type === 'order_status_changed' && notification.payload.trackingNumber && (
                                <p>Tracking: {notification.payload.trackingNumber}</p>
                            )}
                            {notification.type === 'payment_success' && notification.payload.receiptNumber && (
                                <p>Receipt: {notification.payload.receiptNumber}</p>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Delete button */}
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(notification._id)
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}


export default NotificationItem
