import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useGetProductById, useUpdateProduct } from '../../hooks/useProducts'
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
        status: 'draft',
        metaTitle: '',
        metaDescription: '',
        trackInventory: true,
        weight: '',
        features: []
    })

    

    const [newFeature, setNewFeature] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // Image states - exactly like the user's pattern
    // existing images already saved in DB (public_id + url)
    const [existingImages, setExistingImages] = useState([])
    // only NEW images selected in this edit session
    const [newImages, setNewImages] = useState([])

    // Cleanup function to prevent memory leaks
    useEffect(() => {
        return () => {
            // Revoke all object URLs when component unmounts
            newImages.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview)
                }
            })
        }
    }, [newImages])

    // Load data with memoized processing
    const { data: productData, isLoading: productLoading } = useGetProductById(id)
    const { data: brandsData } = useGetBrands({ limit: 100 })
    const { data: categoriesData } = useGetCategories({ limit: 100 })
    const { data: collectionsData } = useGetCollections({ limit: 100 })
    const { data: tagsData } = useGetTags({ limit: 100 })
    const { data: variantsData } = useGetVariants({ limit: 100 })

    // Memoize processed data to avoid re-computations
    const product = useMemo(() => productData?.data, [productData])
    const brands = useMemo(() => brandsData?.data?.data?.brands || [], [brandsData])
    const categories = useMemo(() => categoriesData?.data?.data?.categories || [], [categoriesData])
    const collections = useMemo(() => collectionsData?.data?.data?.collections || [], [collectionsData])
    const tags = useMemo(() => tagsData?.data?.data?.tags || [], [tagsData])

    // Memoize variants processing
    const variants = useMemo(() => {
        const variantsResponse = variantsData?.data
        if (Array.isArray(variantsResponse)) {
            return variantsResponse
        } else if (variantsResponse?.data && Array.isArray(variantsResponse.data)) {
            return variantsResponse.data
        } else if (variantsResponse?.variants && Array.isArray(variantsResponse.variants)) {
            return variantsResponse.variants
        }
        return []
    }, [variantsData])

    // Load product data into form
    useEffect(() => {
        if (product) {
            console.log('=== LOADING PRODUCT DATA ===')
            console.log('Product variants:', product.variants)
            
            // Process variants to ensure they are in the correct format (string IDs)
            const processedVariants = Array.isArray(product.variants) 
                ? product.variants.map(variant => {
                    // If variant is an object with _id, extract the ID
                    if (typeof variant === 'object' && variant._id) {
                        return variant._id
                    }
                    // If it's already a string, use it as is
                    return variant
                })
                : []
            
            console.log('Processed variants for formData:', processedVariants)
            
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
                variants: processedVariants,
                status: product.status || 'draft',
                metaTitle: product.metaTitle || '',
                metaDescription: product.metaDescription || '',
                trackInventory: product.trackInventory !== undefined ? product.trackInventory : true,
                weight: product.weight?.toString() || '',
                features: product.features || []
            })

            // Set existing images
            setExistingImages(product.images || [])
            setIsLoading(false)
        }
    }, [product]) // Removed formData.variants from dependencies to prevent infinite loop

    // Memoize tabs configuration to prevent re-creation
    const tabs = useMemo(() => [
        { id: 'basic', label: 'Basic Info', icon: FiInfo },
        { id: 'organization', label: 'Organization', icon: FiGrid },
        { id: 'pricing', label: 'Pricing', icon: FiDollarSign },
        { id: 'variants', label: 'Variants', icon: FiBox },
        { id: 'images', label: 'Images', icon: FiImage },
        { id: 'settings', label: 'Settings', icon: FiPackage },
        { id: 'summary', label: 'Summary', icon: FiEye }
    ], [])

    // Memoize event handlers to prevent child component re-renders
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }, [])

    const handleDescriptionChange = useCallback((html) => {
        setFormData(prev => ({ ...prev, description: html }))
    }, [])

    // Memoize tab navigation with tabs dependency
    const goToNextTab = useCallback(() => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id)
        }
    }, [activeTab, tabs])

    const goToPreviousTab = useCallback(() => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id)
        }
    }, [activeTab, tabs])



    const handleArrayChange = useCallback((field, value, checked) => {
        console.log(`=== HANDLE ARRAY CHANGE ===`)
        console.log('Field:', field, 'Value:', value, 'Checked:', checked)
        
        setFormData(prev => {
            const currentArray = prev[field] || []
            console.log('Current array:', currentArray)
            
            // Convert value to string ID for consistent comparison
            const valueId = typeof value === 'object' && value._id ? value._id : value
            
            let newArray
            if (checked) {
                // Add if not already present
                const isPresent = currentArray.some(item => {
                    const itemId = typeof item === 'object' && item._id ? item._id : item
                    return itemId === valueId
                })
                
                if (!isPresent) {
                    newArray = [...currentArray, valueId]
                    console.log('Added variant:', valueId, 'New array:', newArray)
                } else {
                    newArray = currentArray
                    console.log('Variant already present:', valueId)
                }
            } else {
                // Remove variant
                newArray = currentArray.filter(item => {
                    const itemId = typeof item === 'object' && item._id ? item._id : item
                    return itemId !== valueId
                })
                console.log('Removed variant:', valueId, 'New array:', newArray)
            }
            
            const result = { ...prev, [field]: newArray }
            console.log('Final form data variants:', result.variants)
            return result
        })
    }, [])

    // Memoize image handling functions
    const handleNewImages = useCallback((e) => {
        // store real File objects
        const files = Array.from(e.target.files || [])
        console.log('=== NEW IMAGES DEBUG ===')
        console.log('Selected files:', files.length)
        files.forEach((file, index) => {
            console.log(`File ${index}:`, {
                name: file.name,
                size: file.size,
                type: file.type,
                isFile: file instanceof File
            })
        })
        setNewImages(files)
    }, [])

    const removeNewImage = useCallback((index) => {
        console.log('=== REMOVE NEW IMAGE DEBUG ===')
        console.log('Removing new image at index:', index)
        setNewImages(prev => prev.filter((_, i) => i !== index))
    }, [])

    const removeExistingImage = useCallback((index) => {
        console.log('=== REMOVE EXISTING IMAGE DEBUG ===')
        console.log('Removing existing image at index:', index)
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }, [])



    const addFeature = useCallback(() => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }))
            setNewFeature('')
        }
    }, [newFeature])

    const removeFeature = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }, [])

    


    const handleVariantOptionSelect = useCallback((variantId, optionId) => {
        setSelectedVariantOptions(prev => ({
            ...prev,
            [variantId]: optionId
        }))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            console.log('=== FORM SUBMISSION DEBUG ===')
            console.log('Form data:', formData)
            console.log('New images count:', newImages.length)
            console.log('Existing images count:', existingImages.length)

            const fd = new FormData()

            // append non-file fields (strings/numbers)
            Object.keys(formData).forEach(key => {
                if (key === 'categories' || key === 'collections' || key === 'tags' || key === 'variants' || key === 'features') {
                    fd.append(key, JSON.stringify(formData[key]))
                } else {
                    fd.append(key, formData[key])
                }
            })

            // IMPORTANT: append each new file individually (DO NOT append the array)
            newImages.forEach((file) => {
                fd.append("images", file, file.name) // 'images' must match Multer field name
            })

            // send which existing images to KEEP (so backend knows not to delete them)
            // send as JSON string or as repeated keys — pick one and match on the backend
            fd.append("keepImages", JSON.stringify(existingImages.map(img => img.public_id)))

            console.log('=== FINAL FORMDATA DEBUG ===')
            console.log('FormData entries:')
            for (let [key, value] of fd.entries()) {
                if (key === 'images') {
                    console.log(`  ${key}: File - ${value.name} (${value.size} bytes, type: ${value.type})`)
                } else if (key === 'keepImages') {
                    console.log(`  ${key}: ${value} (length: ${JSON.parse(value).length})`)
                } else {
                    console.log(`  ${key}: ${value}`)
                }
            }
            console.log('FormData total size:', [...fd.entries()].length, 'entries')

            await updateProduct.mutateAsync({ productId: id, productData: fd })
            navigate('/products')
        } catch (error) {
            console.error('Submit error:', error)
        }
    }

    const handleCancel = useCallback(() => {
        navigate('/products')
    }, [navigate])

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
                                        // Handle both string IDs and variant objects in formData.variants
                                        const isSelected = formData.variants.some(item => {
                                            if (typeof item === 'string') {
                                                return item === variant._id
                                            } else if (typeof item === 'object' && item._id) {
                                                return item._id === variant._id
                                            }
                                            return false
                                        })
                                        
                                        // Debug: Check variant selection state
                                        console.log(`Variant ${variant.name} (${variant._id}): isSelected = ${isSelected}`)
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
                                        {formData.variants.length > 0 ? (
                                            formData.variants.map((variantId, index) => {
                                                // Handle both string IDs and variant objects
                                                let variant = null
                                                if (typeof variantId === 'string') {
                                                    variant = variants.find(v => v._id === variantId)
                                                } else if (typeof variantId === 'object' && variantId._id) {
                                                    variant = variants.find(v => v._id === variantId._id)
                                                }
                                                
                                                return (
                                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                                                        <FiCheck className="mr-1 h-3 w-3" />
                                                        {variant?.name || 'Unknown Variant'}
                                                        {variant?.options && variant.options.length > 0 && (
                                                            <span className="ml-1 text-xs opacity-75">
                                                                ({variant.options.length} options)
                                                            </span>
                                                        )}
                                                    </span>
                                                )
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No variants selected</p>
                                        )}
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
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleNewImages}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {newImages.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        New Images ({newImages.length})
                                    </h4>
                                    {newImages.length > 1 && (
                                        <p className="text-xs text-gray-500">
                                            Click "Remove" to remove selected images.
                                        </p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {newImages.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className={`w-full h-24 object-cover rounded-lg border-2 transition-all border-gray-200`}
                                            />
                                            
                                            {/* New Image Badge */}
                                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                New
                                            </div>
                                            
                                            {/* Trash Icon - Always Visible */}
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                                title="Remove image"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {existingImages.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Existing Images ({existingImages.length})
                                    </h4>
                                    {existingImages.length > 1 && (
                                        <p className="text-xs text-gray-500">
                                            Click "Remove" to remove existing images.
                                        </p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {existingImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.url}
                                                alt={image.alt || 'Product image'}
                                                className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                                                    image.isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                                                }`}
                                            />
                                            
                                            {/* Primary Badge */}
                                            {image.isPrimary && (
                                                <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                                                    Primary
                                                </div>
                                            )}
                                            
                                            {/* Existing Image Badge */}
                                            <div className="absolute top-1 right-8 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                Existing
                                            </div>
                                            
                                            {/* Trash Icon - Always Visible */}
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                                title="Remove image"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                                
                        {/* Image Upload Tips */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <FiImage className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-medium mb-1">Image Management Tips:</p>
                                    <ul className="space-y-1">
                                        <li>• First image will be set as primary automatically</li>
                                        <li>• Existing images are marked with green "Existing" badge</li>
                                        <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                                        <li>• Maximum file size: 5MB per image</li>
                                        <li>• Images will be optimized automatically</li>
                                        <li>• Removing existing images will delete them permanently</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

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
                                    <p className="text-gray-900">{newImages.length + existingImages.length} uploaded</p>
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