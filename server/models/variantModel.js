import mongoose from "mongoose"





const optionSchema = new mongoose.Schema({

    value: { 
        type: String, 
        required: true,
        trim: true
    },

    isActive: { 
        type: Boolean, 
        default: true 
    },

    sortOrder: { 
        type: Number, 
        default: 0 
    }

}, {
    timestamps: true
})





const variantSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    options: [optionSchema]

}, {
    timestamps: true
})





// Indexes for better query performance
// Note: name index is automatically created due to unique: true





// Pre-save middleware to ensure unique option values within a variant
variantSchema.pre('save', function(next) {

    if (this.options && this.options.length > 0) {

        const values = this.options.map(option => option.value.toLowerCase())

        const uniqueValues = [...new Set(values)]

        if (values.length !== uniqueValues.length) {

            return next(new Error('Duplicate option values are not allowed within a variant'))

        }

    }

    next()

})





// Instance method to add an option
variantSchema.methods.addOption = function(optionData) {

    this.options.push(optionData)

    return this.save()

}





// Instance method to remove an option
variantSchema.methods.removeOption = function(optionId) {

    this.options = this.options.filter(option => option._id.toString() !== optionId.toString())

    return this.save()

}





// Instance method to update an option
variantSchema.methods.updateOption = function(optionId, updateData) {

    const option = this.options.id(optionId)

    if (option) {

        Object.assign(option, updateData)

        return this.save()

    }

    throw new Error('Option not found')

}





// Static method to get all variants with their options
variantSchema.statics.getWithOptions = function() {

    return this.find()
        .select('name options')
        .sort({ name: 1 })

}










const Variant = mongoose.model('Variant', variantSchema)





export default Variant 