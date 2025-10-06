import Notification from '../models/notificationModel.js'
import User from '../models/userModel.js'
import { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail } from "./emailService.js"
import { sendOTPSMS, sendPasswordResetSMS, sendWelcomeSMS, sendOrderNotificationSMS } from "./smsService.js"
import { errorHandler } from "../utils/error.js"


// Core notification creation
export const createNotification = async (notificationData) => {
    const notification = new Notification(notificationData)
    await notification.save()
    return notification
}


// Send notification via multiple channels
export const sendNotification = async ({
    userId,
    type,
    payload,
    channels = ['inapp'],
    recipients = ['user']
}) => {
    const results = {
        inapp: { success: false },
        sms: { success: false },
        email: { success: false }
    }

    // Always create in-app notification
    if (channels.includes('inapp')) {
        try {
            const notification = await createNotification({
                userId,
                type,
                payload,
                channels,
                read: false
            })
            results.inapp = { success: true, notificationId: notification._id }
        } catch (error) {
            console.error('Error creating in-app notification:', error)
            results.inapp = { success: false, error: error.message }
        }
    }

    // Send SMS if requested and user has phone
    if (channels.includes('sms')) {
        try {
            const user = await User.findById(userId)
            if (user?.phone) {
                results.sms = await sendNotificationSMS(user.phone, type, payload, user.name)
            } else {
                results.sms = { success: false, error: "User has no phone number" }
            }
        } catch (error) {
            console.error('Error sending SMS notification:', error)
            results.sms = { success: false, error: error.message }
        }
    }

    // Send email if requested and user has email
    if (channels.includes('email')) {
        try {
            const user = await User.findById(userId)
            if (user?.email) {
                results.email = await sendNotificationEmail(user.email, type, payload, user.name)
            } else {
                results.email = { success: false, error: "User has no email address" }
            }
        } catch (error) {
            console.error('Error sending email notification:', error)
            results.email = { success: false, error: error.message }
        }
    }

    return results
}


// Send bulk notifications
export const sendBulkNotifications = async (notifications) => {
    const results = []
    
    for (const notification of notifications) {
        const result = await sendNotification(notification)
        results.push(result)
    }
    
    return results
}


// Send notification to all users with specific role
export const sendNotificationToRole = async (role, notificationData) => {
    try {
        const users = await User.find({ roles: { $in: [role] } })
        const notifications = users.map(user => ({
            userId: user._id,
            ...notificationData
        }))
        
        return await sendBulkNotifications(notifications)
    } catch (error) {
        console.error('Error sending notifications to role:', error)
        throw error
    }
}


// Send notification SMS
export const sendNotificationSMS = async (phone, type, payload, name = "User") => {
    try {
        let message = ""
        
        switch (type) {
            case 'order_created':
                message = `Hi ${name}, your order ${payload.orderNumber} has been placed successfully. Total: KSh ${payload.totalAmount}. Thank you for shopping with TEO KICKS!`
                break
            case 'payment_success':
                message = `Hi ${name}, payment of KSh ${payload.amount} for order ${payload.orderId} was successful. Thank you!`
                break
            case 'order_status_changed':
                message = `Hi ${name}, your order ${payload.orderId} status has been updated to ${payload.newStatus}. ${payload.trackingNumber ? `Tracking: ${payload.trackingNumber}` : ''}`
                break
            case 'order_delivered':
                message = `Hi ${name}, your order ${payload.orderId} has been delivered successfully! Thank you for shopping with TEO KICKS.`
                break
            case 'payment_failed':
                message = `Hi ${name}, payment for order ${payload.orderId} failed. Please try again or contact support.`
                break
            default:
                message = `Hi ${name}, you have a new notification from TEO KICKS.`
        }
        
        const result = await sendOrderNotificationSMS(phone, payload.orderNumber || payload.orderId, type, name)
        return result
    } catch (error) {
        console.error('Error sending notification SMS:', error)
        return { success: false, error: error.message }
    }
}


// Send notification email
export const sendNotificationEmail = async (email, type, payload, name = "User") => {
    try {
        let subject = ""
        let htmlContent = ""
        
        switch (type) {
            case 'order_created':
                subject = `Order Confirmation - ${payload.orderNumber}`
                htmlContent = `
                    <h2>Order Confirmation</h2>
                    <p>Hi ${name},</p>
                    <p>Your order has been placed successfully!</p>
                    <p><strong>Order Number:</strong> ${payload.orderNumber}</p>
                    <p><strong>Total Amount:</strong> KSh ${payload.totalAmount}</p>
                    <p><strong>Estimated Delivery:</strong> ${payload.estimatedDelivery}</p>
                    <p>Thank you for shopping with TEO KICKS!</p>
                `
                break
            case 'payment_success':
                subject = `Payment Confirmation - Order ${payload.orderId}`
                htmlContent = `
                    <h2>Payment Confirmation</h2>
                    <p>Hi ${name},</p>
                    <p>Your payment has been processed successfully!</p>
                    <p><strong>Payment Amount:</strong> KSh ${payload.amount}</p>
                    <p><strong>Payment Method:</strong> ${payload.method}</p>
                    <p><strong>Receipt Number:</strong> ${payload.receiptNumber}</p>
                    <p>Thank you!</p>
                `
                break
            case 'order_status_changed':
                subject = `Order Update - ${payload.orderId}`
                htmlContent = `
                    <h2>Order Status Update</h2>
                    <p>Hi ${name},</p>
                    <p>Your order status has been updated:</p>
                    <p><strong>Order ID:</strong> ${payload.orderId}</p>
                    <p><strong>New Status:</strong> ${payload.newStatus}</p>
                    ${payload.trackingNumber ? `<p><strong>Tracking Number:</strong> ${payload.trackingNumber}</p>` : ''}
                    ${payload.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${payload.estimatedDelivery}</p>` : ''}
                `
                break
            case 'promotion_alert':
                subject = payload.title || 'New Promotion Available'
                htmlContent = `
                    <h2>${payload.title}</h2>
                    <p>Hi ${name},</p>
                    <p>${payload.description}</p>
                    ${payload.couponCode ? `<p><strong>Coupon Code:</strong> ${payload.couponCode}</p>` : ''}
                    ${payload.validUntil ? `<p><strong>Valid Until:</strong> ${payload.validUntil}</p>` : ''}
                    <p>Don't miss out on this great offer!</p>
                `
                break
            default:
                subject = "Notification from TEO KICKS"
                htmlContent = `
                    <h2>Notification</h2>
                    <p>Hi ${name},</p>
                    <p>You have a new notification from TEO KICKS.</p>
                `
        }
        
        // Use existing email service structure
        const { createTransporter } = await import('./emailService.js')
        const transporter = createTransporter()
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent
        }
        
        await transporter.sendMail(mailOptions)
        
        return { success: true, message: "Email sent successfully" }
    } catch (error) {
        console.error('Error sending notification email:', error)
        return { success: false, error: error.message }
    }
}


// Send OTP via both email and SMS
export const sendOTPNotification = async (email, phone, otp, name = "User") => {
    const results = {
        email: { success: false, attempted: false },
        sms: { success: false, attempted: false }
    }

    let successCount = 0

    // Send email
    if (email) {
        results.email.attempted = true
        try {
            results.email = await sendOTPEmail(email, otp, name)
            if (results.email.success) successCount++
        } catch (error) {
            console.error('Email service error:', error.message)
            results.email = { success: false, attempted: true, error: error.message }
        }
    }

    // Send SMS - only if credentials are properly configured
    if (phone && process.env.AT_API_KEY && process.env.AT_USERNAME) {
        results.sms.attempted = true
        try {
            results.sms = await sendOTPSMS(phone, otp, name)
            if (results.sms.success) successCount++
        } catch (error) {
            console.error('SMS service error:', error.message)
            results.sms = { success: false, attempted: true, error: error.message }
        }
    } else if (phone) {
        console.warn('SMS not sent: Africa\'s Talking credentials not configured')
        results.sms = { success: false, attempted: false, error: "SMS credentials not configured" }
    }

    // Determine overall success
    const overallSuccess = successCount > 0

    let message = ""
    if (successCount === 2) {
        message = "OTP sent successfully via email and SMS"
    } else if (results.email.success) {
        message = "OTP sent successfully via email"
    } else if (results.sms.success) {
        message = "OTP sent successfully via SMS"
    } else {
        message = "Failed to send OTP - please check your configuration"
    }

    return {
        success: overallSuccess,
        results: results,
        message: message,
        successCount: successCount
    }
}


// Send password reset via both email and SMS
export const sendPasswordResetNotification = async (email, phone, resetToken, name = "User") => {
    const results = {
        email: { success: false },
        sms: { success: false }
    }

    // Send email
    if (email) {
        try {
            results.email = await sendPasswordResetEmail(email, resetToken, name)
        } catch (error) {
            console.error('Error sending password reset email:', error)
            results.email = { success: false, error: error.message }
        }
    }

    // Send SMS
    if (phone) {
        try {
            results.sms = await sendPasswordResetSMS(phone, resetToken, name)
        } catch (error) {
            console.error('Error sending password reset SMS:', error)
            results.sms = { success: false, error: error.message }
        }
    }

    // Return success if at least one method succeeded
    const overallSuccess = results.email.success || results.sms.success

    return {
        success: overallSuccess,
        results: results,
        message: overallSuccess 
            ? "Password reset instructions sent successfully" 
            : "Failed to send password reset instructions"
    }
}


// Send welcome message via both email and SMS
export const sendWelcomeNotification = async (email, phone, name) => {
    const results = {
        email: { success: false },
        sms: { success: false }
    }

    // Send email
    if (email) {
        try {
            results.email = await sendWelcomeEmail(email, name)
        } catch (error) {
            console.error('Error sending welcome email:', error)
            results.email = { success: false, error: error.message }
        }
    }

    // Send SMS
    if (phone) {
        try {
            results.sms = await sendWelcomeSMS(phone, name)
        } catch (error) {
            console.error('Error sending welcome SMS:', error)
            results.sms = { success: false, error: error.message }
        }
    }

    // Return success if at least one method succeeded
    const overallSuccess = results.email.success || results.sms.success

    return {
        success: overallSuccess,
        results: results,
        message: overallSuccess 
            ? "Welcome message sent successfully" 
            : "Failed to send welcome message"
    }
}


// Send order notification (primarily SMS, but could extend to email)
export const sendOrderNotification = async (phone, orderNumber, status, name = "Customer") => {
    try {
        const result = await sendOrderNotificationSMS(phone, orderNumber, status, name)
        return {
            success: result.success,
            result: result,
            message: result.success 
                ? "Order notification sent successfully" 
                : "Failed to send order notification"
        }
    } catch (error) {
        console.error('Error sending order notification:', error)
        return {
            success: false,
            error: error.message,
            message: "Failed to send order notification"
        }
    }
}