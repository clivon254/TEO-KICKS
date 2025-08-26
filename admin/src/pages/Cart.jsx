import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../hooks/useCart'
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'


const Cart = () => {
    const navigate = useNavigate()
    const { data: cartData, isLoading, error } = useGetCart()
    const updateCartItem = useUpdateCartItem()
    const removeFromCart = useRemoveFromCart()
    const clearCart = useClearCart()

    const cart = cartData?.data?.data
    const cartItems = cart?.items || []

    const getProductImage = (product) => {
        if (product?.images && product.images.length > 0) {
            return product.images[0]
        }
        if (product?.primaryImage) {
            return product.primaryImage
        }
        return '/placeholder-product.jpg'
    }

    const formatVariantOptions = (variantOptions) => {
        if (!variantOptions || Object.keys(variantOptions).length === 0) {
            return 'No variants'
        }
        
        return Object.entries(variantOptions)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
    }

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    const handleQuantityChange = async (skuId, newQuantity) => {
        if (newQuantity < 1) {
            toast.error('Quantity must be at least 1')
            return
        }

        try {
            await updateCartItem.mutateAsync({ skuId, quantity: newQuantity })
        } catch (error) {
            console.error('Error updating quantity:', error)
        }
    }

    const handleRemoveItem = async (skuId) => {
        try {
            await removeFromCart.mutateAsync(skuId)
        } catch (error) {
            console.error('Error removing item:', error)
        }
    }

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                await clearCart.mutateAsync()
            } catch (error) {
                console.error('Error clearing cart:', error)
            }
        }
    }

    const handleCheckout = () => {
        // TODO: Implement checkout functionality
        toast.info('Checkout functionality coming soon!')
    }



    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-gray-200 h-32 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-red-600 mb-4">Error loading cart</div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-8">
                        <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
                        <button 
                            onClick={() => navigate('/products')}
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            <span>Continue Shopping</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => navigate('/products')}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    
                    {cartItems.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="text-red-600 hover:text-red-700 transition-colors flex items-center space-x-2"
                            disabled={clearCart.isPending}
                        >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Clear Cart</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Items</h2>
                                
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={getProductImage(item.productId)}
                                                    alt={item.productId?.title || 'Product'}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-product.jpg'
                                                    }}
                                                />
                                            </div>
                                            
                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {item.productId?.title || 'Product Name'}
                                                </h3>
                                                
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatVariantOptions(item.variantOptions)}
                                                </p>
                                                
                                                <p className="text-sm font-medium text-gray-900 mt-2">
                                                    ${item.price?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                            
                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleQuantityChange(item.skuId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || updateCartItem.isPending}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FiMinus className="w-3 h-3" />
                                                </button>
                                                
                                                <span className="w-12 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                
                                                <button
                                                    onClick={() => handleQuantityChange(item.skuId, item.quantity + 1)}
                                                    disabled={updateCartItem.isPending}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FiPlus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveItem(item.skuId)}
                                                disabled={removeFromCart.isPending}
                                                className="text-red-600 hover:text-red-700 transition-colors p-2"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">Free</span>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-base font-semibold">
                                        <span>Total</span>
                                        <span>${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleCheckout}
                                className="w-full btn-primary py-3"
                                disabled={cartItems.length === 0}
                            >
                                Proceed to Checkout
                            </button>
                            
                            <button
                                onClick={() => navigate('/products')}
                                className="w-full btn-outline mt-3 py-3"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Cart 