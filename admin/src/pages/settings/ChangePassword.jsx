import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiSave, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ChangePassword = () => {
  const { changePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      toast.success('Password changed successfully!')
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '' }

    let score = 0
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    ]

    score = checks.filter(Boolean).length

    if (score <= 2) return { level: 1, text: 'Weak', color: 'text-red-600 bg-red-50' }
    if (score <= 3) return { level: 2, text: 'Fair', color: 'text-yellow-600 bg-yellow-50' }
    if (score <= 4) return { level: 3, text: 'Good', color: 'text-blue-600 bg-blue-50' }
    return { level: 4, text: 'Strong', color: 'text-green-600 bg-green-50' }
  }

  const strength = passwordStrength(formData.newPassword)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Settings
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
            <FiLock className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
            <p className="text-gray-600">Update your account password for better security</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FiShield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Security Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a strong password with at least 8 characters</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Add numbers and special characters</li>
              <li>• Avoid using personal information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`input pr-10 ${errors.currentPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <FiEyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FiEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`input pr-10 ${errors.newPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <FiEyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FiEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Password strength:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${strength.color}`}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          level <= strength.level
                            ? strength.level === 1
                              ? 'bg-red-500'
                              : strength.level === 2
                              ? 'bg-yellow-500'
                              : strength.level === 3
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`input pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <FiEyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FiEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                  ✓ At least 8 characters long
                </li>
                <li className={/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ One lowercase letter (a-z)
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ One uppercase letter (A-Z)
                </li>
                <li className={/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ One number (0-9)
                </li>
                <li className={/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ One special character (!@#$%^&* etc.)
                </li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                to="/settings"
                className="btn btn-outline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
                disabled={loading}
              >
                <FiSave className="h-4 w-4" />
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Additional Security Info */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Additional Security Measures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiShield className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiLock className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Login History</p>
              <p className="text-sm text-gray-600">Monitor your account activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword