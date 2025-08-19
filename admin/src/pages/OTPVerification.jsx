import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiArrowLeft, FiRefreshCw } from 'react-icons/fi'

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [email, setEmail] = useState('')

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

        const otpString = otp.join('')
        if (otpString.length !== 6) {
            alert('Please enter a valid 6-digit OTP')
            setIsLoading(false)
            return
        }

        const result = await verifyOTP({
            email,
            otp: otpString
        })

        if (result.success) {
            localStorage.removeItem('pendingEmail')
            navigate('/dashboard')
        }

        setIsLoading(false)
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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h1 className="title">
                        TEO KICKS ADMIN
                    </h1>
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

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
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