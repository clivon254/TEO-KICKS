import mongoose from "mongoose"



const addressSchema = new mongoose.Schema({

    label: { type: String, required: true }, // e.g., "Home", "Office"

    street: { type: String, required: true },

    city: { type: String, required: true },

    region: { type: String, required: true },

    country: { type: String, required: true, default: "Kenya" },

    postal: { type: String },

    isDefault: { type: Boolean, default: false }

}, { timestamps: true })



const oauthProviderSchema = new mongoose.Schema({

    provider: { type: String, enum: ["google", "apple", "instagram"], required: true },

    providerUserId: { type: String, required: true },

    email: { type: String, required: true },

    linkedAt: { type: Date, default: Date.now }

})



const notificationPreferencesSchema = new mongoose.Schema({

    email: { type: Boolean, default: true },

    sms: { type: Boolean, default: true },

    inApp: { type: Boolean, default: true },

    orderUpdates: { type: Boolean, default: true },

    promotions: { type: Boolean, default: false },

    stockAlerts: { type: Boolean, default: false }

})



const userSchema = new mongoose.Schema({
    
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, required: true },

    password: { type: String, required: true },

    avatar: { 
        type: String, 
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" 
    },

    // Authentication & Verification
    isVerified: { type: Boolean, default: false },

    otpCode: { type: String },

    otpExpiry: { type: Date },

    resetPasswordToken: { type: String },

    resetPasswordExpiry: { type: Date },

    // Role-based access control
    roles: [{ 
        type: String, 
        enum: ["customer", "staff", "admin", "rider"], 
        default: ["customer"] 
    }],

    // OAuth providers for social login
    oauthProviders: [oauthProviderSchema],

    // User addresses
    addresses: [addressSchema],

    // Notification preferences
    notificationPreferences: {
        type: notificationPreferencesSchema,
        default: () => ({})
    },

    // Location & timezone
    country: { type: String, default: "Kenya" },

    timezone: { type: String, default: "Africa/Nairobi" },

    // Account status
    isActive: { type: Boolean, default: true },

    lastLoginAt: { type: Date }

}, {
    timestamps: true
})







// Index for better query performance
// Note: email index is automatically created by unique: true
userSchema.index({ phone: 1 })

userSchema.index({ roles: 1 })

userSchema.index({ 'oauthProviders.provider': 1, 'oauthProviders.providerUserId': 1 })



// Method to check if user has specific role
userSchema.methods.hasRole = function(role) {
    return this.roles.includes(role)
}



// Method to check if user is admin
userSchema.methods.isAdmin = function() {
    return this.roles.includes('admin')
}



// Method to get default address
userSchema.methods.getDefaultAddress = function() {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0]
}



// Method to add OAuth provider
userSchema.methods.addOAuthProvider = function(provider, providerUserId, email) {
    const existingProvider = this.oauthProviders.find(p => 
        p.provider === provider && p.providerUserId === providerUserId
    )
    
    if (!existingProvider) {
        this.oauthProviders.push({
            provider,
            providerUserId,
            email,
            linkedAt: new Date()
        })
    }
}



const User = mongoose.model("User", userSchema)



export default User