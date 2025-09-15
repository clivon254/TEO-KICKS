import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiChevronDown } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaApple, FaInstagram } from 'react-icons/fa'
import logo from '../../assets/logo.png'
import { loginSchema } from '../../utils/validation'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        loginMethod: 'email' // 'email' or 'phone'
    })
    const [countryCode, setCountryCode] = useState('+254') // Default to Kenya
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})

    // Country codes data
    const countryCodes = [
        { code: '+254', country: 'Kenya', flag: '🇰🇪' },
        { code: '+1', country: 'USA', flag: '🇺🇸' },
        { code: '+44', country: 'UK', flag: '🇬🇧' },
        { code: '+91', country: 'India', flag: '🇮🇳' },
        { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
        { code: '+27', country: 'South Africa', flag: '🇿🇦' },
        { code: '+256', country: 'Uganda', flag: '🇺🇬' },
        { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
        { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
        { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
        { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    ]

    const { login, initiateGoogleAuth } = useAuth()
    const navigate = useNavigate()

    // Social login handlers
    const handleGoogleLogin = async () => {
        setIsLoading(true)
        setError('')

        try {
            await initiateGoogleAuth()
            // Note: The page will redirect to Google, so this code won't execute
        } catch (error) {
            console.error('Google login error:', error)
            setError('Failed to initiate Google authentication. Please check your Google OAuth configuration.')
            setIsLoading(false)
        }
    }

    const handleAppleLogin = () => {
        console.log('Apple login clicked')
        // TODO: Implement Apple OAuth
    }

    const handleInstagramLogin = () => {
        console.log('Instagram login clicked')
        // TODO: Implement Instagram OAuth
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleLoginMethodChange = (method) => {
        setFormData(prev => ({
            ...prev,
            loginMethod: method,
            email: method === 'email' ? prev.email : '',
            phone: method === 'phone' ? prev.phone : ''
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setValidationErrors({})

        try {
            // Validate form data
            const validationData = {
                ...formData,
                email: formData.loginMethod === 'email' ? formData.email : undefined,
                phone: formData.loginMethod === 'phone' ? formData.phone : undefined
            }
            
            await loginSchema.validate(validationData, { abortEarly: false })

            const credentials = {
                password: formData.password
            }

            if (formData.loginMethod === 'email') {
                credentials.email = formData.email
            } else {
                // Combine country code with phone number
                credentials.phone = countryCode + formData.phone
            }

            const result = await login(credentials)
            
            if (result.success) {
                navigate('/')
            } else {
                setError(result.error)
            }
        } catch (validationError) {
            if (validationError.name === 'ValidationError') {
                const errors = {}
                validationError.inner.forEach((error) => {
                    errors[error.path] = error.message
                })
                setValidationErrors(errors)
            } else {
                setError('An unexpected error occurred')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row justify-center  lg:items-center py-5 lg:py-10 px-5  md:gap-y-10 lg:px-8 gap-x-10  gap-y-5">

            {/* Left Side */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center justify-center gap-y-3">
                
                {/* Logo */}
                <div className="w-32 h-24 md:w-48 md:h-32 lg:w-64 lg:h-48 ">
                    <img src={logo} alt="logo" className="w-full h-full" />
                </div>

                {/* Title */}
                <div className="text-center">
                    <h2 className="title2">
                        Sign in to your account
                    </h2>
                    <p className="text-sm text-gray-600">
                        Welcome back! Please enter your details.
                    </p>
                </div>

            </div>

            {/* Right Side */}
            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="">

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Login Method Toggle */}
                        <div className="flex rounded-lg shadow-sm overflow-hidden">
                            <button
                                type="button"
                                onClick={() => handleLoginMethodChange('email')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                                    formData.loginMethod === 'email'
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-primary border border-primary hover:bg-primary hover:text-white'
                                }`}
                            >
                                <FiMail className="inline mr-2" />
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => handleLoginMethodChange('phone')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                                    formData.loginMethod === 'phone'
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-primary border border-primary hover:bg-primary hover:text-white'
                                }`}
                            >
                                <FiPhone className="inline mr-2" />
                                Phone
                            </button>
                        </div>

                        {/* Email/Phone Input */}
                        <div>
                            <label htmlFor={formData.loginMethod} className="block text-start text-sm font-medium text-gray-700 mb-2">
                                {formData.loginMethod === 'email' ? 'Email address' : 'Phone number'}
                            </label>
                            <div className="relative">
                                {formData.loginMethod === 'email' ? (
                                    <>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="h-5 w-5 text-primary" />
                                        </div>
                                        <input
                                            id={formData.loginMethod}
                                            name={formData.loginMethod}
                                            type="email"
                                            required
                                            className={`input pl-10 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            placeholder="Enter your email"
                                            value={formData[formData.loginMethod]}
                                            onChange={handleInputChange}
                                        />
                                        {validationErrors.email && (
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex">
                                        {/* Country Code Selector */}
                                        <div className="relative flex-shrink-0">
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="h-full px-3 py-3 border border-gray-300 rounded-l-lg border-r-0 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 bg-white text-sm"
                                            >
                                                {countryCodes.map((country, index) => (
                                                    <option key={index} value={country.code}>
                                                        {country.flag} {country.code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Phone Input */}
                                        <div className="flex-1 relative">
                                            <input
                                                id={formData.loginMethod}
                                                name={formData.loginMethod}
                                                type="tel"
                                                required
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm ${validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                                placeholder="Enter your phone number"
                                                value={formData[formData.loginMethod]}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        {validationErrors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-start text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-primary" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className={`input pl-10 pr-10 ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                                )}
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-primary hover:text-secondary transition-colors"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="h-5 w-5" />
                                        ) : (
                                            <FiEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link
                                    to="/forgot-password"
                                    className="font-medium text-primary hover:text-secondary transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>

                    </form>

                    {/* Social Login Section */}
                    <div className="mt-8">
                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="mt-6 space-y-3">
                            {/* Google Login */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                            >
                                <FcGoogle className="w-5 h-5 mr-3" />
                                <span className="font-medium">Continue with Google</span>
                            </button>

                            {/* Apple Login */}
                            <button
                                onClick={handleAppleLogin}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-black text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                            >
                                <FaApple className="w-5 h-5 mr-3" />
                                <span className="font-medium">Continue with Apple</span>
                            </button>

                            {/* Instagram Login */}
                            <button
                                onClick={handleInstagramLogin}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                            >
                                <FaInstagram className="w-5 h-5 mr-3" />
                                <span className="font-medium">Continue with Instagram</span>
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>

        </div>
    )
}

export default Login 