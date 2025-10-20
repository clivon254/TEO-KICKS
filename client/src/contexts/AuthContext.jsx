import { createContext, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuthLoading, setAuthSuccess, clearAuth, setAuthFailure, setUser, clearError } from '../store/slices/authSlice'
import { authAPI, userAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Create context
const AuthContext = createContext()

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch()
    const authState = useSelector((state) => state.auth)
    const navigate = useNavigate()
    
    // Use Redux state as source of truth for auth
    const isAuthenticated = authState.isAuthenticated
    const user = authState.user
    const isLoading = authState.isLoading
    const error = authState.error

    // Check if user is already logged in on app start
    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        const storedUserString = localStorage.getItem('user')

        // Rehydrate immediately from localStorage so state survives reloads
        if (token && storedUserString) {
            try {
                const storedUser = JSON.parse(storedUserString)
                if (storedUser) {
                    dispatch(setAuthSuccess(storedUser))
                    
                    // Background validation - update with latest user data
                    authAPI.getMe()
                        .then(response => {
                            const latestUser = response.data.data.user
                            dispatch(setUser(latestUser))
                            localStorage.setItem('user', JSON.stringify(latestUser))
                        })
                        .catch(() => {
                            // Keep cached state, allow manual action
                        })
                }
            } catch (error) {
                console.error('Error parsing stored user:', error)
                localStorage.removeItem('user')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
            }
        } else {
            dispatch(setAuthLoading(false))
        }
    }, [dispatch])

    // Login function
    const login = async (credentials) => {
        dispatch(setAuthLoading(true))
        
        try {
            const response = await authAPI.login(credentials)
            const { user, accessToken, refreshToken } = response.data.data

            // Store tokens and user data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            dispatch(setAuthSuccess(user))
            toast.success('Login successful!')
            return { success: true }
            
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Login failed'
            dispatch(setAuthFailure(errorMessage))
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Register function
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData)
            toast.success(response.data.data.message || 'Registration successful!')
            return { success: true, data: response.data.data }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Registration failed'
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Verify OTP function
    const verifyOTP = async (otpData) => {
        dispatch(setAuthLoading(true))

        try {
            const response = await authAPI.verifyOTP(otpData)
            const { user, accessToken, refreshToken } = response.data.data

            // Store tokens and user data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            dispatch(setAuthSuccess(user))
            toast.success('Email verified successfully!')
            return { success: true }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'OTP verification failed'
            dispatch(setAuthFailure(errorMessage))
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Resend OTP function
    const resendOTP = async (emailData) => {
        try {
            const response = await authAPI.resendOTP(emailData)
            toast.success(response.data.data.message || 'OTP has been resent!')
            return { success: true }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to resend OTP'
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Forgot password function
    const forgotPassword = async (email) => {
        try {
            const response = await authAPI.forgotPassword(email)
            toast.success(response.data.data.message || 'Password reset instructions sent!')
            return { success: true }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to send reset instructions'
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Reset password function
    const resetPassword = async (token, newPassword) => {
        try {
            const response = await authAPI.resetPassword(token, newPassword)
            toast.success(response.data.data.message || 'Password reset successfully!')
            return { success: true }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to reset password'
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Update profile function
    const updateProfile = async (profileData) => {
        try {
            const response = await userAPI.updateProfile(profileData)
            const updatedUser = response.data.data.user
            
            // Update Redux state and localStorage
            dispatch(setUser(updatedUser))
            localStorage.setItem('user', JSON.stringify(updatedUser))
            
            toast.success('Profile updated successfully!')
            return { success: true, user: updatedUser }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to update profile'
            toast.error(errorMessage)
            throw error
        }
    }

    // Change password function
    const changePassword = async (passwordData) => {
        try {
            await userAPI.changePassword(passwordData)
            toast.success('Password changed successfully!')
            return { success: true }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to change password'
            toast.error(errorMessage)
            throw error
        }
    }

    // Logout function
    const logout = async () => {
        try {
            await authAPI.logout()
        } catch (error) {
            console.error('Logout API error:', error)
        } finally {
            // Clear local storage and state regardless of API response
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            dispatch(clearAuth())
            toast.success('Logged out successfully!')
            navigate('/login')
        }
    }

    // Initiate Google Auth function
    const initiateGoogleAuth = async () => {
        try {
            const response = await authAPI.googleAuth()
            const authUrl = response.data.data.authUrl
            window.location.href = authUrl
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to initiate Google authentication'
            toast.error(errorMessage)
            throw error
        }
    }

    // Handle Google callback function
    const handleGoogleCallback = async (code) => {
        dispatch(setAuthLoading(true))

        try {
            const response = await authAPI.googleAuthCallback({ code })
            const { user, tokens } = response.data.data

            // Store tokens and user data
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            dispatch(setAuthSuccess(user))
            toast.success('Google authentication successful!')
            return { success: true }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Google authentication failed'
            dispatch(setAuthFailure(errorMessage))
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Google Auth with ID Token function (for mobile/web)
    const googleAuthWithIdToken = async (idToken) => {
        dispatch(setAuthLoading(true))

        try {
            const response = await authAPI.googleAuthMobile({ idToken })
            const { user, tokens } = response.data.data

            // Store tokens and user data
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            dispatch(setAuthSuccess(user))
            toast.success('Google authentication successful!')
            return { success: true }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Google authentication failed'
            dispatch(setAuthFailure(errorMessage))
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Clear error function
    const clearError = () => {
        dispatch(clearError())
    }

    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        verifyOTP,
        resendOTP,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        logout,
        initiateGoogleAuth,
        handleGoogleCallback,
        googleAuthWithIdToken,
        clearError
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
