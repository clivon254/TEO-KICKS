import mongoose from "mongoose"





const categorySchema = new mongoose.Schema({

    name: { 
        type: String, 
        required: true,
        trim: true
    },

    slug: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true
    },

    // Display settings
    isActive: { 
        type: Boolean, 
        default: true 
    },

    // Created by
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {
    timestamps: true
})





// Indexes for better query performance
// Note: slug index is automatically created due to unique: true
categorySchema.index({ isActive: 1 })











// Instance method to get full path
// Note: hierarchy was removed; getFullPath now returns just the category name
categorySchema.methods.getFullPath = function() {
    return this.name
}





// Static method to get root categories
categorySchema.statics.getRootCategories = function() {
    return this.find({ isActive: true }).sort({ name: 1 })
}





// Static method to get category tree
categorySchema.statics.getCategoryTree = function() {
    return this.find({ isActive: true }).sort({ name: 1 })
}





// Static method to get category with products count
categorySchema.statics.getWithProductCount = function() {

    return this.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'categories',
                as: 'products'
            }
        },
        {
            $addFields: {
                productCount: { $size: '$products' }
            }
        },
        {
            $project: {
                products: 0
            }
        },
        { $sort: { name: 1 } }
    ])

}





const Category = mongoose.model('Category', categorySchema)





export default Category 