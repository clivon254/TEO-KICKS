import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetProductById, useUpdateProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { FiEdit, FiX, FiImage, FiSave, FiArrowLeft, FiPackage, FiGrid, FiTag, FiLayers, FiDollarSign, FiBox } from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'

const EditProduct = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const updateProduct = useUpdateProduct()

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        brand: '',
        categories: [],
        collections: [],
        tags: [],
        basePrice: '',
        comparePrice: '',
        variants: [],
        images: [],
        status: 'draft',
        metaTitle: '',
        metaDescription: '',
        trackInventory: true,
        weight: '',
        features: []
    })

    const [newFeature, setNewFeature] = useState('')
    const [imagePreview, setImagePreview] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Load data
    const { data: productData, isLoading: productLoading } = useGetProductById(id)
    const { data: brandsData } = useGetBrands({ limit: 100 })
    const { data: categoriesData } = useGetCategories({ limit: 100 })
    const { data: collectionsData } = useGetCollections({ limit: 100 })
    const { data: tagsData } = useGetTags({ limit: 100 })
    const { data: variantsData } = useGetVariants({ limit: 100 })

    const product = productData?.data?.product
    const brands = brandsData?.data?.data?.brands || []
    const categories = categoriesData?.data?.data?.categories || []
    const collections = collectionsData?.data?.data?.collections || []
    const tags = tagsData?.data?.data?.tags || []
    const variants = Array.isArray(variantsData?.data) ? variantsData?.data : []

    // Load product data into form
    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || '',
                description: product.description || '',
                shortDescription: product.shortDescription || '',
                brand: product.brand?._id || product.brand || '',
                categories: product.categories?.map(cat => cat._id || cat) || [],
                collections: product.collections?.map(col => col._id || col) || [],
                tags: product.tags?.map(tag => tag._id || tag) || [],
                basePrice: product.basePrice?.toString() || '',
                comparePrice: product.comparePrice?.toString() || '',
                variants: product.variants?.map(variant => variant._id || variant) || [],
                images: [], // Will be handled separately for uploads
                status: product.status || 'draft',
                metaTitle: product.metaTitle || '',
                metaDescription: product.metaDescription || '',
                trackInventory: product.trackInventory !== undefined ? product.trackInventory : true,
                weight: product.weight?.toString() || '',
                features: product.features || []
            })

            // Set up image previews
            if (product.images && product.images.length > 0) {
                const previews = product.images.map(img => ({
                    url: img.url,
                    alt: img.alt || product.title,
                    isPrimary: img.isPrimary || false,
                    existing: true,
                    public_id: img.public_id
                }))
                setImagePreview(previews)
            }

            setIsLoading(false)
        }
    }, [product])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleDescriptionChange = (html) => {
        setFormData(prev => ({ ...prev, description: html }))
    }

    const handleArrayChange = (field, value, checked) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }))
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            alt: file.name,
            existing: false
        }))

        setImagePreview(prev => [...prev, ...newImages])
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }))
    }

    const removeImage = (index) => {
        setImagePreview(prev => prev.filter((_, i) => i !== index))
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const setPrimaryImage = (index) => {
        setImagePreview(prev => prev.map((img, i) => ({
            ...img,
            isPrimary: i === index
        })))
    }

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }))
            setNewFeature('')
        }
    }

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const submitData = {
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0,
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                images: formData.images
            }

            await updateProduct.mutateAsync({ productId: id, productData: submitData })
            navigate('/products')
        } catch (error) {
            console.error('Submit error:', error)
        }
    }

    const handleCancel = () => {
        navigate('/products')
    }

    if (isLoading || productLoading) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold text-gray-900">Product Not Found</h2>
                    <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="btn-primary mt-4"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/products')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <FiArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </button>
                <div className="mb-4">
                    <h1 className="title2">Edit Product</h1>
                    <p className="text-gray-600">Update product information and variants</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-light rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="title3 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="input"
                                placeholder="Enter product title"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Short Description
                            </label>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className="input"
                                placeholder="Brief description (max 200 characters)"
                                maxLength={200}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Description
                            </label>
                            <RichTextEditor
                                content={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="Detailed product description"
                            />
                        </div>
                    </div>
                </div>

                {/* Organization */}
                <div className="bg-light rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="title3 mb-4">Organization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiPackage className="inline mr-2 h-4 w-4" />
                                Brand
                            </label>
                            <select
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="input"
                            >
                                <option value="">Select Brand</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiGrid className="inline mr-2 h-4 w-4" />
                                Categories
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {categories.map(category => (
                                    <label key={category._id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.categories.includes(category._id)}
                                            onChange={(e) => handleArrayChange('categories', category._id, e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiLayers className="inline mr-2 h-4 w-4" />
                                Collections
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {collections.map(collection => (
                                    <label key={collection._id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.collections.includes(collection._id)}
                                            onChange={(e) => handleArrayChange('collections', collection._id, e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{collection.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiTag className="inline mr-2 h-4 w-4" />
                                Tags
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {tags.map(tag => (
                                    <label key={tag._id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.tags.includes(tag._id)}
                                            onChange={(e) => handleArrayChange('tags', tag._id, e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-light rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="title3 mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiDollarSign className="inline mr-2 h-4 w-4" />
                                Base Price *
                            </label>
                            <input
                                type="number"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Compare at Price
                            </label>
                            <input
                                type="number"
                                name="comparePrice"
                                value={formData.comparePrice}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Variants */}
                <div className="bg-light rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="title3 mb-4">Variants</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Select variants to create different product options (e.g., Size, Color)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {variants.map(variant => (
                            <label key={variant._id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.variants.includes(variant._id)}
                                    onChange={(e) => handleArrayChange('variants', variant._id, e.target.checked)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="ml-2 text-sm text-gray-700">{variant.name}</span>
                            </label>
                        ))}
                    </div>
                    {formData.variants.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <FiBox className="inline mr-2 h-4 w-4" />
                                {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''} selected.
                                SKUs will be auto-generated based on variant combinations.
                            </p>
                        </div>
                    )}
                </div>

                {/* Images */}
                <div className="bg-light rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="title3 mb-4">Product Images</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FiImage className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {imagePreview.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreview.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image.existing ? image.url : image.preview}
                                            alt={image.alt}
                                            className={`w-full h-24 object-cover rounded-lg border-2 ${
                                                image.isPrimary ? 'border-primary' : 'border-gray-200'
                                            }`}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setPrimaryImage(index)}
                                                className="text-white text-xs px-2 py-1 bg-primary rounded mr-1"
                                            >
                                                Primary
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="text-white p-1 bg-red-600 rounded"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Features */}
                <div className="bg-light rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="title3 mb-4">Features</h2>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Add a feature"
                                className="input flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="btn-secondary px-4 py-2"
                            >
                                <FiPlus className="h-4 w-4" />
                            </button>
                        </div>
                        {formData.features.length > 0 && (
                            <div className="space-y-2">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-sm text-gray-700">{feature}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <FiX className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings */}
                <div className="bg-light rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="title3 mb-4">Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="input"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <ToggleSwitch
                                isActive={formData.trackInventory}
                                onToggle={(checked) => setFormData(prev => ({ ...prev, trackInventory: checked }))}
                                label="Track Inventory"
                                description="Enable inventory tracking for this product"
                                className="mb-4"
                            />
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-light rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="title3 mb-4">SEO Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Meta Title
                            </label>
                            <input
                                type="text"
                                name="metaTitle"
                                value={formData.metaTitle}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="SEO title"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Meta Description
                            </label>
                            <textarea
                                name="metaDescription"
                                value={formData.metaDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className="input"
                                placeholder="SEO description"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-outline"
                        disabled={updateProduct.isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={updateProduct.isPending}
                    >
                        {updateProduct.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <FiSave className="mr-2 h-4 w-4" />
                                Update Product
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditProduct