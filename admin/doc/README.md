# TEO KICKS Admin Documentation

Welcome to the TEO KICKS Admin application documentation. This directory contains comprehensive guides for developers working on the admin panel.

---

## Documentation Index

### 📚 Authentication Documentation

1. **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Complete authentication guide
   - Overview of auth system
   - API endpoints with payloads
   - Authentication functions
   - Pages & components
   - Authentication flows
   - Token management
   - Error handling
   - State management

2. **[AUTH_FLOW_DIAGRAMS.md](./AUTH_FLOW_DIAGRAMS.md)** - Visual flow diagrams
   - System overview diagram
   - Email/password login flow
   - Registration & OTP flow
   - Google OAuth flow
   - Password reset flow
   - Token auto-refresh flow
   - Session persistence flow
   - Logout flow
   - Error handling flow
   - Protected route flow

3. **[AUTH_API_REFERENCE.md](./AUTH_API_REFERENCE.md)** - Detailed API reference
   - All auth endpoints with full payloads
   - Success/error responses
   - Frontend implementation examples
   - Axios interceptors
   - Testing examples
   - Security best practices

4. **[AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md)** - Developer quick reference
   - Common auth operations
   - Code snippets
   - Common patterns
   - Role-based access examples
   - Troubleshooting guide

---

## Quick Start

### For New Developers

1. **Understand the System**:
   - Start with [AUTHENTICATION.md](./AUTHENTICATION.md) to understand the overall architecture
   - Review [AUTH_FLOW_DIAGRAMS.md](./AUTH_FLOW_DIAGRAMS.md) for visual understanding

2. **Implementation Guide**:
   - Use [AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md) for code examples
   - Refer to [AUTH_API_REFERENCE.md](./AUTH_API_REFERENCE.md) for API details

3. **Debugging**:
   - Check troubleshooting sections in each document
   - Review error handling patterns

### For Product Managers

- Read the "Overview" and "Authentication Flows" sections in [AUTHENTICATION.md](./AUTHENTICATION.md)
- Review [AUTH_FLOW_DIAGRAMS.md](./AUTH_FLOW_DIAGRAMS.md) for user journey understanding

---

## Authentication System Overview

### Supported Authentication Methods
- ✅ Email/Password Login
- ✅ OTP Email Verification
- ✅ Google OAuth 2.0 (Web & Mobile)
- 🚧 Apple Sign-In (Planned)
- 🚧 Instagram OAuth (Planned)

### Key Features
- JWT-based authentication
- Automatic token refresh
- Session persistence across page refreshes
- Role-based access control
- Password reset flow
- Protected routes
- Error handling with user-friendly messages

### Tech Stack
- **Frontend**: React 19, React Router DOM 7
- **State Management**: Context API + Redux Toolkit
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **Backend**: Node.js + Express + MongoDB

---

## File Structure

```
admin/
├── doc/                              # 📁 Documentation (You are here)
│   ├── README.md                     # This file
│   ├── AUTHENTICATION.md             # Complete auth guide
│   ├── AUTH_FLOW_DIAGRAMS.md         # Visual diagrams
│   ├── AUTH_API_REFERENCE.md         # API reference
│   └── AUTH_QUICK_REFERENCE.md       # Quick reference
│
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx           # 🔐 Main auth context
│   │
│   ├── pages/auth/
│   │   ├── Login.jsx                 # Login page
│   │   ├── OTPVerification.jsx       # OTP verification
│   │   ├── ForgotPassword.jsx        # Forgot password
│   │   ├── ResetPassword.jsx         # Reset password
│   │   └── GoogleCallback.jsx        # Google OAuth handler
│   │
│   ├── utils/
│   │   └── api.js                    # 🌐 API client & endpoints
│   │
│   └── store/
│       └── slices/authSlice.js       # 💾 Redux auth state
│
└── APP_SPEC.md                       # App specification
```

---

## Common Use Cases

### 1. Implementing Login Page
→ See [AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md#login-implementation)

### 2. Adding Google Sign-In
→ See [AUTH_API_REFERENCE.md](./AUTH_API_REFERENCE.md#google-oauth-implementation)

### 3. Protecting a Route
→ See [AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md#protected-route-example)

### 4. Checking User Permissions
→ See [AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md#role-based-access-examples)

### 5. Handling Auth Errors
→ See [AUTHENTICATION.md](./AUTHENTICATION.md#error-handling)

---

## API Endpoints Quick Reference

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Login | POST | `/auth/login` |
| Register | POST | `/auth/register` |
| Verify OTP | POST | `/auth/verify-otp` |
| Resend OTP | POST | `/auth/resend-otp` |
| Forgot Password | POST | `/auth/forgot-password` |
| Reset Password | POST | `/auth/reset-password/:token` |
| Get Current User | GET | `/auth/me` |
| Logout | POST | `/auth/logout` |
| Refresh Token | POST | `/auth/refresh` |
| Google OAuth Init | GET | `/auth/google` |
| Google Callback | POST | `/auth/google/callback` |
| Google Mobile | POST | `/auth/google/mobile` |
| Update Profile | PUT | `/users/profile` |
| Change Password | PUT | `/users/change-password` |

Full details: [AUTH_API_REFERENCE.md](./AUTH_API_REFERENCE.md)

---

## Auth Context Functions

```javascript
const {
  // State
  user,              // Current user object
  isAuthenticated,   // Boolean
  isLoading,         // Boolean
  error,             // String | null
  
  // Functions
  login,             // Login with email/password
  register,          // Register new user
  verifyOTP,         // Verify email OTP
  resendOTP,         // Resend OTP email
  forgotPassword,    // Request password reset
  resetPassword,     // Reset password with token
  updateProfile,     // Update user profile
  changePassword,    // Change password
  logout,            // Logout user
  initiateGoogleAuth,      // Start Google OAuth
  handleGoogleCallback,    // Handle OAuth callback
  googleAuthWithIdToken,   // Google auth with ID token
  clearError,        // Clear error state
} = useAuth()
```

Full details: [AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md)

---

## Authentication Flow Summary

### 1. Email/Password Login
```
User enters credentials → POST /auth/login → Receive tokens → Store tokens → Redirect to dashboard
```

### 2. Registration & OTP
```
User registers → POST /auth/register → Navigate to OTP page → User enters OTP → POST /auth/verify-otp → Receive tokens → Redirect to dashboard
```

### 3. Google OAuth
```
User clicks Google button → Redirect to Google → User grants permission → Redirect to callback → POST /auth/google/callback → Receive tokens → Redirect to dashboard
```

### 4. Password Reset
```
User clicks "Forgot Password" → POST /auth/forgot-password → User receives email → User clicks reset link → User enters new password → POST /auth/reset-password/:token → Redirect to login
```

Visual diagrams: [AUTH_FLOW_DIAGRAMS.md](./AUTH_FLOW_DIAGRAMS.md)

---

## Troubleshooting

### Common Issues

1. **"Invalid token" errors**
   - Check if token exists in localStorage
   - Try clearing localStorage and re-login
   - Verify backend is running

2. **Google OAuth not working**
   - Check `VITE_GOOGLE_CLIENT_ID` in `.env`
   - Verify redirect URI matches Google Console
   - Check backend Google OAuth config

3. **OTP not received**
   - Check backend email service configuration
   - Check spam folder
   - Use "Resend OTP" after 60 seconds

4. **Infinite redirect loop**
   - Check `isLoading` state becomes `false`
   - Verify token in localStorage
   - Check `/auth/me` endpoint response

Full troubleshooting: [AUTHENTICATION.md](./AUTHENTICATION.md#troubleshooting)

---

## Contributing

When updating authentication:

1. **Update Code**: Make changes to auth implementation
2. **Update Docs**: Update relevant documentation files
3. **Test Thoroughly**: Test all auth flows
4. **Update Version**: Update version number in docs

---

## Support

For questions or issues:
- Review documentation in this directory
- Check backend documentation in `server/docs/`
- Contact development team

---

## Related Documentation

### Other Admin App Docs
- [APP_SPEC.md](../APP_SPEC.md) - Application specification
- [GENERAL_FLOW.md](../../GENERAL_FLOW.md) - Overall system flow
- [PAYMENT_STATUS_FLOW.md](../PAYMENT_STATUS_FLOW.md) - Payment flows
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Implementation notes

### Backend Documentation
- `server/docs/BACKEND_SPEC.md` - Backend API specification
- `server/docs/GOOGLE_OAUTH_SETUP.md` - Google OAuth setup guide
- `server/docs/TEST_USER_ROLES.md` - User roles & permissions

---

**Last Updated**: October 14, 2025  
**Documentation Version**: 1.0.0  
**App Version**: 0.0.0  
**Maintained By**: TEO KICKS Development Team

