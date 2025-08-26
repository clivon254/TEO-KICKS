import { FiShoppingCart, FiArrowRight, FiX } from 'react-icons/fi'


const CartSuccessModal = ({ isOpen, onClose, onContinueShopping, onGoToCart, itemCount = 0 }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md mx-4 mb-4 sm:mb-0 transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FiShoppingCart className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Added to Cart!</h3>
                            <p className="text-sm text-gray-600">
                                {itemCount} item{itemCount !== 1 ? 's' : ''} added successfully
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 mb-6">
                        Your item has been added to your cart. Would you like to continue shopping or view your cart?
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={onGoToCart}
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                        >
                            <FiShoppingCart className="w-4 h-4" />
                            <span>View Cart</span>
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                        
                        <button
                            onClick={onContinueShopping}
                            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default CartSuccessModal 