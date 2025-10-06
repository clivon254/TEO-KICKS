// Socket.IO notification utilities

export const emitNotification = (io, notification) => {
    // Emit to specific user
    io.to(`user_${notification.userId}`).emit('notification', {
        _id: notification._id,
        type: notification.type,
        payload: notification.payload,
        read: notification.read,
        createdAt: notification.createdAt
    })
}

export const emitToRole = (io, role, notification) => {
    // Emit to all users with specific role
    io.to(`${role}_room`).emit('notification', notification)
}

export const emitOrderUpdate = (io, orderId, orderData) => {
    // Emit to order subscribers
    io.to(`order_${orderId}`).emit('order.updated', orderData)
}

export const emitPaymentUpdate = (io, paymentId, paymentData) => {
    // Emit to payment subscribers
    io.to(`payment_${paymentId}`).emit('payment.updated', paymentData)
}

export const emitInvoiceCreated = (io, invoiceData) => {
    // Emit invoice creation globally
    io.emit('invoice.created', invoiceData)
}

export const emitReceiptCreated = (io, receiptData) => {
    // Emit receipt creation globally
    io.emit('receipt.created', receiptData)
}

export const emitOrderCreated = (io, orderData) => {
    // Emit order creation globally
    io.emit('order.created', orderData)
}

export const emitPaymentCallback = (io, callbackData) => {
    // Emit payment callback globally (for M-Pesa)
    io.emit('callback.received', callbackData)
}
