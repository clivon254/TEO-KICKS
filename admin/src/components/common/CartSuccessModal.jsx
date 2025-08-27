import { FiCheck } from 'react-icons/fi'


const CartSuccessModal = ({ isOpen, onClose, onContinueShopping, onGoToCart, itemName = "Item" }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-t-lg shadow-xl w-full max-w-sm mx-4 mb-4 transform transition-all">
                {/* Top separator line */}
                <div className="h-1 bg-gray-200 rounded-t-lg"></div>
                
                {/* Content */}
                <div className="p-6 text-center">
                    {/* Green checkmark icon */}
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Success text */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Added to Cart!</h3>
                    <p className="text-gray-600 mb-6">
                        {itemName} has been added to your cart
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onContinueShopping}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Add Again
                        </button>
                        
                        <button
                            onClick={onGoToCart}
                            className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-button transition-colors"
                        >
                            Go to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default CartSuccessModal 