import mongoose from "mongoose"


const notificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    type: {
        type: String,
        enum: [
            "order_created",
            "order_status_changed", 
            "order_cancelled",
            "order_delivered",
            "payment_success",
            "payment_failed",
            "payment_pending",
            "invoice_generated",
            "receipt_issued",
            "low_stock_alert",
            "promotion_alert",
            "welcome_message",
            "password_reset",
            "otp_verification",
            "new_order_received",
            "payment_received"
        ],
        required: true
    },
    payload: { 
        type: mongoose.Schema.Types.Mixed, 
        default: {} 
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    channels: [{
        type: String,
        enum: ['inapp', 'sms', 'email']
    }],
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
})


// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ type: 1, createdAt: -1 })
notificationSchema.index({ read: 1, userId: 1 })


const Notification = mongoose.model("Notification", notificationSchema)


export default Notification

