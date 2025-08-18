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

    description: { 
        type: String,
        trim: true
    },

    image: { 
        type: String 
    },

    // Hierarchical structure
    parent: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },

    children: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],

    // Display settings
    isActive: { 
        type: Boolean, 
        default: true 
    },

    sortOrder: { 
        type: Number, 
        default: 0 
    },

    // SEO fields
    metaTitle: { 
        type: String,
        trim: true
    },

    metaDescription: { 
        type: String,
        trim: true
    },

    // Category features
    features: [{ 
        type: String,
        trim: true
    }],

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





// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function(next) {

    if (!this.slug && this.name) {

        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

    }

    next()

})





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