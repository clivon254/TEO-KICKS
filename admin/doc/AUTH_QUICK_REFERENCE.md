# Authentication Quick Reference

This is a quick reference guide for developers working with authentication in the TEO KICKS Admin application.

---

## Import Auth Hook

```javascript
import { useAuth } from '@/contexts/AuthContext'

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  // Your component logic
}
```

---

## Common Auth Operations

### 1. Login User

```javascript
const { login } = useAuth()

const handleLogin = async (e) => {
  e.preventDefault()
  
  const result = await login({
    identifier: "user@example.com",  // Email or phone
    password: "password123"
  })
  
  if (result.success) {
    // Login successful - auto redirects to dashboard
    console.log("Logged in!")
  } else {
    // Error handled automatically with toast
    console.error(result.error)
  }
}
```

### 2. Register New User

```javascript
const { register } = useAuth()
const navigate = useNavigate()

const handleRegister = async (e) => {
  e.preventDefault()
  
  const result = await register({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "254712345678",
    password: "SecurePass123",
    confirmPassword: "SecurePass123"
  })
  
  if (result.success) {
    // Navigate to OTP verification
    navigate('/otp-verification', { 
      state: { email: "john@example.com" } 
    })
  }
}
```

### 3. Verify OTP

```javascript
const { verifyOTP } = useAuth()
const location = useLocation()
const navigate = useNavigate()

const handleVerifyOTP = async (e) => {
  e.preventDefault()
  
  const otpString = otp.join('')  // Combine 6 digits
  const email = location.state?.email
  
  const result = await verifyOTP({
    email: email,
    otp: otpString
  })
  
  if (result.success) {
    // Auto redirects to dashboard
    console.log("OTP verified!")
  }
}
```

### 4. Logout User

```javascript
const { logout } = useAuth()

const handleLogout = async () => {
  await logout()  // Clears state and redirects to login
}
```

### 5. Update User Profile

```javascript
const { updateProfile } = useAuth()

const handleUpdateProfile = async (e) => {
  e.preventDefault()
  
  try {
    const result = await updateProfile({
      firstName: "Jane",
      lastName: "Smith",
      phone: "254722345678"
    })
    
    console.log("Profile updated:", result.user)
  } catch (error) {
    console.error("Update failed:", error)
  }
}
```

### 6. Change Password

```javascript
const { changePassword } = useAuth()

const handleChangePassword = async (e) => {
  e.preventDefault()
  
  try {
    await changePassword({
      currentPassword: "OldPass123",
      newPassword: "NewPass123",
      confirmNewPassword: "NewPass123"
    })
    
    console.log("Password changed successfully")
  } catch (error) {
    console.error("Password change failed:", error)
  }
}
```

### 7. Forgot Password

```javascript
const { forgotPassword } = useAuth()

const handleForgotPassword = async (e) => {
  e.preventDefault()
  
  const result = await forgotPassword("user@example.com")
  
  if (result.success) {
    // Show success message
    setEmailSent(true)
  }
}
```

### 8. Reset Password

```javascript
const { resetPassword } = useAuth()
const { token } = useParams()
const navigate = useNavigate()

const handleResetPassword = async (e) => {
  e.preventDefault()
  
  const result = await resetPassword(token, "NewPassword123")
  
  if (result.success) {
    navigate('/login')
  }
}
```

### 9. Google OAuth Login

```javascript
const { initiateGoogleAuth } = useAuth()

const handleGoogleLogin = async () => {
  await initiateGoogleAuth()  // Redirects to Google
}
```

### 10. Google OAuth (ID Token - Mobile/Web)

```javascript
const { googleAuthWithIdToken } = useAuth()

const handleGoogleSignIn = async () => {
  // After Google Sign-In SDK returns ID token
  const idToken = "eyJhbGciOiJSUzI1NiIs..."
  
  const result = await googleAuthWithIdToken(idToken)
  
  if (result.success) {
    // Logged in via Google
  }
}
```

---

## Check Authentication State

### Basic Auth Check

```javascript
const { isAuthenticated, isLoading } = useAuth()

if (isLoading) {
  return <LoadingSpinner />
}

if (!isAuthenticated) {
  return <Navigate to="/login" />
}

return <ProtectedContent />
```

### Get Current User

```javascript
const { user } = useAuth()

console.log(user)
// {
//   id: "...",
//   firstName: "John",
//   lastName: "Doe",
//   email: "john@example.com",
//   phone: "254712345678",
//   role: { name: "Admin", permissions: [...] },
//   isActive: true,
//   isVerified: true
// }
```

### Check User Role

```javascript
const { user } = useAuth()

if (user?.role?.name === 'Admin') {
  // Show admin features
}

if (user?.role?.name === 'Staff') {
  // Show staff features
}
```

### Check Permissions

```javascript
const { user } = useAuth()

const hasPermission = (permission) => {
  return user?.role?.permissions?.includes(permission)
}

if (hasPermission('write:products')) {
  // Allow product creation
}

if (hasPermission('read:analytics')) {
  // Show analytics
}
```

---

## API Call Examples

### Making Authenticated Requests

The axios instance automatically adds auth headers, so just call the API:

```javascript
import { productAPI } from '@/utils/api'

// Get products (auth header added automatically)
const products = await productAPI.getAllProducts({ page: 1, limit: 10 })

// Create product (auth header added automatically)
const newProduct = await productAPI.createProduct(productData)
```

### Manual API Call with Auth

```javascript
import axios from 'axios'

const token = localStorage.getItem('accessToken')

const response = await axios.get('http://localhost:5000/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## Common Patterns

### 1. Protected Component

```javascript
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const AdminOnlyComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingSpinner />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (user?.role?.name !== 'Admin') {
    return <div>Access Denied</div>
  }
  
  return (
    <div>
      {/* Admin content */}
    </div>
  )
}
```

### 2. Conditional Rendering Based on Auth

```javascript
const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()
  
  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.firstName}!</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </header>
  )
}
```

### 3. Form with Auth

```javascript
const LoginForm = () => {
  const { login } = useAuth()
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await login(credentials)
      // Success handled by AuthContext
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={credentials.identifier}
        onChange={(e) => setCredentials({
          ...credentials,
          identifier: e.target.value
        })}
        placeholder="Email or Phone"
        required
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({
          ...credentials,
          password: e.target.value
        })}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### 4. Auto-Redirect After Login

```javascript
// Login page
const Login = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])
  
  return <LoginForm />
}
```

### 5. Background Token Refresh

Token refresh is automatic via axios interceptors. No manual handling needed:

```javascript
// This happens automatically
try {
  const products = await productAPI.getAllProducts()
  // If token expired, interceptor will:
  // 1. Catch 401
  // 2. Call refresh endpoint
  // 3. Get new access token
  // 4. Retry the request
  // 5. Return products
} catch (error) {
  // Only if refresh also fails
  console.error(error)
}
```

---

## Error Messages Reference

### Login Errors

| Error | Message | User Action |
|-------|---------|-------------|
| Invalid credentials | "Invalid email or password" | Re-enter correct credentials |
| Account inactive | "Your account has been deactivated" | Contact admin |
| Email not verified | "Please verify your email first" | Check email for OTP or resend |
| User not found | "No account found with this email" | Register or check email |
| Too many attempts | "Too many login attempts. Try again later" | Wait and retry |

### Registration Errors

| Error | Message | User Action |
|-------|---------|-------------|
| Email exists | "Email already registered" | Login or use different email |
| Phone exists | "Phone number already in use" | Login or use different phone |
| Weak password | "Password must be at least 8 characters" | Use stronger password |
| Invalid email | "Invalid email format" | Correct email format |
| Missing fields | "All fields are required" | Fill all required fields |

### OTP Errors

| Error | Message | User Action |
|-------|---------|-------------|
| Invalid OTP | "Invalid or incorrect OTP" | Re-enter correct OTP |
| Expired OTP | "OTP has expired" | Click "Resend OTP" |
| Too many attempts | "Too many OTP verification attempts" | Wait 15 minutes |

### Password Reset Errors

| Error | Message | User Action |
|-------|---------|-------------|
| Invalid token | "Password reset token is invalid" | Request new reset link |
| Expired token | "Password reset token has expired" | Request new reset link |
| Token used | "This reset link has already been used" | Request new reset link |
| User not found | "No account found with this email" | Check email address |

---

## localStorage Keys

```javascript
// Keys used by auth system
'accessToken'   // JWT access token
'refreshToken'  // JWT refresh token
'user'          // Stringified user object

// Reading stored data
const token = localStorage.getItem('accessToken')
const user = JSON.parse(localStorage.getItem('user'))

// Clearing auth data
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
localStorage.removeItem('user')
// Or clear all:
localStorage.clear()
```

---

## Environment Variables

```bash
# Required for Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_OAUTH_REDIRECT_URL=http://localhost:3000/auth/google/callback

# Future OAuth providers
VITE_APPLE_CLIENT_ID=
VITE_INSTAGRAM_CLIENT_ID=

# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Auth Context Available Functions

```javascript
const {
  // State
  user,                      // Current user object or null
  isAuthenticated,           // Boolean
  isLoading,                 // Boolean
  error,                     // String or null
  
  // Functions
  login,                     // (credentials) => Promise
  register,                  // (userData) => Promise
  verifyOTP,                 // (otpData) => Promise
  resendOTP,                 // (emailData) => Promise
  forgotPassword,            // (email) => Promise
  resetPassword,             // (token, newPassword) => Promise
  updateProfile,             // (profileData) => Promise
  changePassword,            // (passwordData) => Promise
  logout,                    // () => Promise
  initiateGoogleAuth,        // () => Promise
  handleGoogleCallback,      // (code) => Promise
  googleAuthWithIdToken,     // (idToken) => Promise
  clearError,                // () => void
} = useAuth()
```

---

## API Endpoints Cheat Sheet

| Operation | Method | Endpoint | Auth Required |
|-----------|--------|----------|---------------|
| Login | POST | `/auth/login` | No |
| Register | POST | `/auth/register` | No |
| Verify OTP | POST | `/auth/verify-otp` | No |
| Resend OTP | POST | `/auth/resend-otp` | No |
| Forgot Password | POST | `/auth/forgot-password` | No |
| Reset Password | POST | `/auth/reset-password/:token` | No |
| Get Current User | GET | `/auth/me` | Yes |
| Logout | POST | `/auth/logout` | Yes |
| Refresh Token | POST | `/auth/refresh` | No (uses refresh token) |
| Google OAuth Init | GET | `/auth/google` | No |
| Google OAuth Callback | POST | `/auth/google/callback` | No |
| Google Auth Mobile | POST | `/auth/google/mobile` | No |
| Update Profile | PUT | `/users/profile` | Yes |
| Change Password | PUT | `/users/change-password` | Yes |

---

## Response Status Codes

| Status | Meaning | Typical Scenario |
|--------|---------|------------------|
| 200 | Success | Operation completed successfully |
| 201 | Created | User registered successfully |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | Invalid credentials, expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User not found, invalid reset token |
| 409 | Conflict | Email/phone already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Testing Auth Locally

### 1. Test Login
```javascript
// In browser console
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
  console.log(data)
}
testLogin()
```

### 2. Test Token
```javascript
// In browser console
const testToken = async () => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  console.log(data)
}
testToken()
```

### 3. Check Stored Auth Data
```javascript
// In browser console
console.log('Access Token:', localStorage.getItem('accessToken'))
console.log('Refresh Token:', localStorage.getItem('refreshToken'))
console.log('User:', JSON.parse(localStorage.getItem('user')))
```

---

## Common Pitfalls & Solutions

### ❌ Pitfall: Not handling loading state
```javascript
// BAD
const MyComponent = () => {
  const { user } = useAuth()
  return <div>Welcome, {user.firstName}</div>  // Error if user is null
}
```

```javascript
// GOOD
const MyComponent = () => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  
  return <div>Welcome, {user.firstName}</div>
}
```

### ❌ Pitfall: Not using try-catch for profile updates
```javascript
// BAD
const handleUpdate = async () => {
  await updateProfile(data)  // Throws error, crashes app
}
```

```javascript
// GOOD
const handleUpdate = async () => {
  try {
    await updateProfile(data)
    toast.success('Updated!')
  } catch (error) {
    toast.error('Update failed')
  }
}
```

### ❌ Pitfall: Hardcoding API URL
```javascript
// BAD
const API_URL = 'http://localhost:5000/api'
```

```javascript
// GOOD
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
```

### ❌ Pitfall: Not clearing tokens on logout
```javascript
// BAD
const logout = () => {
  navigate('/login')  // Tokens still in storage!
}
```

```javascript
// GOOD
const logout = async () => {
  try {
    await authAPI.logout()
  } finally {
    localStorage.clear()
    clearAuthState()
    navigate('/login')
  }
}
```

---

## Debug Checklist

When auth isn't working:

- [ ] Check if backend server is running (`http://localhost:5000`)
- [ ] Verify API_BASE_URL in `api.js` matches backend
- [ ] Check if accessToken exists in localStorage
- [ ] Check if token is expired (try refresh)
- [ ] Verify user object is valid in localStorage
- [ ] Check browser console for errors
- [ ] Check network tab for API call responses
- [ ] Verify CORS configuration in backend
- [ ] Check if backend env variables are set
- [ ] Test API endpoint directly with Postman/curl

---

## Sample User Objects

### Admin User
```javascript
{
  id: "507f1f77bcf86cd799439011",
  firstName: "Admin",
  lastName: "User",
  email: "admin@teokicks.com",
  phone: "254712345678",
  role: {
    name: "Admin",
    permissions: [
      "read:users",
      "write:users",
      "delete:users",
      "read:products",
      "write:products",
      "delete:products",
      "read:orders",
      "write:orders",
      "read:analytics"
    ]
  },
  isActive: true,
  isVerified: true,
  createdAt: "2025-01-15T10:30:00.000Z"
}
```

### Staff User
```javascript
{
  id: "507f1f77bcf86cd799439012",
  firstName: "John",
  lastName: "Doe",
  email: "john@teokicks.com",
  phone: "254722345678",
  role: {
    name: "Staff",
    permissions: [
      "read:products",
      "write:products",
      "read:orders",
      "write:orders"
    ]
  },
  isActive: true,
  isVerified: true,
  createdAt: "2025-02-01T14:20:00.000Z"
}
```

---

## Quick Troubleshooting

### "Network Error"
- Backend server not running
- Wrong API URL
- CORS issue

**Fix**: 
```bash
cd server
npm run dev  # Start backend
```

### "Invalid token"
- Token expired
- Token malformed
- Wrong token in localStorage

**Fix**:
```javascript
// Clear and re-login
localStorage.clear()
// Navigate to login
```

### "401 Unauthorized" (after refresh fails)
- Refresh token expired
- User logged out from another device
- Backend cleared tokens

**Fix**: 
```javascript
// User must login again
logout()  // Clear state and redirect
```

### "User is null"
- Page loaded before auth initialization
- Token validation in progress

**Fix**:
```javascript
// Always check isLoading first
if (isLoading) return <Spinner />
if (!user) return <Navigate to="/login" />
```

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0  
**For**: TEO KICKS Admin App Development

