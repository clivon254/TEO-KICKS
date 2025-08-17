import mongoose from "mongoose"


const addressSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    label: {
        type: String,
        required: [true, "Address label is required"],
        trim: true,
        maxLength: [50, "Label cannot exceed 50 characters"]
    },

    street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
        maxLength: [200, "Street address cannot exceed 200 characters"]
    },

    city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxLength: [100, "City cannot exceed 100 characters"]
    },

    region: {
        type: String,
        required: [true, "Region/County is required"],
        trim: true,
        maxLength: [100, "Region cannot exceed 100 characters"]
    },

    country: {
        type: String,
        default: "Kenya",
        trim: true,
        maxLength: [100, "Country cannot exceed 100 characters"]
    },

    postal: {
        type: String,
        trim: true,
        maxLength: [20, "Postal code cannot exceed 20 characters"]
    },

    isDefault: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    // Google Places API specific fields
    googlePlaceId: {
        type: String,
        trim: true
    },

    coordinates: {
        latitude: {
            type: Number,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180
        }
    },

    formattedAddress: {
        type: String,
        trim: true,
        maxLength: [500, "Formatted address cannot exceed 500 characters"]
    },

    // Additional location details from Google Places
    locationDetails: {
        neighborhood: { type: String, trim: true },
        sublocality: { type: String, trim: true },
        administrativeArea: { type: String, trim: true },
        route: { type: String, trim: true },
        streetNumber: { type: String, trim: true }
    }

}, {
    timestamps: true
})


// Index for efficient queries
addressSchema.index({ userId: 1, isDefault: 1 })

addressSchema.index({ userId: 1, isActive: 1 })

addressSchema.index({ googlePlaceId: 1 })

// 2dsphere index for geospatial queries
addressSchema.index({ "coordinates": "2dsphere" })


// Ensure only one default address per user
addressSchema.pre('save', async function(next) {

    if (this.isDefault && this.isModified('isDefault')) {

        await this.constructor.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        )

    }

    next()

})


// Virtual for full address
addressSchema.virtual('fullAddress').get(function() {

    const parts = [this.street, this.city, this.region]

    if (this.postal) parts.push(this.postal)

    if (this.country && this.country !== 'Kenya') parts.push(this.country)

    return parts.join(', ')

})


// Ensure virtuals are included in JSON
addressSchema.set('toJSON', { virtuals: true })

addressSchema.set('toObject', { virtuals: true })


const Address = mongoose.model("Address", addressSchema)


export default Address