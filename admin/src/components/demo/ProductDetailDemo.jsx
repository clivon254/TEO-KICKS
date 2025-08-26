import React, { useState } from 'react'
import VariantSelector from '../common/VariantSelector'
import { FiShoppingCart } from 'react-icons/fi'


const ProductDetailDemo = () => {
    const [selectedOptions, setSelectedOptions] = useState({})
    const [quantity, setQuantity] = useState(1)

    // Real product data from the Nike Air Max 270
    const realProductVariants = [
        {
            _id: '68a9a75c0614f4956b256d4b',
            name: 'Size',
            options: [
                {
                    _id: '68a9a75c0614f4956b256d4c',
                    value: 'X',
                    isActive: true,
                    sortOrder: 0
                },
                {
                    _id: '68a9a75c0614f4956b256d4d',
                    value: 'XL',
                    isActive: true,
                    sortOrder: 0
                },
                {
                    _id: '68a9a75c0614f4956b256d4e',
                    value: 'M',
                    isActive: true,
                    sortOrder: 0
                }
            ]
        }
    ]

    const handleOptionSelect = (variantId, optionId) => {
        setSelectedOptions(prev => ({
            ...prev,
            [variantId]: optionId
        }))
    }

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 1
        setQuantity(Math.max(1, value))
    }

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1)
    }

    const decreaseQuantity = () => {
        setQuantity(prev => Math.max(1, prev - 1))
    }

    const handleAddToCart = () => {
        // Check if all variants are selected
        const allSelected = realProductVariants.every(variant => selectedOptions[variant._id])
        
        if (!allSelected) {
            alert('Please select a size before adding to cart')
            return
        }
        
        // Get selected size
        const selectedSize = realProductVariants[0].options.find(opt => opt._id === selectedOptions[realProductVariants[0]._id])
        
        alert(`Added to cart: ${quantity} Nike Air Max 270 (Size: ${selectedSize.value})`)
    }

    const isAllSelected = realProductVariants.every(variant => selectedOptions[variant._id])

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary text-white p-6">
                        <h1 className="text-2xl font-bold">Nike Air Max 270 - Product Detail</h1>
                        <p className="text-primary-100 mt-1">Real product with actual variants</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Product Image */}
                            <div className="space-y-4">
                                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">👟</div>
                                        <p className="text-gray-500">Nike Air Max 270 Image</p>
                                    </div>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Nike Air Max 270</h2>
                                    <p className="text-gray-600 mb-4">
                                        Experience ultimate comfort with the Nike Air Max 270. Features a large Air unit for maximum cushioning and a breathable mesh upper.
                                    </p>
                                    <div className="text-3xl font-bold text-green-600 mb-2">$20.00</div>
                                    <div className="text-sm text-gray-500 line-through">$20.00</div>
                                </div>

                                {/* Variant Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Available Variants</h3>
                                    <VariantSelector
                                        variants={realProductVariants}
                                        selectedOptions={selectedOptions}
                                        onOptionSelect={handleOptionSelect}
                                    />
                                </div>

                                {/* Stock Information */}
                                {selectedOptions[realProductVariants[0]._id] && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Stock Information</h4>
                                        <div className="space-y-1 text-sm text-blue-800">
                                            {realProductVariants[0].options.map(option => {
                                                const isSelected = selectedOptions[realProductVariants[0]._id] === option._id
                                                const stockCount = option.value === 'X' ? 4 : option.value === 'XL' ? 2 : 3
                                                return (
                                                    <div key={option._id} className={`flex justify-between ${isSelected ? 'font-semibold' : ''}`}>
                                                        <span>Size {option.value}:</span>
                                                        <span>{stockCount} in stock</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Selector */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Quantity
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={decreaseQuantity}
                                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            min="1"
                                            className="w-16 h-10 text-center border border-gray-300 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={increaseQuantity}
                                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isAllSelected}
                                    className={`
                                        w-full py-3 px-6 rounded-lg font-medium text-white flex items-center justify-center space-x-2
                                        ${isAllSelected 
                                            ? 'bg-primary hover:bg-primary/90 transition-colors' 
                                            : 'bg-gray-300 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <FiShoppingCart className="h-5 w-5" />
                                    <span>Add to Cart</span>
                                </button>

                                {!isAllSelected && (
                                    <p className="text-sm text-gray-500 text-center">
                                        Please select a size to add to cart
                                    </p>
                                )}

                                {/* Product Features */}
                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Product Features</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Large Air unit for maximum cushioning</li>
                                        <li>• Breathable mesh upper</li>
                                        <li>• Rubber outsole for durability</li>
                                        <li>• Lightweight design</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailDemo 