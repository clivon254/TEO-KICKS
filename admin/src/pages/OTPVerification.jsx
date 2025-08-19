import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import logo from '../assets/logo.png'
import { otpSchema } from '../utils/validation'

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [email, setEmail] = useState('')
    const [validationErrors, setValidationErrors] = useState({})

    const { verifyOTP, resendOTP } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Get email from location state or localStorage
    useEffect(() => {
        const emailFromState = location.state?.email
        const emailFromStorage = localStorage.getItem('pendingEmail')
        
        if (emailFromState) {
            setEmail(emailFromState)
            localStorage.setItem('pendingEmail', emailFromState)
        } else if (emailFromStorage) {
            setEmail(emailFromStorage)
        } else {
            // No email found, redirect to login
            navigate('/login')
        }
    }, [location, navigate])

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return // Only allow single digit
        
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`)
            if (nextInput) nextInput.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`)
            if (prevInput) prevInput.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setValidationErrors({})

        try {
            const otpString = otp.join('')
            
            // Validate OTP
            await otpSchema.validate({
                otp: otpString,
                email
            }, { abortEarly: false })

            const result = await verifyOTP({
                email,
                otp: otpString
            })

            if (result.success) {
                localStorage.removeItem('pendingEmail')
                navigate('/dashboard')
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

    const handleResendOTP = async () => {
        setResendLoading(true)
        
        const result = await resendOTP({ email })
        
        if (result.success) {
            setCountdown(60) // 60 seconds countdown
        }
        
        setResendLoading(false)
    }

    const handleBackToLogin = () => {
        localStorage.removeItem('pendingEmail')
        navigate('/login')
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
                        Verify your email
                    </h2>
                    <p className="text-sm text-gray-600">
                        We've sent a verification code to
                    </p>
                    <p className="text-sm font-medium text-primary">
                        {email}
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* OTP Input Fields */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Enter the 6-digit code
                            </label>
                            <div className="flex justify-between space-x-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                        placeholder="0"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Validation Error */}
                        {validationErrors.otp && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                <p className="text-sm font-medium">{validationErrors.otp}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || otp.join('').length !== 6}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify Email'
                                )}
                            </button>
                        </div>

                        {/* Resend OTP */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Didn't receive the code?
                            </p>
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resendLoading || countdown > 0}
                                className="mt-2 text-sm font-medium text-primary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto transition-colors"
                            >
                                {resendLoading ? (
                                    <div className="flex items-center">
                                        <FiRefreshCw className="animate-spin mr-2" />
                                        Sending...
                                    </div>
                                ) : countdown > 0 ? (
                                    `Resend in ${countdown}s`
                                ) : (
                                    <div className="flex items-center">
                                        <FiRefreshCw className="mr-2" />
                                        Resend code
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="text-sm font-medium text-gray-600 hover:text-primary flex items-center justify-center mx-auto transition-colors"
                            >
                                <FiArrowLeft className="mr-2" />
                                Back to login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default OTPVerification 