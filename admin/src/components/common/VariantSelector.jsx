import React from 'react'
import { FiCheck } from 'react-icons/fi'


const VariantSelector = ({ 
    variants = [], 
    selectedOptions = {}, 
    onOptionSelect, 
    disabled = false,
    className = '',
    stockInfo = {} // New prop for stock information
}) => {
    const handleOptionClick = (variantId, optionId) => {
        if (disabled) return
        onOptionSelect(variantId, optionId)
    }


    const isOptionSelected = (variantId, optionId) => {
        return selectedOptions[variantId] === optionId
    }


    const isOptionAvailable = (variantId, optionId) => {
        // Check stock availability if stockInfo is provided
        if (stockInfo[variantId] && stockInfo[variantId][optionId] !== undefined) {
            return stockInfo[variantId][optionId] > 0
        }
        // Default to available if no stock info
        return true
    }


    const getStockCount = (variantId, optionId) => {
        return stockInfo[variantId]?.[optionId] || 0
    }


    if (!variants || variants.length === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-sm text-gray-500">No variants available</p>
            </div>
        )
    }


    return (
        <div className={`space-y-6 ${className}`}>
            {variants.map(variant => (
                <div key={variant._id} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                            Choose {variant.name}
                        </label>
                        {selectedOptions[variant._id] && (
                            <span className="text-xs text-green-600 font-medium">
                                Selected
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {variant.options?.map(option => {
                            const isSelected = isOptionSelected(variant._id, option._id)
                            const isAvailable = isOptionAvailable(variant._id, option._id)
                            const stockCount = getStockCount(variant._id, option._id)
                            
                            return (
                                <button
                                    key={option._id}
                                    type="button"
                                    onClick={() => handleOptionClick(variant._id, option._id)}
                                    disabled={disabled || !isAvailable}
                                    className={`
                                        relative px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200
                                        ${isSelected 
                                            ? 'border-primary bg-primary text-white shadow-md' 
                                            : isAvailable
                                            ? 'border-gray-300 bg-white text-gray-900 hover:border-primary hover:bg-primary/5'
                                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }
                                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                    title={stockInfo[variant._id] ? `${stockCount} in stock` : undefined}
                                >
                                    {option.value}
                                    {isSelected && (
                                        <FiCheck className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white rounded-full p-0.5" />
                                    )}
                                    {stockInfo[variant._id] && (
                                        <span className={`absolute -bottom-1 -right-1 text-xs px-1 py-0.5 rounded-full ${
                                            stockCount > 10 
                                                ? 'bg-green-100 text-green-800' 
                                                : stockCount > 0 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {stockCount}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {!selectedOptions[variant._id] && (
                        <p className="text-xs text-gray-500">
                            Please select a {variant.name.toLowerCase()}
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}


export default VariantSelector 