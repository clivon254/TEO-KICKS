import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProductById } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetCollections } from '../../hooks/useCollections'
import { useGetTags } from '../../hooks/useTags'
import { useGetVariants } from '../../hooks/useVariants'
import { useAddToCart } from '../../hooks/useCart'
import { FiArrowLeft, FiShoppingCart, FiPackage, FiGrid, FiTag, FiLayers, FiDollarSign, FiImage, FiCheck, FiPlus, FiMinus } from 'react-icons/fi'
import VariantSelector from '../../components/common/VariantSelector'
import toast from 'react-hot-toast'


const ProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const addToCart = useAddToCart()

    // Product data
    const { data: productData, isLoading } = useGetProductById(id)
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
    const allVariants = variantsData?.data?.data || []

    // State for cart and variant selection
    const [selectedVariants, setSelectedVariants] = useState({})
    const [selectedSKU, setSelectedSKU] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Get all available SKUs for the product
    const getAvailableSKUs = () => {
        if (!product?.skus) return []
        return product.skus.filter(sku => sku.stock > 0)
    }

    // Get total available stock across all SKUs
    const getTotalAvailableStock = () => {
        const availableSKUs = getAvailableSKUs()
        return availableSKUs.reduce((total, sku) => total + sku.stock, 0)
    }

    // Handle variant selection
    const handleVariantChange = (variantId, optionId) => {
        setSelectedVariants(prev => ({
            ...prev,
            [variantId]: optionId
        }))
    }

    // Find matching SKU based on selected variants
    useEffect(() => {
        if (product && product.skus && Object.keys(selectedVariants).length > 0) {
            const matchingSKU = product.skus.find(sku => {
                return sku.attributes.every(attr => 
                    selectedVariants[attr.variantId] === attr.optionId
                )
            })
            setSelectedSKU(matchingSKU || null)
        } else {
            setSelectedSKU(null)
        }
    }, [selectedVariants, product])

    // Check if all variants are selected
    const areAllVariantsSelected = () => {
        const populatedVariants = getPopulatedVariants()
        return populatedVariants.length > 0 && 
               populatedVariants.every(variant => selectedVariants[variant._id])
    }

    // Check if selected combination has stock
    const hasSelectedCombinationStock = () => {
        return selectedSKU && selectedSKU.stock > 0
    }



    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value)
        if (value > 0) {
            setQuantity(value)
        }
    }

    const increaseQuantity = () => {
        const populatedVariants = getPopulatedVariants()
        const maxStock = populatedVariants.length > 0 
            ? (selectedSKU?.stock || 0)
            : getTotalAvailableStock()
        
        if (quantity < maxStock) {
            setQuantity(prev => prev + 1)
        }
    }

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1)
        }
    }

    const handleAddToCart = async () => {
        const populatedVariants = getPopulatedVariants()
        
        // Check if variants exist and all are selected
        if (populatedVariants.length > 0 && !areAllVariantsSelected()) {
            toast.error('Please select all variant options')
            return
        }
        
        // Check if selected combination has stock
        if (populatedVariants.length > 0 && !hasSelectedCombinationStock()) {
            toast.error('Selected combination is out of stock')
            return
        }
        
        // Check quantity against available stock
        const maxStock = populatedVariants.length > 0 
            ? (selectedSKU?.stock || 0)
            : getTotalAvailableStock()
            
        if (maxStock < quantity) {
            toast.error(`Only ${maxStock} items available in stock`)
            return
        }

        try {
            // Use selected SKU if variants exist, otherwise use first available SKU
            const skuId = populatedVariants.length > 0 
                ? selectedSKU._id
                : getAvailableSKUs()[0]?._id
                
            if (!skuId) {
                toast.error('No available SKU found')
                return
            }
            
            await addToCart.mutateAsync({
                productId: product._id,
                skuId: skuId,
                quantity: quantity
            })
        } catch (error) {
            console.error('Add to cart error:', error)
        }
    }



    const getBrandName = (brandId) => {
        const brand = brands.find(b => b._id === brandId)
        return brand?.name || 'Unknown Brand'
    }

    const getCategoryNames = (categoryIds) => {
        return categoryIds?.map(id => {
            const category = categories.find(c => c._id === id)
            return category?.name || 'Unknown Category'
        }).join(', ') || 'No categories'
    }

    const getCollectionNames = (collectionIds) => {
        return collectionIds?.map(id => {
            const collection = collections.find(c => c._id === id)
            return collection?.name || 'Unknown Collection'
        }).join(', ') || 'No collections'
    }

    const getTagNames = (tagIds) => {
        return tagIds?.map(id => {
            const tag = tags.find(t => t._id === id)
            return tag?.name || 'Unknown Tag'
        }).join(', ') || 'No tags'
    }

    // Get populated variants with options
    const getPopulatedVariants = () => {
        // Check if product has variants directly (not as IDs)
        if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            // If variants are already populated objects, return them directly
            if (product.variants[0]?.options) {
                return product.variants
            }
        }
        
        // Fallback: if variants are stored as IDs, try to populate them
        if (product?.variants && Array.isArray(product.variants) && allVariants.length > 0) {
            return product.variants.map(variantId => {
                const variant = allVariants.find(v => v._id === variantId)
                return variant
            }).filter(Boolean)
        }
        
        return []
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="h-96 bg-gray-200 rounded"></div>
                            <div className="space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="max-w-6xl mx-auto px-3">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <FiArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </button>
                    <h1 className="title2">{product.title}</h1>
                </div>

                <div className=" overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[currentImageIndex]?.url || product.images[0]?.url}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FiImage className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Image Thumbnails - Show up to 6 images */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-6 gap-2">
                                    {product.images.slice(0, 6).map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                                currentImageIndex === index
                                                    ? 'border-primary bg-light ring-2 ring-primary/20'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`${product.title} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Information */}
                        <div className="space-y-6">
                            {/* Title and Status */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        product.status === 'active' 
                                            ? 'bg-green-100 text-green-800'
                                            : product.status === 'draft'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {product.status}
                                    </span>
                                    {product.slug && (
                                        <span className="text-sm text-gray-500">/{product.slug}</span>
                                    )}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FiDollarSign className="h-5 w-5 text-gray-600" />
                                    <span className="text-2xl font-bold text-gray-900">
                                        {selectedSKU?.price?.toLocaleString() || product.basePrice?.toLocaleString() || '0'}
                                    </span>
                                    {product.comparePrice && (
                                        <span className="text-lg text-gray-500 line-through">
                                            {product.comparePrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">
                                    SKU: {selectedSKU?.skuCode || product.skuCode || 'N/A'}
                                </div>
                            </div>

                            {/* Classifications */}
                            <div className="space-y-4">
                                {/* Brand */}
                                {product.brand && (
                                    <div className="flex items-center space-x-2">
                                        <FiPackage className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm text-gray-600">Brand:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {getBrandName(product.brand)}
                                        </span>
                                    </div>
                                )}

                                {/* Categories */}
                                {product.categories && product.categories.length > 0 && (
                                    <div className="flex items-start space-x-2">
                                        <FiGrid className="h-4 w-4 text-gray-600 mt-0.5" />
                                        <span className="text-sm text-gray-600">Categories:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {getCategoryNames(product.categories.map(c => c._id || c))}
                                        </span>
                                    </div>
                                )}

                                {/* Collections */}
                                {product.collections && product.collections.length > 0 && (
                                    <div className="flex items-start space-x-2">
                                        <FiLayers className="h-4 w-4 text-gray-600 mt-0.5" />
                                        <span className="text-sm text-gray-600">Collections:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {getCollectionNames(product.collections.map(c => c._id || c))}
                                        </span>
                                    </div>
                                )}

                                {/* Tags */}
                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex items-start space-x-2">
                                        <FiTag className="h-4 w-4 text-gray-600 mt-0.5" />
                                        <span className="text-sm text-gray-600">Tags:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {getTagNames(product.tags)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Variants */}
                            {(() => {
                                const populatedVariants = getPopulatedVariants()
                                
                                // Debug logging
                                console.log('Product variants:', product?.variants)
                                console.log('All variants:', allVariants)
                                console.log('Populated variants:', populatedVariants)
                                
                                // Prepare stock information for VariantSelector
                                const stockInfo = {}
                                populatedVariants.forEach(variant => {
                                    stockInfo[variant._id] = {}
                                    variant.options?.forEach(option => {
                                        const skuForOption = product.skus?.find(sku => 
                                            sku.attributes?.some(attr => 
                                                attr.variantId === variant._id && attr.optionId === option._id
                                            )
                                        )
                                        stockInfo[variant._id][option._id] = skuForOption?.stock || 0
                                    })
                                })
                                
                                return (
                                    <div className="space-y-4">
                                        {/* Show variants if they exist */}
                                        {populatedVariants.length > 0 ? (
                                            <>
                                                <h3 className="text-lg font-semibold text-gray-900">Available Variants</h3>
                                                <VariantSelector
                                                    variants={populatedVariants}
                                                    selectedOptions={selectedVariants}
                                                    onOptionSelect={handleVariantChange}
                                                    stockInfo={stockInfo}
                                                />
                                                
                                                {/* Variant Selection Status */}
                                                {Object.keys(selectedVariants).length > 0 && (
                                                    <div className={`p-3 rounded-lg border ${
                                                        areAllVariantsSelected() && hasSelectedCombinationStock()
                                                            ? 'bg-green-50 border-green-200'
                                                            : areAllVariantsSelected() && !hasSelectedCombinationStock()
                                                            ? 'bg-red-50 border-red-200'
                                                            : 'bg-blue-50 border-blue-200'
                                                    }`}>
                                                        <p className={`text-sm ${
                                                            areAllVariantsSelected() && hasSelectedCombinationStock()
                                                                ? 'text-green-800'
                                                                : areAllVariantsSelected() && !hasSelectedCombinationStock()
                                                                ? 'text-red-800'
                                                                : 'text-blue-800'
                                                        }`}>
                                                            {areAllVariantsSelected() && hasSelectedCombinationStock()
                                                                ? 'All options selected. Ready to add to cart!'
                                                                : areAllVariantsSelected() && !hasSelectedCombinationStock()
                                                                ? 'Selected combination is out of stock'
                                                                : `Please select ${populatedVariants.length - Object.keys(selectedVariants).length} more option(s)`
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        ) : product?.variants && product.variants.length > 0 ? (
                                            // Fallback: Show raw variant data if populated variants is empty
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900">Product Variants (Debug)</h3>
                                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <p className="text-sm text-yellow-800 mb-2">
                                                        Variants found but not displaying correctly. Raw data:
                                                    </p>
                                                    <pre className="text-xs text-yellow-900 overflow-auto">
                                                        {JSON.stringify(product.variants, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )
                            })()}

                            {/* Stock Information */}
                            {(() => {
                                const populatedVariants = getPopulatedVariants()
                                const totalStock = getTotalAvailableStock()
                                const availableSKUs = getAvailableSKUs()
                                
                                // If variants exist, show selected SKU stock, otherwise show total stock
                                if (populatedVariants.length > 0) {
                                    return (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Stock Status:</span>
                                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                                    selectedSKU && selectedSKU.stock > 10 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : selectedSKU && selectedSKU.stock > 0 
                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {selectedSKU && selectedSKU.stock > 10 
                                                        ? 'In Stock' 
                                                        : selectedSKU && selectedSKU.stock > 0 
                                                        ? 'Low Stock' 
                                                        : 'Out of Stock'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Available:</span>
                                                <span className={`text-sm font-medium ${
                                                    selectedSKU && selectedSKU.stock > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {selectedSKU ? `${selectedSKU.stock} units` : 'Select options to see stock'}
                                                </span>
                                            </div>
                                            {selectedSKU && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    SKU: {selectedSKU.skuCode}
                                                </div>
                                            )}
                                            
                                            {/* Stock Information for Each Variant Option */}
                                            {Object.keys(selectedVariants).length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Stock by Option:</h4>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        {populatedVariants.map(variant => 
                                                            variant.options?.map(option => {
                                                                // Find SKU for this option
                                                                const skuForOption = product.skus?.find(sku => 
                                                                    sku.attributes?.some(attr => 
                                                                        attr.variantId === variant._id && attr.optionId === option._id
                                                                    )
                                                                )
                                                                const stockCount = skuForOption?.stock || 0
                                                                const isSelected = selectedVariants[variant._id] === option._id
                                                                
                                                                return (
                                                                    <div key={option._id} className={`flex justify-between ${isSelected ? 'font-semibold text-gray-900' : ''}`}>
                                                                        <span>{variant.name} {option.value}:</span>
                                                                        <span className={stockCount > 0 ? 'text-green-600' : 'text-red-600'}>
                                                                            {stockCount} in stock
                                                                        </span>
                                                                    </div>
                                                                )
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                } else {
                                    // No variants - show total stock
                                    return (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Stock Status:</span>
                                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                                    totalStock > 10 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : totalStock > 0 
                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {totalStock > 10 
                                                        ? 'In Stock' 
                                                        : totalStock > 0 
                                                        ? 'Low Stock' 
                                                        : 'Out of Stock'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Available:</span>
                                                <span className={`text-sm font-medium ${
                                                    totalStock > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {totalStock} units
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }
                            })()}

                            {/* Add to Cart */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={decreaseQuantity}
                                            disabled={quantity <= 1}
                                            className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiMinus className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={(() => {
                                                const populatedVariants = getPopulatedVariants()
                                                return populatedVariants.length > 0 
                                                    ? (selectedSKU?.stock || 0)
                                                    : (getTotalAvailableStock() || 999)
                                            })()}
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            className="w-16 px-2 py-2 text-center border-0 focus:ring-0 focus:outline-none"
                                        />
                                        <button
                                            onClick={increaseQuantity}
                                            disabled={(() => {
                                                const populatedVariants = getPopulatedVariants()
                                                const maxStock = populatedVariants.length > 0 
                                                    ? (selectedSKU?.stock || 0)
                                                    : (getTotalAvailableStock() || 999)
                                                return quantity >= maxStock
                                            })()}
                                            className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiPlus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={(() => {
                                        const populatedVariants = getPopulatedVariants()
                                        const maxStock = populatedVariants.length > 0 
                                            ? (selectedSKU?.stock || 0)
                                            : getTotalAvailableStock()
                                        
                                        // Disable if: variants exist but not all selected, or no stock, or quantity exceeds stock, or pending
                                        return (populatedVariants.length > 0 && !areAllVariantsSelected()) ||
                                               maxStock < quantity ||
                                               addToCart.isPending
                                    })()}
                                    className="w-full btn-primary inline-flex items-center justify-center"
                                >
                                    {addToCart.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Adding to Cart...
                                        </>
                                    ) : (
                                        <>
                                            <FiShoppingCart className="mr-2 h-4 w-4" />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="border-t border-gray-200 p-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                            <div 
                                className="prose max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    )}

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                        <div className="border-t border-gray-200 p-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <FiCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductDetails 