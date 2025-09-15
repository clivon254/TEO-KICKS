import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Get all products
export const useGetProducts = (params = {}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const response = await productAPI.getAllProducts(params)
            return response.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
    })
}

// Get product by ID
export const useGetProductById = (productId) => {
    return useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const response = await productAPI.getProductById(productId)
            return response.data
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    })
}

// Create product
export const useCreateProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (formData) => {
            console.log('useCreateProduct - Received FormData')
            console.log('useCreateProduct - FormData entries:')
            for (let [key, value] of formData.entries()) {
                if (key === 'images') {
                    console.log(`  ${key}: File object - ${value.name} (${value.size} bytes)`)
                } else {
                    console.log(`  ${key}: ${value}`)
                }
            }

            const response = await productAPI.createProduct(formData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success(data.message || 'Product created successfully')
        },
        onError: (error) => {
            console.error('Create product error:', error)
            toast.error(error.response?.data?.message || 'Failed to create product')
        }
    })
}

// Update product
export const useUpdateProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, productData }) => {
            // If productData is already FormData, use it directly
            if (productData instanceof FormData) {
                const response = await productAPI.updateProduct(productId, productData)
                return response.data
            }

            // Otherwise, create FormData from object (fallback)
            const formData = new FormData()

            // Add basic fields
            Object.keys(productData).forEach(key => {
                if (key === 'images') return // Handle images separately
                if (key === 'categories' || key === 'collections' || key === 'tags' || key === 'variants' || key === 'features') {
                    formData.append(key, JSON.stringify(productData[key]))
                } else {
                    formData.append(key, productData[key])
                }
            })

            // Add images
            if (productData.images && productData.images.length > 0) {
                productData.images.forEach((image) => {
                    formData.append('images', image)
                })
            }

            const response = await productAPI.updateProduct(productId, formData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product'] })
            toast.success(data.message || 'Product updated successfully')
        },
        onError: (error) => {
            console.error('Update product error:', error)
            toast.error(error.response?.data?.message || 'Failed to update product')
        }
    })
}

// Delete product
export const useDeleteProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (productId) => {
            const response = await productAPI.deleteProduct(productId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success(data.message || 'Product deleted successfully')
        },
        onError: (error) => {
            console.error('Delete product error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete product')
        }
    })
}

// Upload product images
export const useUploadProductImages = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, images }) => {
            const formData = new FormData()
            images.forEach((image) => {
                formData.append('images', image)
            })

            const response = await productAPI.uploadImages(productId, formData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product'] })
            toast.success(data.message || 'Images uploaded successfully')
        },
        onError: (error) => {
            console.error('Upload images error:', error)
            toast.error(error.response?.data?.message || 'Failed to upload images')
        }
    })
}

// Delete product image
export const useDeleteProductImage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, imageId }) => {
            const response = await productAPI.deleteImage(productId, imageId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product'] })
            toast.success(data.message || 'Image deleted successfully')
        },
        onError: (error) => {
            console.error('Delete image error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete image')
        }
    })
}

// Set primary image
export const useSetPrimaryImage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, imageId }) => {
            const response = await productAPI.setPrimaryImage(productId, imageId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product'] })
            toast.success(data.message || 'Primary image updated successfully')
        },
        onError: (error) => {
            console.error('Set primary image error:', error)
            toast.error(error.response?.data?.message || 'Failed to update primary image')
        }
    })
}

// Update SKU
export const useUpdateSKU = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, skuId, skuData }) => {
            const response = await productAPI.updateSKU(productId, skuId, skuData)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product'] })
        },
        onError: (error) => {
            console.error('Update SKU error:', error)
            toast.error(error.response?.data?.message || 'Failed to update SKU')
        }
    })
}

// Delete SKU
export const useDeleteSKU = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, skuId }) => {
            const response = await productAPI.deleteSKU(productId, skuId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product'] })
            toast.success(data.message || 'SKU deleted successfully')
        },
        onError: (error) => {
            console.error('Delete SKU error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete SKU')
        }
    })
}

// Generate SKUs
export const useGenerateSKUs = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (productId) => {
            const response = await productAPI.generateSKUs(productId)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product'] })
            toast.success(data.message || 'SKUs generated successfully')
        },
        onError: (error) => {
            console.error('Generate SKUs error:', error)
            toast.error(error.response?.data?.message || 'Failed to generate SKUs')
        }
    })
}