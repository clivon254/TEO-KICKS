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
categorySchema.index({ parent: 1 })
categorySchema.index({ isActive: 1 })
categorySchema.index({ sortOrder: 1 })











// Instance method to get full path
categorySchema.methods.getFullPath = function() {

    const path = [this.name]

    if (this.parent) {

        path.unshift(this.parent.name)

    }

    return path.join(' > ')

}





// Static method to get root categories
categorySchema.statics.getRootCategories = function() {

    return this.find({ 
        parent: null, 
        isActive: true 
    }).sort({ sortOrder: 1, name: 1 })

}





// Static method to get category tree
categorySchema.statics.getCategoryTree = function() {

    return this.find({ isActive: true })
        .populate('children')
        .sort({ sortOrder: 1, name: 1 })

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
        {
            $sort: { sortOrder: 1, name: 1 }
        }
    ])

}





const Category = mongoose.model('Category', categorySchema)





export default Category 