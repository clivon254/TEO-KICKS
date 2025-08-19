import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi'

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const { token } = useParams()
    const { resetPassword } = useAuth()
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validatePassword = (password) => {
        const minLength = 6
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumbers = /\d/.test(password)
        
        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
            errors: {
                length: password.length < minLength,
                uppercase: !hasUpperCase,
                lowercase: !hasLowerCase,
                numbers: !hasNumbers
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Passwords do not match')
            setIsLoading(false)
            return
        }

        // Validate password strength
        const passwordValidation = validatePassword(formData.newPassword)
        if (!passwordValidation.isValid) {
            alert('Password must be at least 6 characters long and contain uppercase, lowercase, and numbers')
            setIsLoading(false)
            return
        }

        const result = await resetPassword(token, formData.newPassword)

        if (result.success) {
            setIsSuccess(true)
        }

        setIsLoading(false)
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <h1 className="title">
                            TEO KICKS ADMIN
                        </h1>
                        <div className="mt-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <FiCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="title2">
                                Password reset successful!
                            </h2>
                            <p className="text-sm text-gray-600">
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="btn-primary inline-flex items-center"
                            >
                                Go to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h1 className="title">
                        TEO KICKS ADMIN
                    </h1>
                    <h2 className="title2">
                        Reset your password
                    </h2>
                    <p className="text-sm text-gray-600">
                        Enter your new password below.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* New Password Input */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-primary" />
                                </div>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="input pl-10 pr-10"
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
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
                            {/* Password requirements */}
                            {formData.newPassword && (
                                <div className="mt-2 text-xs text-gray-600">
                                    <p>Password must contain:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li className={formData.newPassword.length >= 6 ? 'text-green-600' : 'text-red-600'}>
                                            At least 6 characters
                                        </li>
                                        <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}>
                                            One uppercase letter
                                        </li>
                                        <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}>
                                            One lowercase letter
                                        </li>
                                        <li className={/\d/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}>
                                            One number
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-primary" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    className="input pl-10 pr-10"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-primary hover:text-secondary transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <FiEyeOff className="h-5 w-5" />
                                        ) : (
                                            <FiEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {/* Password match indicator */}
                            {formData.confirmPassword && (
                                <div className="mt-2 text-xs">
                                    {formData.newPassword === formData.confirmPassword ? (
                                        <p className="text-green-600">✓ Passwords match</p>
                                    ) : (
                                        <p className="text-red-600">✗ Passwords do not match</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Resetting...
                                    </div>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                            >
                                Back to login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword 