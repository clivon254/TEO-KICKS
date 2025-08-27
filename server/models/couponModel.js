import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minimumOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    maximumDiscountAmount: {
        type: Number,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    hasExpiry: {
        type: Boolean,
        default: false
    },
    expiryDate: {
        type: Date
    },
    hasUsageLimit: {
        type: Boolean,
        default: false
    },
    usageLimit: {
        type: Number,
        min: 1
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isFirstTimeOnly: {
        type: Boolean,
        default: false
    },
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    excludedCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUsedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
})

// Indexes for better performance
couponSchema.index({ code: 1 })
couponSchema.index({ isActive: 1, expiryDate: 1 })
couponSchema.index({ createdBy: 1 })

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function() {
    if (!this.hasExpiry || !this.expiryDate) {
        return false
    }
    return new Date() > this.expiryDate
})

// Virtual for checking if coupon usage limit is reached
couponSchema.virtual('isUsageLimitReached').get(function() {
    if (!this.hasUsageLimit) {
        return false
    }
    return this.usedCount >= this.usageLimit
})

// Virtual for checking if coupon is valid
couponSchema.virtual('isValid').get(function() {
    return this.isActive && !this.isExpired && !this.isUsageLimitReached
})

// Virtual for remaining usage count
couponSchema.virtual('remainingUsage').get(function() {
    if (!this.hasUsageLimit) {
        return null // No limit
    }
    return Math.max(0, this.usageLimit - this.usedCount)
})

// Method to generate unique coupon code
couponSchema.statics.generateUniqueCode = async function(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code
    let isUnique = false
    
    while (!isUnique) {
        code = ''
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        
        // Check if code already exists
        const existingCoupon = await this.findOne({ code })
        if (!existingCoupon) {
            isUnique = true
        }
    }
    
    return code
}

// Method to validate coupon
couponSchema.methods.validateCoupon = function(userId, orderAmount = 0) {
    // Check if coupon is active
    if (!this.isActive) {
        return { isValid: false, message: 'Coupon is not active' }
    }
    
    // Check if coupon is expired
    if (this.isExpired) {
        return { isValid: false, message: 'Coupon has expired' }
    }
    
    // Check if usage limit is reached
    if (this.isUsageLimitReached) {
        return { isValid: false, message: 'Coupon usage limit reached' }
    }
    
    // Check minimum order amount
    if (orderAmount < this.minimumOrderAmount) {
        return { 
            isValid: false, 
            message: `Minimum order amount of ${this.minimumOrderAmount} required` 
        }
    }
    
    // Check if first time only and user has used it before
    if (this.isFirstTimeOnly) {
        const hasUsedBefore = this.lastUsedBy.some(usage => 
            usage.user.toString() === userId
        )
        if (hasUsedBefore) {
            return { isValid: false, message: 'Coupon can only be used once per customer' }
        }
    }
    
    return { isValid: true, message: 'Coupon is valid' }
}

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
    let discountAmount = 0
    
    if (this.discountType === 'percentage') {
        discountAmount = (orderAmount * this.discountValue) / 100
    } else {
        discountAmount = this.discountValue
    }
    
    // Apply maximum discount limit if set
    if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
        discountAmount = this.maximumDiscountAmount
    }
    
    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount)
    
    return Math.round(discountAmount * 100) / 100 // Round to 2 decimal places
}

// Method to increment usage count
couponSchema.methods.incrementUsage = function(userId) {
    this.usedCount += 1
    this.lastUsedBy.push({
        user: userId,
        usedAt: new Date()
    })
    return this.save()
}

// Ensure virtual fields are serialized
couponSchema.set('toJSON', { virtuals: true })
couponSchema.set('toObject', { virtuals: true })

const Coupon = mongoose.model('Coupon', couponSchema)

export default Coupon 