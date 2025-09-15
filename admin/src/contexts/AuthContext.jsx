import { createContext, useContext, useReducer, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuthLoading, setAuthSuccess, clearAuth, setAuthFailure } from '../store/slices/authSlice'
import { authAPI, userAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
}

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    SET_LOADING: 'SET_LOADING',
    CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                isLoading: true,
                error: null
            }
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            }
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload
            }
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            }
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            }
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}

// Create context
const AuthContext = createContext()

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [, dispatch] = useReducer(authReducer, initialState)
    const reduxDispatch = useDispatch()
    const authState = useSelector((s) => s.auth)
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

        // 1) Rehydrate immediately from localStorage so state survives reloads
        if (token && storedUserString) {
            try {
                const storedUser = JSON.parse(storedUserString)
                if (storedUser) {
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: { user: storedUser }
                    })
                    reduxDispatch(setAuthSuccess(storedUser))
                } else {
                    dispatch({ type: AUTH_ACTIONS.LOGOUT })
                    reduxDispatch(clearAuth())
                }
            } catch {
                dispatch({ type: AUTH_ACTIONS.LOGOUT })
                reduxDispatch(clearAuth())
            }
        } else {
            dispatch({ type: AUTH_ACTIONS.LOGOUT })
            reduxDispatch(clearAuth())
        }

        // Mark loading complete for initial render
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })

        // 2) Background refresh of user profile; do NOT clear tokens on failure
        const refreshUserInBackground = async () => {
            if (!token) return
            try {
                const response = await authAPI.getMe()
                const userData = response.data.data.user
                localStorage.setItem('user', JSON.stringify(userData))
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: { user: userData }
                })
                reduxDispatch(setAuthSuccess(userData))
            } catch (error) {
                console.log('Background token validation failed:', error.response?.status)
                // intentionally do not clear tokens here to preserve persisted state
            }
        }

        refreshUserInBackground()
    }, [reduxDispatch])

    // Login function
    const login = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START })
        reduxDispatch(setAuthLoading(true))
        
        try {
            const response = await authAPI.login(credentials)
            const { user, accessToken, refreshToken } = response.data.data

            // Store tokens and user data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user }
            })
            reduxDispatch(setAuthSuccess(user))

            toast.success('Login successful!')
            return { success: true }
            
        } catch (error) {
            // Prefer server-provided, specific errors (e.g., Invalid password, User not found, Account inactive)
            const errorMessage = error?.response?.data?.message || error?.message || 'Login failed'
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            })
            reduxDispatch(setAuthFailure(errorMessage))
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Register function
    const register = async (userData) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START })
        
        try {
            const response = await authAPI.register(userData)
            toast.success('Registration successful! Please check your email for OTP verification.')
            return { success: true, data: response.data.data }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed'
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            })
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Verify OTP function
    const verifyOTP = async (otpData) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START })
        
        try {
            const response = await authAPI.verifyOTP(otpData)
            const { user, accessToken, refreshToken } = response.data.data

            // Store tokens and user data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user }
            })

            toast.success('Email verified successfully!')
            return { success: true }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'OTP verification failed'
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            })
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Resend OTP function
    const resendOTP = async (emailData) => {
        try {
            await authAPI.resendOTP(emailData)
            toast.success('OTP has been resent to your email!')
            return { success: true }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to resend OTP'
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Forgot password function
    const forgotPassword = async (email) => {
        try {
            await authAPI.forgotPassword(email)
            toast.success('Password reset instructions sent to your email!')
            return { success: true }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send reset email'
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Reset password function
    const resetPassword = async (token, newPassword) => {
        try {
            await authAPI.resetPassword(token, newPassword)
            toast.success('Password reset successfully!')
            return { success: true }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password'
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Update profile function
    const updateProfile = async (profileData) => {
        try {
            const response = await userAPI.updateProfile(profileData)
            const updatedUser = response.data.data.user

            // Update local storage
            localStorage.setItem('user', JSON.stringify(updatedUser))

            // Update Redux state
            reduxDispatch(setAuthSuccess(updatedUser))

            // Update local context state
            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user: updatedUser }
            })

            toast.success('Profile updated successfully!')
            return { success: true, user: updatedUser }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile'
            toast.error(errorMessage)
            throw error
        }
    }

    // Change password function
    const changePassword = async (passwordData) => {
        try {
            const response = await userAPI.changePassword(passwordData)
            toast.success('Password changed successfully!')
            return { success: true }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password'
            toast.error(errorMessage)
            throw error
        }
    }

    // Logout function
    const logout = async () => {
        try {
            await authAPI.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Clear storage regardless of API call success
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            
            dispatch({ type: AUTH_ACTIONS.LOGOUT })
            reduxDispatch(clearAuth())
            toast.success('Logged out successfully!')
            
            // Navigate to login page
            navigate('/login')
        }
    }

    // Google OAuth functions
    const initiateGoogleAuth = async () => {
        try {
            const response = await authAPI.googleAuth()
            const { authUrl } = response.data.data

            // Open Google OAuth in a popup or redirect
            window.location.href = authUrl
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to initiate Google authentication'
            toast.error(errorMessage)
            throw error
        }
    }

    const handleGoogleCallback = async (code) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START })
        reduxDispatch(setAuthLoading(true))

        try {
            const response = await authAPI.googleAuthCallback({ code })
            const { user, tokens } = response.data.data

            // Store tokens and user data
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user }
            })
            reduxDispatch(setAuthSuccess(user))

            toast.success('Google authentication successful!')
            return { success: true }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Google authentication failed'
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            })
            reduxDispatch(setAuthFailure(errorMessage))
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    const googleAuthWithIdToken = async (idToken) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START })
        reduxDispatch(setAuthLoading(true))

        try {
            const response = await authAPI.googleAuthMobile({ idToken })
            const { user, tokens } = response.data.data

            // Store tokens and user data
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user }
            })
            reduxDispatch(setAuthSuccess(user))

            toast.success('Google authentication successful!')
            return { success: true }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Google authentication failed'
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            })
            reduxDispatch(setAuthFailure(errorMessage))
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
        reduxDispatch(setAuthFailure(null))
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
        clearError,
        initiateGoogleAuth,
        handleGoogleCallback,
        googleAuthWithIdToken
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