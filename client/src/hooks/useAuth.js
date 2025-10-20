import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Login mutation
export const useLogin = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authAPI.login,
        onSuccess: (data) => {
            // Store tokens and user data
            const { user, accessToken, refreshToken } = data.data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            // Update query cache
            queryClient.setQueryData(['auth', 'me'], user)
            
            toast.success('Login successful!')
        },
        onError: (error) => {
            console.error('Login error:', error)
            toast.error(error.response?.data?.message || 'Login failed')
        }
    })
}

// Register mutation
export const useRegister = () => {
    return useMutation({
        mutationFn: authAPI.register,
        onSuccess: (data) => {
            toast.success(data.data.message || 'Registration successful!')
        },
        onError: (error) => {
            console.error('Registration error:', error)
            toast.error(error.response?.data?.message || 'Registration failed')
        }
    })
}

// Verify OTP mutation
export const useVerifyOTP = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authAPI.verifyOTP,
        onSuccess: (data) => {
            // Store tokens and user data
            const { user, accessToken, refreshToken } = data.data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            // Update query cache
            queryClient.setQueryData(['auth', 'me'], user)
            
            toast.success('Email verified successfully!')
        },
        onError: (error) => {
            console.error('OTP verification error:', error)
            toast.error(error.response?.data?.message || 'OTP verification failed')
        }
    })
}

// Resend OTP mutation
export const useResendOTP = () => {
    return useMutation({
        mutationFn: authAPI.resendOTP,
        onSuccess: (data) => {
            toast.success(data.data.message || 'OTP has been resent!')
        },
        onError: (error) => {
            console.error('Resend OTP error:', error)
            toast.error(error.response?.data?.message || 'Failed to resend OTP')
        }
    })
}

// Forgot password mutation
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: authAPI.forgotPassword,
        onSuccess: (data) => {
            toast.success(data.data.message || 'Password reset instructions sent!')
        },
        onError: (error) => {
            console.error('Forgot password error:', error)
            toast.error(error.response?.data?.message || 'Failed to send reset instructions')
        }
    })
}

// Reset password mutation
export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ token, newPassword }) => authAPI.resetPassword(token, newPassword),
        onSuccess: (data) => {
            toast.success(data.data.message || 'Password reset successfully!')
        },
        onError: (error) => {
            console.error('Reset password error:', error)
            toast.error(error.response?.data?.message || 'Failed to reset password')
        }
    })
}

// Get current user query
export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const response = await authAPI.getMe()
            return response.data.data.user
        },
        enabled: !!localStorage.getItem('accessToken'),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            // Don't retry on 401 errors
            if (error?.response?.status === 401) {
                return false
            }
            return failureCount < 3
        }
    })
}

// Logout mutation
export const useLogout = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authAPI.logout,
        onSuccess: () => {
            // Clear local storage
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')

            // Clear all query cache
            queryClient.clear()
            
            toast.success('Logged out successfully!')
        },
        onError: (error) => {
            console.error('Logout error:', error)
            // Still clear local storage even if logout request fails
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            queryClient.clear()
            toast.error('Logout completed')
        }
    })
}

// Google OAuth mutation
export const useGoogleAuth = () => {
    return useMutation({
        mutationFn: authAPI.googleAuth,
        onError: (error) => {
            console.error('Google auth error:', error)
            toast.error(error.response?.data?.message || 'Google authentication failed')
        }
    })
}

// Google OAuth callback mutation
export const useGoogleAuthCallback = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authAPI.googleAuthCallback,
        onSuccess: (data) => {
            // Store tokens and user data
            const { user, tokens } = data.data
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            // Update query cache
            queryClient.setQueryData(['auth', 'me'], user)
            
            toast.success('Google authentication successful!')
        },
        onError: (error) => {
            console.error('Google auth callback error:', error)
            toast.error(error.response?.data?.message || 'Google authentication failed')
        }
    })
}

// Google OAuth with ID token mutation (for mobile/web)
export const useGoogleAuthWithIdToken = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authAPI.googleAuthMobile,
        onSuccess: (data) => {
            // Store tokens and user data
            const { user, tokens } = data.data
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            // Update query cache
            queryClient.setQueryData(['auth', 'me'], user)
            
            toast.success('Google authentication successful!')
        },
        onError: (error) => {
            console.error('Google auth with ID token error:', error)
            toast.error(error.response?.data?.message || 'Google authentication failed')
        }
    })
}
