import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../hooks/useCart'
import { FiTrash2, FiShoppingCart, FiArrowLeft, FiPlus, FiMinus, FiDollarSign } from 'react-icons/fi'
import toast from 'react-hot-toast'


const Cart = () => {
    const navigate = useNavigate()
    const { data: cartData, isLoading, refetch } = useGetCart()
    const updateCartItem = useUpdateCartItem()
    const removeFromCart = useRemoveFromCart()
    const clearCart = useClearCart()

    const cart = cartData?.data || { items: [], totalAmount: 0, totalItems: 0 }
    const cartItems = cart?.items || []

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return

        // Find the item to check stock (stock validation is handled on the server)
        const item = cartItems.find(item => item._id === itemId)
        if (!item) {
            toast.error('Item not found in cart')
            return
        }

        try {
            await updateCartItem.mutateAsync({
                skuId: item.sku._id,
                quantity: newQuantity
            })
        } catch (error) {
            console.error('Update cart error:', error)
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            const item = cartItems.find(item => item._id === itemId)
            if (!item) {
                toast.error('Item not found in cart')
                return
            }
            await removeFromCart.mutateAsync(item.sku._id)
        } catch (error) {
            console.error('Remove item error:', error)
        }
    }

    const handleClearCart = async () => {
        try {
            await clearCart.mutateAsync()
        } catch (error) {
            console.error('Clear cart error:', error)
        }
    }

    const handleCheckout = () => {
        // Navigate to checkout page (to be implemented)
        toast.info('Checkout functionality coming soon!')
    }

    if (isLoading || !cartData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <FiArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </button>
                    <h1 className="title2">Shopping Cart</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <FiShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">Add some products to your cart to get started.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="btn-primary"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Cart Items ({cartItems.length})
                                        </h2>
                                        <button
                                            onClick={handleClearCart}
                                            disabled={clearCart.isPending}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            {clearCart.isPending ? 'Clearing...' : 'Clear Cart'}
                                        </button>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="p-6">
                                            <div className="flex items-start space-x-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0 w-20 h-20">
                                                    {item.productId?.images && item.productId.images.length > 0 ? (
                                                        <img
                                                            src={item.productId.images[0].url}
                                                            alt={item.productId.title}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <FiShoppingCart className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                                                                        <h3 className="text-lg font-medium text-gray-900">
                                                {item.productId?.title || 'Unknown Product'}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                SKU: {item.skuId || 'N/A'}
                                            </p>
                                            {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {Object.entries(item.variantOptions).map(([key, value], index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                        >
                                                            {value || 'Unknown'}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => handleRemoveItem(item._id)}
                                                            disabled={removeFromCart.isPending}
                                                            className="text-red-600 hover:text-red-800 ml-4"
                                                            title="Remove item"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    {/* Price and Quantity */}
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <span className="text-lg font-semibold text-gray-900">
                                                                <FiDollarSign className="inline h-4 w-4" />
                                                                {item.price?.toLocaleString() || '0'}
                                                            </span>

                                                            {/* Quantity Controls */}
                                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                                <button
                                                                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1 || updateCartItem.isPending}
                                                                    className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <FiMinus className="h-3 w-3" />
                                                                </button>
                                                                <span className="w-12 text-center text-sm font-medium px-2">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                                    disabled={updateCartItem.isPending}
                                                                    className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <FiPlus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Item Total */}
                                                        <div className="text-right">
                                                            <span className="text-lg font-semibold text-gray-900">
                                                                <FiDollarSign className="inline h-4 w-4" />
                                                                {((item.price || 0) * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>


                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                                        <span className="font-medium">
                                            <FiDollarSign className="inline h-3 w-3" />
                                            {cart.totalAmount?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total</span>
                                            <span>
                                                <FiDollarSign className="inline h-4 w-4" />
                                                {cart.totalAmount?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={cartItems.length === 0}
                                    className="w-full btn-primary mt-6"
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => navigate('/products')}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Cart 