import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"





const skuSchema = new mongoose.Schema({

    attributes: [{
        variantId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Variant',
            required: true
        },
        optionId: { 
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }],

    price: { 
        type: Number, 
        required: true,
        min: 0
    },

    comparePrice: { 
        type: Number,
        min: 0
    },

    stock: { 
        type: Number, 
        default: 0,
        min: 0
    },

    skuCode: { 
        type: String,
        required: true,
        unique: true
    },

    barcode: { 
        type: String 
    },

    weight: { 
        type: Number,
        min: 0
    },

    dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 }
    },

    isActive: { 
        type: Boolean, 
        default: true 
    },

    // For pre-order functionality
    allowPreOrder: { 
        type: Boolean, 
        default: false 
    },

    preOrderStock: { 
        type: Number, 
        default: 0 
    },

    // For low stock alerts
    lowStockThreshold: { 
        type: Number, 
        default: 5 
    }

}, {
    timestamps: true
})





const productSchema = new mongoose.Schema({

    title: { 
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

    shortDescription: { 
        type: String,
        trim: true,
        maxlength: 200
    },

    brand: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },

    images: [{
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],

    categories: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],

    collections: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection'
    }],

    tags: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],

    // Base pricing
    basePrice: { 
        type: Number, 
        required: true,
        min: 0
    },

    comparePrice: { 
        type: Number,
        min: 0
    },

    // Variant references
    variants: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant'
    }],

    // SKUs for specific variant combinations
    skus: [skuSchema],

    // Product status
    status: { 
        type: String, 
        enum: ["active", "draft", "archived"],
        default: "draft"
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

    // Inventory settings
    trackInventory: { 
        type: Boolean, 
        default: true 
    },



    // Shipping settings
    weight: { 
        type: Number,
        min: 0
    },

 
   
    // Product features
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
productSchema.index({ status: 1 })
productSchema.index({ categories: 1 })
productSchema.index({ collections: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ tags: 1 })
// Note: skuCode index is automatically created due to unique: true in skuSchema
productSchema.index({ createdAt: -1 })







// Instance method to generate SKUs based on variants
productSchema.methods.generateSKUs = async function() {

    if (!this.variants || this.variants.length === 0) {

        // Create a single default SKU
        this.skus = [{
            attributes: [],
            price: this.basePrice,
            stock: 0,
            skuCode: this.generateSKUCode([])
        }]

        return this.save()

    }

    // Get variant details with options
    const Variant = mongoose.model('Variant')
    const variants = await Variant.find({ _id: { $in: this.variants } })

    // Generate all possible combinations
    const combinations = this.generateCombinations(variants)

    // Create SKUs for each combination
    this.skus = combinations.map(combination => ({
        attributes: combination,
        price: this.basePrice,
        stock: 0,
        skuCode: this.generateSKUCode(combination)
    }))

    return this.save()

}





// Helper method to generate combinations
productSchema.methods.generateCombinations = function(variants) {

    if (variants.length === 0) return [[]]

    const [firstVariant, ...restVariants] = variants
    const restCombinations = this.generateCombinations(restVariants)

    const combinations = []

    firstVariant.options.forEach(option => {

        const attribute = {
            variantId: firstVariant._id,
            optionId: option._id
        }

        restCombinations.forEach(restCombination => {

            combinations.push([attribute, ...restCombination])

        })

    })

    return combinations

}





// Helper method to generate SKU code
productSchema.methods.generateSKUCode = function(attributes) {

    if (attributes.length === 0) {

        return `${this.slug.toUpperCase()}-DEFAULT`

    }

    const optionValues = attributes.map(attr => {

        // Find the option value (this would need to be enhanced with actual option lookup)
        return attr.optionId.toString().slice(-4).toUpperCase()

    }).join('-')

    return `${this.slug.toUpperCase()}-${optionValues}`

}





// Instance method to update SKU
productSchema.methods.updateSKU = function(skuId, updateData) {

    const sku = this.skus.id(skuId)

    if (sku) {

        Object.assign(sku, updateData)

        return this.save()

    }

    throw new Error('SKU not found')

}





// Instance method to delete SKU
productSchema.methods.deleteSKU = function(skuId) {

    this.skus = this.skus.filter(sku => sku._id.toString() !== skuId.toString())

    return this.save()

}





// Static method to get active products
productSchema.statics.getActive = function() {

    return this.find({ status: "active" }).sort({ createdAt: -1 })

}





// Static method to get products with variants and SKUs
productSchema.statics.getWithVariants = function() {

    return this.find()
        .populate('variants')
        .populate('categories')
        .populate('collections')
        .sort({ createdAt: -1 })

}





// Static method to search products
productSchema.statics.search = function(query) {

    return this.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ],
        status: "active"
    }).populate('brand', 'name')
      .populate('tags', 'name')
      .populate('categories', 'name')
      .populate('collections', 'name')
      .sort({ createdAt: -1 })

}

// Static method to search products by brand and tags
productSchema.statics.searchByBrandAndTags = function(brandId, tagIds) {

    const query = { status: "active" }

    if (brandId) {
        query.brand = brandId
    }

    if (tagIds && tagIds.length > 0) {
        query.tags = { $in: tagIds }
    }

    return this.find(query)
        .populate('brand', 'name')
        .populate('tags', 'name')
        .populate('categories', 'name')
        .populate('collections', 'name')
        .sort({ createdAt: -1 })

}





// Add pagination plugin
productSchema.plugin(mongoosePaginate)





const Product = mongoose.model('Product', productSchema)





export default Product 