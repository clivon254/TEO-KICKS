import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import logo from '../../assets/logo.png'
import { forgotPasswordSchema } from '../../utils/validation'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})

    const { forgotPassword } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setValidationErrors({})

        try {
            // Validate email
            await forgotPasswordSchema.validate({ email }, { abortEarly: false })

            const result = await forgotPassword(email)

            if (result.success) {
                setIsSubmitted(true)
            }
        } catch (validationError) {
            if (validationError.name === 'ValidationError') {
                const errors = {}
                validationError.inner.forEach((error) => {
                    errors[error.path] = error.message
                })
                setValidationErrors(errors)
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex flex-col md:flex-row justify-center md:justify-start md:items-start py-5 lg:py-10 sm:px-5 lg:px-8 gap-x-10 gap-y-5">

                {/* Left Side */}
                <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center justify-center gap-y-3">
                    
                    {/* Logo */}
                    <div className="w-32 h-24 md:w-48 md:h-32 lg:w-64 lg:h-48">
                        <img src={logo} alt="logo" className="w-full h-full" />
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <div className="mt-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <FiMail className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="title2">
                                Check your email
                            </h2>
                            <p className="text-sm text-gray-600">
                                We've sent password reset instructions to
                            </p>
                            <p className="text-sm font-medium text-primary">
                                {email}
                            </p>
                            <p className="mt-4 text-sm text-gray-600">
                                If you don't see the email, check your spam folder.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="">
                        <div className="text-center space-y-4">
                            <Link
                                to="/login"
                                className="btn-primary inline-flex items-center"
                            >
                                <FiArrowLeft className="mr-2" />
                                Back to login
                            </Link>
                            <p className="text-sm text-gray-600">
                                Didn't receive the email?{' '}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="font-medium text-primary hover:text-secondary transition-colors"
                                >
                                    Try again
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row justify-center md:justify-start md:items-start py-5 lg:py-10 sm:px-5 lg:px-8 gap-x-10 gap-y-5">

            {/* Left Side */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center justify-center gap-y-3">
                
                {/* Logo */}
                <div className="w-32 h-24 md:w-48 md:h-32 lg:w-64 lg:h-48">
                    <img src={logo} alt="logo" className="w-full h-full" />
                </div>

                {/* Title */}
                <div className="text-center">
                    <h2 className="title2">
                        Forgot your password?
                    </h2>
                    <p className="text-sm text-gray-600">
                        No worries! Enter your email and we'll send you reset instructions.
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-primary" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={`input pl-10 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {validationErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending...
                                    </div>
                                ) : (
                                    'Send reset instructions'
                                )}
                            </button>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-600 hover:text-primary flex items-center justify-center mx-auto transition-colors"
                            >
                                <FiArrowLeft className="mr-2" />
                                Back to login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword 