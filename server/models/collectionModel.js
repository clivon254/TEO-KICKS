import mongoose from "mongoose"





const collectionSchema = new mongoose.Schema({

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

    banner: { 
        type: String 
    },

    // Collection type
    type: { 
        type: String, 
        enum: ["manual", "automatic"],
        default: "manual"
    },

    // For automatic collections
    conditions: [{
        field: { 
            type: String, 
            enum: ["title", "brand", "category", "tag", "price", "vendor"]
        },
        operator: { 
            type: String, 
            enum: ["equals", "contains", "starts_with", "ends_with", "greater_than", "less_than"]
        },
        value: { 
            type: String 
        }
    }],

    // Manual product selection
    products: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
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

    // Collection features
    features: [{ 
        type: String,
        trim: true
    }],

    // Publishing settings
    publishedAt: { 
        type: Date 
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
collectionSchema.index({ isActive: 1 })
collectionSchema.index({ sortOrder: 1 })
collectionSchema.index({ type: 1 })





// Pre-save middleware to generate slug if not provided
collectionSchema.pre('save', function(next) {

    if (!this.slug && this.name) {

        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

    }

    next()

})





// Instance method to get products in collection
collectionSchema.methods.getProducts = function() {

    if (this.type === "manual") {

        return mongoose.model('Product').find({
            _id: { $in: this.products },
            status: "active"
        }).sort({ createdAt: -1 })

    } else {

        // Build query based on conditions
        const query = { status: "active" }
        const conditions = []

        this.conditions.forEach(condition => {

            let fieldQuery = {}

            switch (condition.operator) {

                case "equals":
                    fieldQuery[condition.field] = condition.value
                    break

                case "contains":
                    fieldQuery[condition.field] = { $regex: condition.value, $options: 'i' }
                    break

                case "starts_with":
                    fieldQuery[condition.field] = { $regex: `^${condition.value}`, $options: 'i' }
                    break

                case "ends_with":
                    fieldQuery[condition.field] = { $regex: `${condition.value}$`, $options: 'i' }
                    break

                case "greater_than":
                    fieldQuery[condition.field] = { $gt: parseFloat(condition.value) }
                    break

                case "less_than":
                    fieldQuery[condition.field] = { $lt: parseFloat(condition.value) }
                    break

            }

            conditions.push(fieldQuery)

        })

        if (conditions.length > 0) {

            query.$and = conditions

        }

        return mongoose.model('Product').find(query).sort({ createdAt: -1 })

    }

}





// Instance method to add product to collection
collectionSchema.methods.addProduct = function(productId) {

    if (!this.products.includes(productId)) {

        this.products.push(productId)

        return this.save()

    }

    return Promise.resolve(this)

}





// Instance method to remove product from collection
collectionSchema.methods.removeProduct = function(productId) {

    this.products = this.products.filter(id => id.toString() !== productId.toString())

    return this.save()

}





// Static method to get active collections
collectionSchema.statics.getActive = function() {

    return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 })

}





// Static method to get collections with product count
collectionSchema.statics.getWithProductCount = function() {

    return this.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: 'products',
                foreignField: '_id',
                as: 'collectionProducts'
            }
        },
        {
            $addFields: {
                productCount: { $size: '$collectionProducts' }
            }
        },
        {
            $project: {
                collectionProducts: 0
            }
        },
        {
            $sort: { sortOrder: 1, name: 1 }
        }
    ])

}





const Collection = mongoose.model('Collection', collectionSchema)





export default Collection 