import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiChevronDown } from 'react-icons/fi'
import logo from '../assets/logo.png'

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

    const { login } = useAuth()
    const navigate = useNavigate()

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
            navigate('/dashboard')
        } else {
            setError(result.error)
        }
        
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row justify-center py-5 lg:py-10 sm:px-5  lg:px-8 gap-x-10 gap-y-5">

            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center justify-center">
                
                <div className="w-32 h-24 mb-4">
                    <img src={logo} alt="logo" className="w-full h-full" />
                </div>

                <div className="text-center">
                    <h2 className="title2">
                        Sign in to your account
                    </h2>
                    <p className="text-sm text-gray-600">
                        Welcome back! Please enter your details.
                    </p>
                </div>

            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
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
                                            className="input pl-10"
                                            placeholder="Enter your email"
                                            value={formData[formData.loginMethod]}
                                            onChange={handleInputChange}
                                        />
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
                                                className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm"
                                                placeholder="Enter your phone number"
                                                value={formData[formData.loginMethod]}
                                                onChange={handleInputChange}
                                            />
                                        </div>
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
                                    className="input pl-10 pr-10"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
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

                        {/* Register Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-primary hover:text-secondary transition-colors"
                                >
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    )
}

export default Login 