import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProductById } from '../hooks/useProducts'
import { useAddToCart } from '../hooks/useCart'
import { FiArrowLeft, FiImage, FiPlus, FiMinus, FiShoppingCart, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'


const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const addToCart = useAddToCart()

  const { data: productData, isLoading } = useGetProductById(id)

  const product = useMemo(() => productData?.data, [productData])

  const [selectedVariants, setSelectedVariants] = useState({})
  const [selectedSKU, setSelectedSKU] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const populatedVariants = useMemo(() => {
    if (!product?.variants) return []
    // If variants are populated with options, return as-is
    if (Array.isArray(product.variants) && product.variants[0]?.options) return product.variants
    // Otherwise, no lookup available on client – show raw list empty
    return []
  }, [product?.variants])

  const availableSKUs = useMemo(() => {
    if (!product?.skus) return []
    return product.skus.filter((sku) => Number(sku.stock || 0) > 0)
  }, [product?.skus])

  const totalAvailableStock = useMemo(() => {
    return availableSKUs.reduce((sum, sku) => sum + Number(sku.stock || 0), 0)
  }, [availableSKUs])

  const onVariantSelect = useCallback((variantId, optionId) => {
    setSelectedVariants((prev) => ({ ...prev, [variantId]: optionId }))
  }, [])

  useEffect(() => {
    if (!product || populatedVariants.length === 0) return
    const defaults = {}
    populatedVariants.forEach((variant) => {
      const firstAvailable = variant.options?.find((opt) => {
        return product.skus?.some((sku) => sku.attributes?.some((a) => a.variantId === variant._id && a.optionId === opt._id) && Number(sku.stock || 0) > 0)
      }) || variant.options?.[0]
      if (firstAvailable) defaults[variant._id] = firstAvailable._id
    })
    setSelectedVariants(defaults)
  }, [product, populatedVariants])

  useEffect(() => {
    if (!product?.skus || Object.keys(selectedVariants).length === 0) {
      setSelectedSKU(null)
      return
    }
    const match = product.skus.find((sku) => sku.attributes?.every((a) => selectedVariants[a.variantId] === a.optionId))
    setSelectedSKU(match || null)
  }, [selectedVariants, product])

  const areAllVariantsSelected = useCallback(() => {
    if (populatedVariants.length === 0) return true
    return populatedVariants.every((v) => selectedVariants[v._id])
  }, [populatedVariants, selectedVariants])

  const hasSelectedStock = useCallback(() => {
    if (populatedVariants.length === 0) return totalAvailableStock > 0
    return selectedSKU && Number(selectedSKU.stock || 0) > 0
  }, [populatedVariants.length, selectedSKU, totalAvailableStock])

  const handleQuantityChange = useCallback((e) => {
    const v = parseInt(e.target.value)
    if (v > 0) setQuantity(v)
  }, [])

  const increase = useCallback(() => {
    const max = populatedVariants.length > 0 ? Number(selectedSKU?.stock || 0) : totalAvailableStock
    if (quantity < max) setQuantity((p) => p + 1)
  }, [quantity, selectedSKU?.stock, totalAvailableStock, populatedVariants.length])

  const decrease = useCallback(() => {
    if (quantity > 1) setQuantity((p) => p - 1)
  }, [quantity])

  const handleAddToCart = async () => {
    if (populatedVariants.length > 0 && !areAllVariantsSelected()) {
      toast.error('Please select all options')
      return
    }
    if (!hasSelectedStock()) {
      toast.error('Out of stock')
      return
    }
    const max = populatedVariants.length > 0 ? Number(selectedSKU?.stock || 0) : totalAvailableStock
    if (quantity > max) {
      toast.error(`Only ${max} available`)
      return
    }
    const skuId = populatedVariants.length > 0 ? selectedSKU?._id : availableSKUs[0]?._id
    if (!skuId) {
      toast.error('No SKU available')
      return
    }
    const variantOptions = {}
    if (populatedVariants.length > 0) {
      populatedVariants.forEach((v) => {
        const opt = selectedVariants[v._id]
        if (opt) variantOptions[v._id] = opt
      })
    }
    try {
      await addToCart.mutateAsync({ productId: product._id, skuId, quantity, variantOptions })
      toast.success('Added to cart')
      navigate('/cart')
    } catch {}
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold">Product not found</h2>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">Go Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-3">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          <h1 className="title2">{product.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images?.length ? (
                <img src={product.images[currentImageIndex]?.url || product.images[0]?.url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiImage className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {product.images.slice(0, 6).map((img, idx) => (
                  <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`aspect-square rounded-lg border-2 overflow-hidden ${currentImageIndex === idx ? 'border-primary bg-light' : 'border-gray-200 hover:border-gray-300'}`}>
                    <img src={img.url} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
              <div className="text-sm text-gray-600">SKU: {selectedSKU?.skuCode || product.skuCode || 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {selectedSKU?.price?.toLocaleString() || product.basePrice?.toLocaleString() || '0'}
              </div>
              {product.comparePrice && (
                <div className="text-lg text-gray-500 line-through">{product.comparePrice.toLocaleString()}</div>
              )}
            </div>

            {populatedVariants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Options</h3>
                {populatedVariants.map((variant) => (
                  <div key={variant._id} className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Choose {variant.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {variant.options?.map((opt) => {
                        const isSelected = selectedVariants[variant._id] === opt._id
                        const skuForOption = product.skus?.find((sku) => sku.attributes?.some((a) => a.variantId === variant._id && a.optionId === opt._id))
                        const stock = Number(skuForOption?.stock || 0)
                        const available = stock > 0
                        return (
                          <button key={opt._id} type="button" onClick={() => onVariantSelect(variant._id, opt._id)} disabled={!available} className={`relative px-4 py-2 text-sm font-medium rounded-lg border-2 ${isSelected ? 'border-primary bg-light text-primary' : available ? 'border-gray-300 bg-white text-gray-900 hover:border-primary' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}`} title={`${stock} in stock`}>
                            {opt.value}
                            {isSelected && <FiCheck className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white rounded-full p-0.5" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Stock Status:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${hasSelectedStock() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {hasSelectedStock() ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available:</span>
                <span className={`text-sm font-medium ${hasSelectedStock() ? 'text-green-600' : 'text-red-600'}`}>
                  {populatedVariants.length > 0 ? (selectedSKU ? `${selectedSKU.stock} units` : 'Select options') : `${totalAvailableStock} units`}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={decrease} disabled={quantity <= 1} className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50">
                    <FiMinus className="h-4 w-4" />
                  </button>
                  <input type="number" min="1" max={populatedVariants.length > 0 ? Number(selectedSKU?.stock || 0) : totalAvailableStock || 999} value={quantity} onChange={handleQuantityChange} className="w-16 px-2 py-2 text-center border-0 focus:ring-0 focus:outline-none" />
                  <button onClick={increase} className="px-3 py-2 text-gray-600 hover:text-gray-800">
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button onClick={handleAddToCart} disabled={(populatedVariants.length > 0 && !areAllVariantsSelected()) || !hasSelectedStock() || addToCart.isPending} className="w-full btn-primary inline-flex items-center justify-center">
                {addToCart.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {product.features?.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                <ul className="space-y-1 list-disc pl-5">
                  {product.features.map((f, idx) => (
                    <li key={idx} className="text-gray-700">{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {product.description && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}
      </div>
    </div>
  )
}


export default ProductDetails


