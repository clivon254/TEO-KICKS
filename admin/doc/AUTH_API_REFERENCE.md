# Authentication API Reference

Complete API reference for all authentication endpoints in the TEO KICKS Admin application.

---

## Base Configuration

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:5000/api'
// Production: https://api.teokicks.com/api
```

### Headers
```javascript
// Standard headers
{
  'Content-Type': 'application/json'
}

// Authenticated requests (added automatically by axios interceptor)
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

---

## Authentication Endpoints

### 1. Login

**Endpoint**: `POST /auth/login`

**Request Payload**:
```json
{
  "identifier": "admin@teokicks.com",
  "password": "Admin123!"
}
```

**Query Parameters**: None

**Headers**: 
```json
{
  "Content-Type": "application/json"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@teokicks.com",
      "phone": "254712345678",
      "role": {
        "id": "507f191e810c19729de860ea",
        "name": "Admin",
        "permissions": [
          "read:users",
          "write:users",
          "delete:users",
          "read:products",
          "write:products"
        ]
      },
      "isActive": true,
      "isVerified": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-10-14T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2OTQzNDU2MDAsImV4cCI6MTY5NDM0NjUwMH0.abc123",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2OTQzNDU2MDAsImV4cCI6MTY5NTAzMDQwMH0.def456"
  }
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support."
}
```

---

### 2. Register

**Endpoint**: `POST /auth/register`

**Request Payload**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "254712345678",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Query Parameters**: None

**Success Response** (201):
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "254712345678",
      "isVerified": false,
      "isActive": true,
      "createdAt": "2025-10-14T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request (Validation)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters",
    "phone": "Invalid phone number format"
  }
}
```

**409 Conflict**:
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 3. Verify OTP

**Endpoint**: `POST /auth/verify-otp`

**Request Payload**:
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "254712345678",
      "isVerified": true,
      "isActive": true,
      "role": {
        "id": "507f191e810c19729de860ea",
        "name": "Customer",
        "permissions": []
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "User not found"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "message": "Too many OTP verification attempts. Please try again in 15 minutes."
}
```

---

### 4. Resend OTP

**Endpoint**: `POST /auth/resend-otp`

**Request Payload**:
```json
{
  "email": "john.doe@example.com"
}
```

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP has been resent to your email"
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Email is required"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "User not found"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "message": "Please wait 60 seconds before requesting another OTP"
}
```

---

### 5. Forgot Password

**Endpoint**: `POST /auth/forgot-password`

**Request Payload**:
```json
{
  "email": "john.doe@example.com"
}
```

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password reset instructions sent to your email"
}
```

**Error Responses**:

**404 Not Found**:
```json
{
  "success": false,
  "message": "No account found with this email address"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "message": "Too many password reset requests. Please try again later."
}
```

---

### 6. Reset Password

**Endpoint**: `POST /auth/reset-password/:token`

**URL Parameters**:
- `token` - Reset token from email link

**Request Payload**:
```json
{
  "newPassword": "NewSecurePass123!"
}
```

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 7. Get Current User (Get Me)

**Endpoint**: `GET /auth/me`

**Request Payload**: None

**Query Parameters**: None

**Headers**:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@teokicks.com",
      "phone": "254712345678",
      "role": {
        "id": "507f191e810c19729de860ea",
        "name": "Admin",
        "permissions": ["read:users", "write:users"]
      },
      "isActive": true,
      "isVerified": true,
      "avatar": "https://res.cloudinary.com/teokicks/image/upload/v1/avatars/user123.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### 8. Logout

**Endpoint**: `POST /auth/logout`

**Request Payload**: None (token in headers)

**Query Parameters**: None

**Headers**:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 9. Refresh Token

**Endpoint**: `POST /auth/refresh`

**Request Payload**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newAccessToken..."
  }
}
```

**Error Responses**:

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

### 10. Google OAuth - Initiate

**Endpoint**: `GET /auth/google`

**Request Payload**: None

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=email+profile"
  }
}
```

**Frontend Usage**:
```javascript
const response = await authAPI.googleAuth()
window.location.href = response.data.data.authUrl  // Redirect
```

---

### 11. Google OAuth - Callback

**Endpoint**: `POST /auth/google/callback`

**Request Payload**:
```json
{
  "code": "4/0AdEu5BVr5... (OAuth authorization code)"
}
```

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@gmail.com",
      "phone": null,
      "role": {
        "name": "Staff",
        "permissions": ["read:products"]
      },
      "isActive": true,
      "isVerified": true,
      "authProvider": "google",
      "googleId": "110975659058219846071"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid authorization code"
}
```

**500 Server Error**:
```json
{
  "success": false,
  "message": "Failed to authenticate with Google"
}
```

---

### 12. Google OAuth - Mobile/Web (ID Token)

**Endpoint**: `POST /auth/google/mobile`

**Request Payload**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjllNmU0ODFjOTk5ZTc... (Google ID Token)"
}
```

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@gmail.com",
      "phone": null,
      "role": {
        "name": "Staff",
        "permissions": ["read:products"]
      },
      "isActive": true,
      "isVerified": true,
      "authProvider": "google",
      "googleId": "110975659058219846071",
      "avatar": "https://lh3.googleusercontent.com/a/ACg8ocJ..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid ID token"
}
```

---

## User Management Endpoints

### 13. Get User Profile

**Endpoint**: `GET /users/profile`

**Request Payload**: None

**Query Parameters**: None

**Headers**:
```json
{
  "Authorization": "Bearer {accessToken}"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@teokicks.com",
      "phone": "254712345678",
      "avatar": "https://res.cloudinary.com/...",
      "role": {
        "name": "Admin",
        "permissions": ["read:users", "write:users"]
      },
      "isActive": true,
      "isVerified": true,
      "notificationPreferences": {
        "email": true,
        "sms": true,
        "push": false
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-10-14T10:00:00.000Z"
    }
  }
}
```

---

### 14. Update User Profile

**Endpoint**: `PUT /users/profile`

**Request Payload**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "254722345678",
  "avatar": "https://res.cloudinary.com/teokicks/image/upload/v1/avatars/newavatar.jpg"
}
```

**Query Parameters**: None

**Headers**:
```json
{
  "Authorization": "Bearer {accessToken}"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "admin@teokicks.com",
      "phone": "254722345678",
      "avatar": "https://res.cloudinary.com/teokicks/image/upload/v1/avatars/newavatar.jpg",
      "updatedAt": "2025-10-14T11:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid profile data",
  "errors": {
    "phone": "Phone number already in use"
  }
}
```

---

### 15. Change Password

**Endpoint**: `PUT /users/change-password`

**Request Payload**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

**Query Parameters**: None

**Headers**:
```json
{
  "Authorization": "Bearer {accessToken}"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**400 Bad Request (Validation)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "newPassword": "New password must be different from current password",
    "confirmNewPassword": "Passwords do not match"
  }
}
```

---

## Frontend Implementation Examples

### Login Implementation

```javascript
// pages/auth/Login.jsx
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    if (!credentials.identifier || !credentials.password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await login(credentials)
      
      if (result.success) {
        // Success! AuthContext handles navigation
        navigate('/')
      }
    } catch (error) {
      // Error already shown by AuthContext
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="identifier"
        value={credentials.identifier}
        onChange={handleInputChange}
        placeholder="Email or Phone"
        disabled={isLoading}
      />
      <input
        type="password"
        name="password"
        value={credentials.password}
        onChange={handleInputChange}
        placeholder="Password"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### OTP Verification Implementation

```javascript
// pages/auth/OTPVerification.jsx
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const OTPVerification = () => {
  const { verifyOTP, resendOTP } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])
  
  const email = location.state?.email

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please register again.')
      navigate('/login')
    }
  }, [email, navigate])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Take only last digit
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await verifyOTP({
        email,
        otp: otpString
      })
      
      if (result.success) {
        // Success! Redirects to dashboard
        navigate('/')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    
    try {
      const result = await resendOTP({ email })
      
      if (result.success) {
        setResendCooldown(60) // Start 60s cooldown
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="otp-inputs flex gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-xl border rounded"
            disabled={isLoading}
          />
        ))}
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </button>
      
      <button
        type="button"
        onClick={handleResendOTP}
        disabled={resendCooldown > 0}
      >
        {resendCooldown > 0 
          ? `Resend in ${resendCooldown}s` 
          : 'Resend OTP'
        }
      </button>
    </form>
  )
}
```

### Google OAuth Implementation

```javascript
// pages/auth/Login.jsx
import { useAuth } from '@/contexts/AuthContext'
import { FcGoogle } from 'react-icons/fc'

const Login = () => {
  const { initiateGoogleAuth } = useAuth()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      await initiateGoogleAuth()
      // User will be redirected to Google
    } catch (error) {
      console.error('Google auth error:', error)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div>
      {/* Email/Password form */}
      
      <div className="divider">OR</div>
      
      <button
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="google-login-btn"
      >
        <FcGoogle className="mr-2" />
        {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
      </button>
    </div>
  )
}
```

```javascript
// pages/auth/GoogleCallback.jsx
import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const GoogleCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleGoogleCallback } = useAuth()

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        toast.error('Google authentication cancelled')
        navigate('/login')
        return
      }

      if (!code) {
        toast.error('No authorization code received')
        navigate('/login')
        return
      }

      const result = await handleGoogleCallback(code)

      if (result.success) {
        navigate('/')
      } else {
        navigate('/login')
      }
    }

    processCallback()
  }, [searchParams, navigate, handleGoogleCallback])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner"></div>
        <p>Completing Google sign-in...</p>
      </div>
    </div>
  )
}
```

---

## Axios Interceptors Configuration

### Request Interceptor

```javascript
// src/utils/api.js
api.interceptors.request.use(
  (config) => {
    // Add auth token to every request
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Handle FormData (for file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      // Browser will set correct Content-Type with boundary
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

### Response Interceptor (Auto Token Refresh)

```javascript
// src/utils/api.js
api.interceptors.response.use(
  (response) => response,  // Pass through successful responses
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      
      if (refreshToken) {
        try {
          // Call refresh endpoint
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          )

          const { accessToken } = response.data.data
          
          // Store new access token
          localStorage.setItem('accessToken', accessToken)

          // Update Authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          
          // Retry original request with new token
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh token also expired/invalid
          // Keep existing storage for manual retry
          // Don't auto-logout (let route guards handle it)
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)
```

---

## Protected Route Example

```javascript
// App.jsx
import { useAuth } from './contexts/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

const App = () => {
  const Layout = () => {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )
    }

    return isAuthenticated ? (
      <div className="app-layout">
        <Header />
        <Sidebar />
        <main>
          <Outlet />  {/* Nested routes rendered here */}
        </main>
      </div>
    ) : (
      <Navigate to="/login" replace />
    )
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            {/* ... more protected routes */}
          </Route>

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
```

---

## Testing Auth in Development

### Using Browser Console

```javascript
// 1. Test login
const testLogin = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin@teokicks.com',
      password: 'Admin123!'
    })
  })
  const data = await response.json()
  console.log('Login response:', data)
  
  // Store tokens manually
  localStorage.setItem('accessToken', data.data.accessToken)
  localStorage.setItem('refreshToken', data.data.refreshToken)
  localStorage.setItem('user', JSON.stringify(data.data.user))
}
testLogin()

// 2. Test authenticated request
const testAuthRequest = async () => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  console.log('Current user:', data)
}
testAuthRequest()

// 3. Test token refresh
const testRefresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  const response = await fetch('http://localhost:5000/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
  const data = await response.json()
  console.log('New access token:', data.data.accessToken)
  localStorage.setItem('accessToken', data.data.accessToken)
}
testRefresh()

// 4. Check stored auth data
console.log({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: JSON.parse(localStorage.getItem('user'))
})
```

---

## Security Best Practices

### 1. Never Log Sensitive Data
```javascript
// ❌ BAD
console.log('Password:', password)
console.log('Token:', token)

// ✅ GOOD
console.log('Login attempt for user:', email)
console.log('Token exists:', !!token)
```

### 2. Validate Input Client-Side
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password) => {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password)
}
```

### 3. Always Use HTTPS in Production
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://api.teokicks.com/api'  // HTTPS only
  : 'http://localhost:5000/api'
```

### 4. Clear Sensitive Data on Logout
```javascript
const logout = async () => {
  try {
    await authAPI.logout()
  } finally {
    // Clear all auth-related data
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear form fields
    setPassword('')
    
    navigate('/login')
  }
}
```

### 5. Handle Token Expiry Gracefully
```javascript
// Axios interceptor already handles this
// But for manual handling:
const makeAuthRequest = async () => {
  try {
    return await api.get('/some-endpoint')
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired - refresh will auto-trigger
      // Or manually logout
      await logout()
    }
    throw error
  }
}
```

---

## Role-Based Access Examples

### Check Single Permission
```javascript
const { user } = useAuth()

const canCreateProducts = user?.role?.permissions?.includes('write:products')

return (
  <div>
    {canCreateProducts && (
      <button onClick={handleCreateProduct}>
        Create Product
      </button>
    )}
  </div>
)
```

### Check Multiple Permissions
```javascript
const { user } = useAuth()

const hasPermissions = (...permissions) => {
  return permissions.every(permission =>
    user?.role?.permissions?.includes(permission)
  )
}

if (hasPermissions('read:analytics', 'write:reports')) {
  // Show advanced analytics
}
```

### Role-Based Component Rendering
```javascript
const { user } = useAuth()

const renderContentByRole = () => {
  switch (user?.role?.name) {
    case 'Admin':
      return <AdminDashboard />
    case 'Manager':
      return <ManagerDashboard />
    case 'Staff':
      return <StaffDashboard />
    default:
      return <LimitedDashboard />
  }
}

return <div>{renderContentByRole()}</div>
```

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0  
**For**: TEO KICKS Admin App - Quick Reference

