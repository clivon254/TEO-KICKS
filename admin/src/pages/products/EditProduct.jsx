import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetProductById, useUpdateProduct, useUpdateSKU, useGenerateSKUs } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { FiPlus, FiX, FiImage, FiSave, FiArrowLeft, FiArrowRight, FiPackage, FiGrid, FiTag, FiLayers, FiDollarSign, FiBox, FiInfo, FiEye, FiCheck } from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'
import VariantSelector from '../../components/common/VariantSelector'


const EditProduct = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const updateProduct = useUpdateProduct()
    const updateSKU = useUpdateSKU()
    const generateSKUs = useGenerateSKUs()

    // Tab state
    const [activeTab, setActiveTab] = useState('basic')

    // Variant selection state for preview
    const [selectedVariantOptions, setSelectedVariantOptions] = useState({})

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

    // SKU management state
    const [skuUpdates, setSkuUpdates] = useState({})

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

    const product = productData?.data
    const brands = brandsData?.data?.data?.brands || []
    const categories = categoriesData?.data?.data?.categories || []
    const collections = collectionsData?.data?.data?.collections || []
    const tags = tagsData?.data?.data?.tags || []
    // Fix variants data access - handle different possible structures
    const variants = (() => {
        const variantsResponse = variantsData?.data
        if (Array.isArray(variantsResponse)) {
            return variantsResponse
        } else if (variantsResponse?.data && Array.isArray(variantsResponse.data)) {
            return variantsResponse.data
        } else if (variantsResponse?.variants && Array.isArray(variantsResponse.variants)) {
            return variantsResponse.variants
        }
        return []
    })()

    // Load product data into form
    useEffect(() => {
        console.log('Product data received:', productData)
        console.log('Product extracted:', product)
        console.log('Product variants:', product?.variants)
        console.log('FormData variants:', formData.variants)
        console.log('Available variants:', variants)
        
        if (product) {
            setFormData({
                title: product.title || '',
                description: product.description || '',
                shortDescription: product.shortDescription || '',
                brand: product.brand?._id || product.brand || '',
                categories: product.categories?.map(cat => cat._id || cat) || [],
                collections: product.collections?.map(col => col._id || col) || [],
                tags: Array.isArray(product.tags) ? product.tags : [],
                basePrice: product.basePrice?.toString() || '',
                comparePrice: product.comparePrice?.toString() || '',
                variants: Array.isArray(product.variants) ? product.variants : [],
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

    // Tabs configuration
    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: FiInfo },
        { id: 'organization', label: 'Organization', icon: FiGrid },
        { id: 'pricing', label: 'Pricing', icon: FiDollarSign },
        { id: 'variants', label: 'Variants', icon: FiBox },
        { id: 'skus', label: 'SKU Management', icon: FiPackage },
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

    // SKU update handlers
    const handleSkuUpdate = (skuId, field, value) => {
        // Update local state only (no API call yet)
        setSkuUpdates(prev => ({
            ...prev,
            [skuId]: {
                ...prev[skuId],
                [field]: value
            }
        }))
    }

    const handleUpdateSKU = async (skuId) => {
        const updates = skuUpdates[skuId]
        if (!updates || Object.keys(updates).length === 0) {
            toast.error('No changes to update')
            return
        }

        try {
            await updateSKU.mutateAsync({
                productId: id,
                skuId: skuId,
                skuData: updates
            })
            
            // Clear the updates for this SKU after successful update
            setSkuUpdates(prev => {
                const newState = { ...prev }
                delete newState[skuId]
                return newState
            })

            // Navigate back to products page after successful update
            toast.success('SKU updated successfully! Redirecting to products page...')
            setTimeout(() => {
                navigate('/products')
            }, 1500) // 1.5 second delay to show success message
        } catch (error) {
            console.error('Failed to update SKU:', error)
        }
    }

    const getSkuValue = (sku, field) => {
        const update = skuUpdates[sku._id]
        return update && update[field] !== undefined ? update[field] : sku[field]
    }

    const handleRegenerateSKUs = async () => {
        try {
            await generateSKUs.mutateAsync(id)
        } catch (error) {
            console.error('Failed to regenerate SKUs:', error)
        }
    }


    const handleVariantOptionSelect = (variantId, optionId) => {
        setSelectedVariantOptions(prev => ({
            ...prev,
            [variantId]: optionId
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

            // SKU updates are now handled individually via API calls
            // No need to include them in the main form submission

            await updateProduct.mutateAsync({ productId: id, productData: submitData })
            navigate('/products')
        } catch (error) {
            console.error('Submit error:', error)
        }
    }

    const handleCancel = () => {
        navigate('/products')
    }

    // Loading state
    if (isLoading || productLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Product not found
    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-6">
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
            </div>
        )
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
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">Current Product Variants</h3>
                            <p className="text-sm text-blue-700">
                                This product currently has {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''} attached.
                                You can modify the selection below.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <FiBox className="inline mr-2 h-4 w-4" />
                                Select Variants
                            </label>
                            <p className="text-sm text-gray-600 mb-4">
                                Select variants to create different product options (e.g., Size, Color)
                            </p>

                            {variantsData?.isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-sm text-gray-500">Loading variants...</p>
                                </div>
                            ) : variants.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {variants.map(variant => {
                                        const isSelected = formData.variants.includes(variant._id)
                                        console.log(`Variant ${variant.name} (${variant._id}): isSelected = ${isSelected}`)
                                        console.log('formData.variants:', formData.variants)
                                        return (
                                            <label key={variant._id} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                                                isSelected 
                                                    ? 'border-primary bg-primary/5' 
                                                    : 'border-gray-200'
                                            }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleArrayChange('variants', variant._id, e.target.checked)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-sm font-medium ${
                                                            isSelected ? 'text-primary' : 'text-gray-900'
                                                        }`}>
                                                            {variant.name}
                                                        </span>
                                                        {isSelected && (
                                                            <FiCheck className="h-4 w-4 text-primary" />
                                                        )}
                                                    </div>
                                                    {variant.options?.length > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {variant.options.slice(0, 3).map(opt => opt.value).join(', ')}
                                                            {variant.options.length > 3 && ` +${variant.options.length - 3} more`}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        )
                                    })}
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
                        </div>

                        {/* Selected Variants Summary */}
                        {formData.variants.length > 0 && (
                            <div className="space-y-3">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <FiCheck className="inline mr-2 h-4 w-4" />
                                        {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''} selected.
                                        SKUs will be auto-generated based on variant combinations.
                                    </p>
                                </div>
                                
                                {/* Selected Variant Names */}
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                        <FiBox className="inline mr-2 h-4 w-4" />
                                        Selected Variants:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.variants.map(variantId => {
                                            const variant = variants.find(v => v._id === variantId)
                                            console.log('Looking for variant ID:', variantId)
                                            console.log('Available variants:', variants.map(v => ({ id: v._id, name: v.name })))
                                            console.log('Found variant:', variant)
                                            return (
                                                <span key={variantId} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                                                    <FiCheck className="mr-1 h-3 w-3" />
                                                    {variant?.name || `Variant ID: ${variantId}`}
                                                </span>
                                            )
                                        })}
                                    </div>
                                    {variants.length === 0 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Loading variant data... If this persists, please refresh the page.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Variant Options Preview */}
                        {formData.variants.length > 0 && (
                            <div className="space-y-4">
                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                                        <FiEye className="inline mr-2 h-4 w-4" />
                                        Variant Options Preview (Customer View)
                                    </h4>
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <VariantSelector
                                            variants={variants.filter(v => formData.variants.includes(v._id))}
                                            selectedOptions={selectedVariantOptions}
                                            onOptionSelect={handleVariantOptionSelect}
                                            className="max-w-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case 'skus':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">SKU Management</h3>
                            <button
                                type="button"
                                onClick={handleRegenerateSKUs}
                                disabled={generateSKUs.isPending}
                                className="btn-secondary text-sm"
                            >
                                {generateSKUs.isPending ? 'Regenerating...' : 'Regenerate SKUs'}
                            </button>
                        </div>

                        {product?.skus && product.skus.length > 0 ? (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        Manage individual SKU prices, stock levels, and settings. 
                                        Make your changes and click "Update SKU" to save each SKU individually.
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    {product.skus.map((sku, index) => (
                                        <div key={sku._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">SKU: {sku.skuCode}</h4>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {sku.attributes && sku.attributes.length > 0 ? (
                                                            sku.attributes.map(attr => {
                                                                // Find variant in the variants array (not product.variants which are just IDs)
                                                                const variant = variants.find(v => v._id === attr.variantId)
                                                                const option = variant?.options?.find(o => o._id === attr.optionId)
                                                                return (
                                                                    <span key={attr._id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                                        {variant?.name || 'Unknown'}: {option?.value || 'Unknown'}
                                                                    </span>
                                                                )
                                                            })
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                Default SKU
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={getSkuValue(sku, 'isActive')}
                                                            onChange={(e) => {
                                                                handleSkuUpdate(sku._id, 'isActive', e.target.checked)
                                                            }}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Price */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Price
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={getSkuValue(sku, 'price') === 0 ? '' : getSkuValue(sku, 'price') || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                                                            handleSkuUpdate(sku._id, 'price', value)
                                                        }}
                                                        min="0"
                                                        step="0.01"
                                                        className="input text-sm"
                                                    />
                                                </div>

                                                {/* Stock */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Stock
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={getSkuValue(sku, 'stock') === 0 ? '' : getSkuValue(sku, 'stock') || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                                                            handleSkuUpdate(sku._id, 'stock', value)
                                                        }}
                                                        min="0"
                                                        className="input text-sm"
                                                    />
                                                </div>

                                                {/* Low Stock Threshold */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Low Stock Alert
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={getSkuValue(sku, 'lowStockThreshold') === 5 ? '' : getSkuValue(sku, 'lowStockThreshold') || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value === '' ? 5 : parseInt(e.target.value) || 5
                                                            handleSkuUpdate(sku._id, 'lowStockThreshold', value)
                                                        }}
                                                        min="0"
                                                        className="input text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Pre-order Settings */}
                                                <div className="flex items-center space-x-4">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={getSkuValue(sku, 'allowPreOrder') || false}
                                                            onChange={(e) => {
                                                                handleSkuUpdate(sku._id, 'allowPreOrder', e.target.checked)
                                                            }}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Allow Pre-order</span>
                                                    </label>
                                                </div>

                                                {/* Pre-order Stock */}
                                                {getSkuValue(sku, 'allowPreOrder') && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Pre-order Stock
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={getSkuValue(sku, 'preOrderStock') === 0 ? '' : getSkuValue(sku, 'preOrderStock') || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                                                                handleSkuUpdate(sku._id, 'preOrderStock', value)
                                                            }}
                                                            min="0"
                                                            className="input text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stock Status */}
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Stock Status:</span>
                                                    <span className={`font-medium ${
                                                        getSkuValue(sku, 'stock') > (getSkuValue(sku, 'lowStockThreshold') || 5) 
                                                            ? 'text-green-600' 
                                                            : getSkuValue(sku, 'stock') > 0 
                                                            ? 'text-yellow-600' 
                                                            : 'text-red-600'
                                                    }`}>
                                                        {getSkuValue(sku, 'stock') > (getSkuValue(sku, 'lowStockThreshold') || 5) 
                                                            ? 'In Stock' 
                                                            : getSkuValue(sku, 'stock') > 0 
                                                            ? 'Low Stock' 
                                                            : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Update Button */}
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateSKU(sku._id)}
                                                    disabled={!skuUpdates[sku._id] || Object.keys(skuUpdates[sku._id] || {}).length === 0 || updateSKU.isPending}
                                                    className="btn-primary text-sm px-4 py-2"
                                                >
                                                    {updateSKU.isPending ? 'Updating...' : 'Update SKU'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-sm font-medium text-gray-900 mb-2">No SKUs available</h3>
                                <p className="text-sm text-gray-500">
                                    SKUs will be automatically generated when you save the product with variants.
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
                            <h1 className="title2">Edit Product</h1>
                            <p className="text-gray-600">Update product information with variants and SKUs</p>
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
                                    disabled={updateProduct.isPending}
                                >
                                    Cancel
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={goToPreviousTab}
                                    className="btn-outline inline-flex items-center"
                                    disabled={updateProduct.isPending}
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
                            ) : (
                                <button
                                    type="button"
                                    onClick={goToNextTab}
                                    className="btn-primary inline-flex items-center"
                                    disabled={updateProduct.isPending}
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

export default EditProduct