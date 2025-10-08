import { createContext, useContext, useReducer, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuthLoading, setAuthSuccess, clearAuth, setAuthFailure } from '../store/slices/authSlice'
import { authAPI, userAPI } from '../utils/api'
import toast from 'react-hot-toast'


const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}


const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
}


const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true, error: null }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return { ...state, user: action.payload.user, isAuthenticated: true, isLoading: false, error: null }
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: action.payload }
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null }
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }
    default:
      return state
  }
}


const AuthContext = createContext()


export const AuthProvider = ({ children }) => {
  const [, dispatch] = useReducer(authReducer, initialState)
  const reduxDispatch = useDispatch()
  const authState = useSelector((s) => s.auth)
  const navigate = useNavigate()

  const isAuthenticated = authState.isAuthenticated
  const user = authState.user
  const isLoading = authState.isLoading
  const error = authState.error


  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const storedUserString = localStorage.getItem('user')

    if (token && storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString)
        if (storedUser) {
          dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: storedUser } })
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

    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })

    const refreshUserInBackground = async () => {
      if (!token) return
      try {
        const response = await authAPI.getMe()
        const userData = response.data.data.user
        localStorage.setItem('user', JSON.stringify(userData))
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: userData } })
        reduxDispatch(setAuthSuccess(userData))
      } catch (error) {
        console.log('Background token validation failed:', error.response?.status)
      }
    }

    refreshUserInBackground()
  }, [reduxDispatch])


  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    reduxDispatch(setAuthLoading(true))

    try {
      const response = await authAPI.login(credentials)
      const { user, accessToken, refreshToken } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user } })
      reduxDispatch(setAuthSuccess(user))

      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage })
      reduxDispatch(setAuthFailure(errorMessage))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }


  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await authAPI.register(userData)
      toast.success('Registration successful! Please check your email for OTP verification.')
      return { success: true, data: response.data.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }


  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      reduxDispatch(clearAuth())
      toast.success('Logged out successfully!')

      navigate('/login')
    }
  }


  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  }


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
