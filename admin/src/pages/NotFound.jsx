import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi'

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
                    <div className="text-center">
                        {/* 404 Icon */}
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
                            <FiSearch className="h-12 w-12 text-red-600" />
                        </div>
                        
                        {/* Error Code */}
                        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                        
                        {/* Error Message */}
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Page Not Found
                        </h2>
                        
                        <p className="text-gray-600 mb-8">
                            Sorry, we couldn't find the page you're looking for. 
                            It might have been moved, deleted, or you entered the wrong URL.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/"
                                className="btn-primary inline-flex items-center justify-center"
                            >
                                <FiHome className="mr-2" />
                                Go to Dashboard
                            </Link>
                            
                            <button
                                onClick={() => window.history.back()}
                                className="btn-outline inline-flex items-center justify-center"
                            >
                                <FiArrowLeft className="mr-2" />
                                Go Back
                            </button>
                        </div>
                        
                        {/* Help Text */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Need help? Contact support or check our documentation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFound 