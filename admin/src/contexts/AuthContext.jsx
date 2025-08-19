import { createContext, useContext, useReducer, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthLoading, setAuthSuccess, clearAuth } from '../store/slices/authSlice'
import { authAPI } from '../utils/api'
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
    const [state, dispatch] = useReducer(authReducer, initialState)
    const reduxDispatch = useDispatch()
    const authState = useSelector((s) => s.auth)

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
    }, [])

    // Login function
    const login = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START })
        
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

            toast.success('Login successful!')
            return { success: true }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed'
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            })
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
            toast.success('Logged out successfully!')
        }
    }

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
    }

    const value = {
        ...state,
        login,
        register,
        verifyOTP,
        resendOTP,
        forgotPassword,
        resetPassword,
        logout,
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