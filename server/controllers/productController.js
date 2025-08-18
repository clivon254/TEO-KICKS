import Product from "../models/productModel.js"

import { validateProduct, validateSKU } from "../utils/validation.js"





// Create a new product
export const createProduct = async (req, res) => {

    try {

        const { error, value } = validateProduct(req.body)

        if (error) {

            return res.status(400).json({

                success: false,

                message: "Validation error",

                error: error.details[0].message

            })

        }





        const product = new Product({

            ...value,

            createdBy: req.user._id

        })





        await product.save()





        res.status(201).json({

            success: true,

            message: "Product created successfully",

            data: product

        })

    } catch (error) {

        console.error("Create product error:", error)

        res.status(500).json({

            success: false,

            message: "Error creating product",

            error: error.message

        })

    }

}





// Get all products with pagination and filtering
export const getAllProducts = async (req, res) => {

    try {

        const { page = 1, limit = 10, search, category, collection, status } = req.query

        const query = {}





        // Add search filter

        if (search) {

            query.$or = [

                { title: { $regex: search, $options: 'i' } },

                { description: { $regex: search, $options: 'i' } }

            ]

        }





        // Add category filter

        if (category) {

            query.categories = category

        }





        // Add collection filter

        if (collection) {

            query.collections = collection

        }





        // Add status filter

        if (status) {

            query.status = status

        }





        const options = {

            page: parseInt(page),

            limit: parseInt(limit),

            populate: ['categories', 'collections', 'createdBy'],

            sort: { createdAt: -1 }

        }





        const products = await Product.paginate(query, options)





        res.json({

            success: true,

            message: "Products retrieved successfully",

            data: products.docs,

            pagination: {

                page: products.page,

                limit: products.limitDocs,

                totalDocs: products.totalDocs,

                totalPages: products.totalPages,

                hasNextPage: products.hasNextPage,

                hasPrevPage: products.hasPrevPage

            }

        })

    } catch (error) {

        console.error("Get all products error:", error)

        res.status(500).json({

            success: false,

            message: "Error retrieving products",

            error: error.message

        })

    }

}





// Get product by ID
export const getProductById = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id)

            .populate('categories')

            .populate('collections')

            .populate('createdBy', 'name email')





        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            })

        }





        res.json({

            success: true,

            message: "Product retrieved successfully",

            data: product

        })

    } catch (error) {

        console.error("Get product by ID error:", error)

        res.status(500).json({

            success: false,

            message: "Error retrieving product",

            error: error.message

        })

    }

}





// Update product
export const updateProduct = async (req, res) => {

    try {

        const { error, value } = validateProduct(req.body)

        if (error) {

            return res.status(400).json({

                success: false,

                message: "Validation error",

                error: error.details[0].message

            })

        }





        const product = await Product.findByIdAndUpdate(

            req.params.id,

            value,

            { new: true, runValidators: true }

        ).populate(['categories', 'collections', 'createdBy'])





        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            })

        }





        res.json({

            success: true,

            message: "Product updated successfully",

            data: product

        })

    } catch (error) {

        console.error("Update product error:", error)

        res.status(500).json({

            success: false,

            message: "Error updating product",

            error: error.message

        })

    }

}





// Delete product
export const deleteProduct = async (req, res) => {

    try {

        const product = await Product.findByIdAndDelete(req.params.id)





        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            })

        }





        res.json({

            success: true,

            message: "Product deleted successfully"

        })

    } catch (error) {

        console.error("Delete product error:", error)

        res.status(500).json({

            success: false,

            message: "Error deleting product",

            error: error.message

        })

    }

}





// Generate SKUs for a product
export const generateSKUs = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id)





        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            })

        }





        await product.generateSKUs()





        res.json({

            success: true,

            message: "SKUs generated successfully",

            data: product.skus

        })

    } catch (error) {

        console.error("Generate SKUs error:", error)

        res.status(500).json({

            success: false,

            message: "Error generating SKUs",

            error: error.message

        })

    }

}





// Update SKU
export const updateSKU = async (req, res) => {

    try {

        const { productId, skuId } = req.params

        const updateData = req.body

        const product = await Product.findById(productId)





        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            })

        }





        const sku = product.skus.id(skuId)

        if (!sku) {

            return res.status(404).json({

                success: false,

                message: "SKU not found"

            })

        }





        Object.assign(sku, updateData)

        await product.save()





        res.json({

            success: true,

            message: "SKU updated successfully",

            data: sku

        })

    } catch (error) {

        console.error("Update SKU error:", error)

        res.status(500).json({

            success: false,

            message: "Error updating SKU",

            error: error.message

        })

    }

}





// Delete SKU
export const deleteSKU = async (req, res) => {

    try {

        const { productId, skuId } = req.params

        const product = await Product.findById(productId)





        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            })

        }





        const sku = product.skus.id(skuId)

        if (!sku) {

            return res.status(404).json({

                success: false,

                message: "SKU not found"

            })

        }





        sku.remove()

        await product.save()





        res.json({

            success: true,

            message: "SKU deleted successfully"

        })

    } catch (error) {

        console.error("Delete SKU error:", error)

        res.status(500).json({

            success: false,

            message: "Error deleting SKU",

            error: error.message

        })

    }

} 