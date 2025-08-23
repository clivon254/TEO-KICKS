import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { FiPlus, FiX, FiImage, FiSave, FiArrowLeft, FiArrowRight, FiPackage, FiGrid, FiTag, FiLayers, FiDollarSign, FiBox, FiInfo, FiEye, FiCheck } from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'


const AddProduct = () => {
    const navigate = useNavigate()
    const createProduct = useCreateProduct()

    // Tab state
    const [activeTab, setActiveTab] = useState('basic')

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

    // Load data
    const { data: brandsData } = useGetBrands({ limit: 100 })
    const { data: categoriesData } = useGetCategories({ limit: 100 })
    const { data: collectionsData } = useGetCollections({ limit: 100 })
    const { data: tagsData } = useGetTags({ limit: 100 })
    const { data: variantsData } = useGetVariants({ limit: 100 })

    // Debug logging
    console.log('AddProduct - Variants API Response:', variantsData)
    console.log('AddProduct - Data type:', typeof variantsData?.data)
    console.log('AddProduct - Is Array:', Array.isArray(variantsData?.data))
    console.log('AddProduct - Data length:', variantsData?.data?.length)

    const brands = brandsData?.data?.data?.brands || []
    const categories = categoriesData?.data?.data?.categories || []
    const collections = collectionsData?.data?.data?.collections || []
    const tags = tagsData?.data?.data?.tags || []
    // The API returns { data: { success: true, data: [...], pagination: {...} } }
    const variants = Array.isArray(variantsData?.data?.data) ? variantsData?.data?.data : []
    console.log('AddProduct - Final variants array:', variants)

    // Tabs configuration
    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: FiInfo },
        { id: 'organization', label: 'Organization', icon: FiGrid },
        { id: 'pricing', label: 'Pricing', icon: FiDollarSign },
        { id: 'variants', label: 'Variants', icon: FiBox },
        { id: 'images', label: 'Images', icon: FiImage },
        { id: 'settings', label: 'Settings', icon: FiPackage },
        { id: 'summary', label: 'Summary', icon: FiEye }
    ]

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

    // Tab navigation functions
    const goToNextTab = () => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id)
        }
    }

    const goToPreviousTab = () => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id)
        }
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
            alt: file.name
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

            await createProduct.mutateAsync(submitData)
            navigate('/products')
        } catch (error) {
            console.error('Submit error:', error)
        }
    }

    const handleCancel = () => {
        navigate('/products')
    }

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Title <span className="text-red-500">*</span>
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

                        <div>
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

                        <div>
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
                )

            case 'organization':
                return (
                    <div className="space-y-6">
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

                        <div>
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

                        <div>
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

                        <div>
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
                )

            case 'pricing':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiDollarSign className="inline mr-2 h-4 w-4" />
                                Base Price <span className="text-red-500">*</span>
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
                )

            case 'variants':
                return (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-600">
                            Select variants to create different product options (e.g., Size, Color)
                        </p>

                        {/* Debug info */}
                        {import.meta.env.DEV && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs">
                                <strong>Debug:</strong>
                                <div>Loading: {variantsData ? 'No' : 'Yes'}</div>
                                <div>Data exists: {variantsData ? 'Yes' : 'No'}</div>
                                <div>Data type: {typeof variantsData?.data}</div>
                                <div>Is Array: {Array.isArray(variantsData?.data) ? 'Yes' : 'No'}</div>
                                <div>Variants count: {variants.length}</div>
                                <div>Raw data: {JSON.stringify(variantsData, null, 2)}</div>
                                {variants.length === 0 && (
                                    <div className="text-yellow-700 mt-1">
                                        No variants found. Check if variants API is working.
                                    </div>
                                )}
                            </div>
                        )}

                        {variants.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {variants.map(variant => (
                                    <label key={variant._id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.variants.includes(variant._id)}
                                            onChange={(e) => handleArrayChange('variants', variant._id, e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <div className="ml-3 flex-1">
                                            <span className="text-sm font-medium text-gray-900">{variant.name}</span>
                                            {variant.options?.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {variant.options.slice(0, 3).map(opt => opt.value).join(', ')}
                                                    {variant.options.length > 3 && ` +${variant.options.length - 3} more`}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FiBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-sm font-medium text-gray-900 mb-2">No variants available</h3>
                                <p className="text-sm text-gray-500">
                                    Create some variants first before adding them to products.
                                </p>
                            </div>
                        )}

                        {formData.variants.length > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <FiBox className="inline mr-2 h-4 w-4" />
                                    {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''} selected.
                                    SKUs will be auto-generated based on variant combinations.
                                </p>
                            </div>
                        )}
                    </div>
                )

            case 'images':
                return (
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
                                            src={image.preview}
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
                )

            case 'settings':
                return (
                    <div className="space-y-6">
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

                        <div>
                            <ToggleSwitch
                                isActive={formData.trackInventory}
                                onToggle={(checked) => setFormData(prev => ({ ...prev, trackInventory: checked }))}
                                label="Track Inventory"
                                description="Enable inventory tracking for this product"
                                className="mb-4"
                            />
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Features</h3>
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
                                        className="btn-primary px-4 py-2"
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
                    </div>
                )

            case 'summary':
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Title:</span>
                                    <p className="text-gray-900">{formData.title || 'Not specified'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Brand:</span>
                                    <p className="text-gray-900">
                                        {brands.find(b => b._id === formData.brand)?.name || 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Categories:</span>
                                    <p className="text-gray-900">
                                        {formData.categories.length > 0
                                            ? categories.filter(c => formData.categories.includes(c._id)).map(c => c.name).join(', ')
                                            : 'None selected'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Base Price:</span>
                                    <p className="text-gray-900">${formData.basePrice || '0.00'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Variants:</span>
                                    <p className="text-gray-900">
                                        {formData.variants.length > 0
                                            ? variants.filter(v => formData.variants.includes(v._id)).map(v => v.name).join(', ')
                                            : 'No variants'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Images:</span>
                                    <p className="text-gray-900">{imagePreview.length} uploaded</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Status:</span>
                                    <p className="text-gray-900 capitalize">{formData.status}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Features:</span>
                                    <p className="text-gray-900">{formData.features.length} added</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="text-md font-semibold text-blue-900 mb-2">Ready to Create</h4>
                            <p className="text-blue-800 text-sm">
                                Review the information above and click "Create Product" when ready.
                                {formData.variants.length > 0 && (
                                    <span className="block mt-2">
                                        <FiCheck className="inline mr-1 h-4 w-4" />
                                        SKUs will be automatically generated based on selected variants.
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto px-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="title2">Add New Product</h1>
                            <p className="text-gray-600">Create a new product with variants and SKUs</p>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {renderTabContent()}
                    </div>

                    {/* Tab Navigation Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
                        {/* Left side - Previous button or Cancel */}
                        <div>
                            {activeTab === 'basic' ? (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn-outline"
                                    disabled={createProduct.isPending}
                                >
                                    Cancel
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goToPreviousTab}
                                    className="btn-outline inline-flex items-center"
                                    disabled={createProduct.isPending}
                                >
                                    <FiArrowLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </button>
                            )}
                        </div>

                        {/* Right side - Next button or Create Product */}
                        <div>
                            {activeTab === 'summary' ? (
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="btn-primary inline-flex items-center"
                                    disabled={createProduct.isPending}
                                >
                                    {createProduct.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2 h-4 w-4" />
                                            Create Product
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goToNextTab}
                                    className="btn-primary inline-flex items-center"
                                    disabled={createProduct.isPending}
                                >
                                    Next
                                    <FiArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddProduct