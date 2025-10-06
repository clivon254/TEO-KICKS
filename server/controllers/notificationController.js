import Notification from '../models/notificationModel.js'
import User from '../models/userModel.js'
import { sendNotification, sendNotificationToRole, sendBulkNotifications } from '../services/notificationService.js'
import { errorHandler } from '../utils/error.js'


// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, type, read } = req.query
        const userId = req.user._id

        // Build filter
        const filter = { userId }
        if (type) filter.type = type
        if (read !== undefined) filter.read = read === 'true'

        // Get notifications with pagination
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email phone')

        // Get total count
        const total = await Notification.countDocuments(filter)

        res.json({
            success: true,
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        })
    } catch (error) {
        console.error('Get notifications error:', error)
        next(errorHandler(500, "Server error while fetching notifications"))
    }
}


// @desc    Get unread notifications count
// @route   GET /api/notifications/unread
// @access  Private
export const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user._id

        const unreadCount = await Notification.countDocuments({
            userId,
            read: false
        })

        res.json({
            success: true,
            unreadCount
        })
    } catch (error) {
        console.error('Get unread count error:', error)
        next(errorHandler(500, "Server error while fetching unread count"))
    }
}


// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user._id

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { read: true },
            { new: true }
        )

        if (!notification) {
            return next(errorHandler(404, "Notification not found"))
        }

        res.json({
            success: true,
            message: "Notification marked as read",
            notification
        })
    } catch (error) {
        console.error('Mark as read error:', error)
        next(errorHandler(500, "Server error while marking notification as read"))
    }
}


// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id

        const result = await Notification.updateMany(
            { userId, read: false },
            { read: true }
        )

        res.json({
            success: true,
            message: `${result.modifiedCount} notifications marked as read`,
            modifiedCount: result.modifiedCount
        })
    } catch (error) {
        console.error('Mark all as read error:', error)
        next(errorHandler(500, "Server error while marking all notifications as read"))
    }
}


// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user._id

        const notification = await Notification.findOneAndDelete({ _id: id, userId })

        if (!notification) {
            return next(errorHandler(404, "Notification not found"))
        }

        res.json({
            success: true,
            message: "Notification deleted successfully"
        })
    } catch (error) {
        console.error('Delete notification error:', error)
        next(errorHandler(500, "Server error while deleting notification"))
    }
}


// @desc    Clear all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
export const clearReadNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id

        const result = await Notification.deleteMany({
            userId,
            read: true
        })

        res.json({
            success: true,
            message: `${result.deletedCount} read notifications cleared`,
            deletedCount: result.deletedCount
        })
    } catch (error) {
        console.error('Clear read notifications error:', error)
        next(errorHandler(500, "Server error while clearing read notifications"))
    }
}


// @desc    Get all notifications (admin)
// @route   GET /api/admin/notifications
// @access  Private (Admin)
export const getAllNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, type, userId, read } = req.query

        // Build filter
        const filter = {}
        if (type) filter.type = type
        if (userId) filter.userId = userId
        if (read !== undefined) filter.read = read === 'true'

        // Get notifications with pagination
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email phone roles')

        // Get total count
        const total = await Notification.countDocuments(filter)

        res.json({
            success: true,
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        })
    } catch (error) {
        console.error('Get all notifications error:', error)
        next(errorHandler(500, "Server error while fetching all notifications"))
    }
}


// @desc    Send broadcast notification (admin)
// @route   POST /api/admin/notifications/broadcast
// @access  Private (Admin)
export const sendBroadcastNotification = async (req, res, next) => {
    try {
        const { title, message, type, channels, recipients, targetUsers } = req.body

        // Validate required fields
        if (!title || !message || !type || !channels || !recipients) {
            return next(errorHandler(400, "Missing required fields"))
        }

        let notificationResults = []

        // Send to all users
        if (recipients === 'all') {
            const users = await User.find({})
            const notifications = users.map(user => ({
                userId: user._id,
                type,
                payload: { title, message },
                channels
            }))
            notificationResults = await sendBulkNotifications(notifications)
        }
        // Send to customers only
        else if (recipients === 'customers') {
            const users = await User.find({ roles: { $nin: ['admin', 'manager', 'staff'] } })
            const notifications = users.map(user => ({
                userId: user._id,
                type,
                payload: { title, message },
                channels
            }))
            notificationResults = await sendBulkNotifications(notifications)
        }
        // Send to admins only
        else if (recipients === 'admins') {
            notificationResults = await sendNotificationToRole('admin', {
                type,
                payload: { title, message },
                channels
            })
        }
        // Send to specific users
        else if (recipients === 'specific' && targetUsers?.length > 0) {
            const notifications = targetUsers.map(userId => ({
                userId,
                type,
                payload: { title, message },
                channels
            }))
            notificationResults = await sendBulkNotifications(notifications)
        }

        // Emit socket events for real-time updates
        const io = req.app.get('io')
        if (io) {
            notificationResults.forEach(result => {
                if (result.inapp.success) {
                    io.to(`user_${result.userId}`).emit('notification', {
                        _id: result.inapp.notificationId,
                        type,
                        payload: { title, message },
                        read: false,
                        createdAt: new Date()
                    })
                }
            })
        }

        res.json({
            success: true,
            message: "Broadcast notification sent successfully",
            results: notificationResults,
            totalSent: notificationResults.length
        })
    } catch (error) {
        console.error('Send broadcast notification error:', error)
        next(errorHandler(500, "Server error while sending broadcast notification"))
    }
}


// @desc    Get notification statistics (admin)
// @route   GET /api/admin/notifications/stats
// @access  Private (Admin)
export const getNotificationStats = async (req, res, next) => {
    try {
        const { period = '30d' } = req.query

        // Calculate date range based on period
        const now = new Date()
        let startDate
        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                break
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
                break
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }

        // Get notification statistics
        const totalSent = await Notification.countDocuments({
            createdAt: { $gte: startDate }
        })

        const totalUnread = await Notification.countDocuments({
            read: false,
            createdAt: { $gte: startDate }
        })

        const notificationsByType = await Notification.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ])

        const notificationsByChannel = await Notification.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $unwind: '$channels'
            },
            {
                $group: {
                    _id: '$channels',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ])

        const dailyNotifications = await Notification.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ])

        res.json({
            success: true,
            stats: {
                totalSent,
                totalUnread,
                readRate: totalSent > 0 ? ((totalSent - totalUnread) / totalSent * 100).toFixed(2) : 0,
                notificationsByType,
                notificationsByChannel,
                dailyNotifications,
                period
            }
        })
    } catch (error) {
        console.error('Get notification stats error:', error)
        next(errorHandler(500, "Server error while fetching notification statistics"))
    }
}
