# Authentication Flow Diagrams

This document provides visual representations of the authentication flows in the TEO KICKS Admin application.

---

## 1. Complete Authentication System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TEO KICKS ADMIN AUTH SYSTEM                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────────┐ ┌─────────┐ ┌──────────────┐
            │Email/Password│ │  OAuth  │ │   Password   │
            │    Login     │ │  Login  │ │    Reset     │
            └──────────────┘ └─────────┘ └──────────────┘
                    │             │             │
                    ├─────────────┼─────────────┤
                    │             │             │
                    ▼             ▼             ▼
            ┌─────────────────────────────────────────┐
            │        AuthContext (State Manager)      │
            ├─────────────────────────────────────────┤
            │  • login()       • googleAuth()         │
            │  • register()    • updateProfile()      │
            │  • verifyOTP()   • changePassword()     │
            │  • logout()      • resetPassword()      │
            └─────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌─────────────┐ ┌──────────┐ ┌─────────────┐
            │ localStorage│ │  Redux   │ │   Axios     │
            │   Tokens    │ │  Store   │ │Interceptors │
            └─────────────┘ └──────────┘ └─────────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │  Protected App   │
                        │  (Dashboard, etc)│
                        └──────────────────┘
```

---

## 2. Email/Password Login Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                                  │
└─────────────────────────────────────────────────────────────────────┘

   USER                 FRONTEND              API              DATABASE
    │                      │                   │                   │
    │  1. Enter Email      │                   │                   │
    │     & Password       │                   │                   │
    ├─────────────────────>│                   │                   │
    │                      │                   │                   │
    │  2. Click Login      │                   │                   │
    ├─────────────────────>│                   │                   │
    │                      │                   │                   │
    │                      │ 3. POST /auth/    │                   │
    │                      │    login          │                   │
    │                      ├──────────────────>│                   │
    │                      │                   │                   │
    │                      │                   │ 4. Query user     │
    │                      │                   ├──────────────────>│
    │                      │                   │                   │
    │                      │                   │ 5. User data      │
    │                      │                   │<──────────────────┤
    │                      │                   │                   │
    │                      │                   │ 6. Verify password│
    │                      │                   │                   │
    │                      │                   │ 7. Generate tokens│
    │                      │                   │                   │
    │                      │ 8. Return tokens  │                   │
    │                      │    & user         │                   │
    │                      │<──────────────────┤                   │
    │                      │                   │                   │
    │                      │ 9. Store tokens   │                   │
    │                      │    in localStorage│                   │
    │                      │                   │                   │
    │                      │ 10. Update Redux  │                   │
    │                      │     & Context     │                   │
    │                      │                   │                   │
    │ 11. Success toast    │                   │                   │
    │<─────────────────────┤                   │                   │
    │                      │                   │                   │
    │ 12. Redirect to      │                   │                   │
    │     Dashboard        │                   │                   │
    │<─────────────────────┤                   │                   │
    │                      │                   │                   │
```

---

## 3. Registration & OTP Verification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   REGISTRATION & OTP FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

   USER                 FRONTEND              API              EMAIL SERVICE
    │                      │                   │                   │
    │  1. Fill form        │                   │                   │
    │  (name, email,       │                   │                   │
    │   phone, password)   │                   │                   │
    ├─────────────────────>│                   │                   │
    │                      │                   │                   │
    │  2. Submit           │                   │                   │
    ├─────────────────────>│                   │                   │
    │                      │                   │                   │
    │                      │ 3. POST /auth/    │                   │
    │                      │    register       │                   │
    │                      ├──────────────────>│                   │
    │                      │                   │                   │
    │                      │                   │ 4. Create user    │
    │                      │                   │    (isVerified=   │
    │                      │                   │     false)        │
    │                      │                   │                   │
    │                      │                   │ 5. Generate OTP   │
    │                      │                   │    (6 digits)     │
    │                      │                   │                   │
    │                      │                   │ 6. Send OTP email │
    │                      │                   ├──────────────────>│
    │                      │                   │                   │
    │                      │ 7. Success msg    │                   │
    │                      │<──────────────────┤                   │
    │                      │                   │                   │
    │  8. Navigate to      │                   │                   │
    │     /otp-verification│                   │                   │
    │<─────────────────────┤                   │                   │
    │                      │                   │                   │
    │  9. Receive OTP      │                   │                   │
    │     email            │<───────────────────────────────────────┤
    │                      │                   │                   │
    │ 10. Enter 6-digit    │                   │                   │
    │     OTP              │                   │                   │
    ├─────────────────────>│                   │                   │
    │                      │                   │                   │
    │ 11. Submit OTP       │                   │                   │
    ├─────────────────────>│                   │                   │
    │                      │                   │                   │
    │                      │ 12. POST /auth/   │                   │
    │                      │     verify-otp    │                   │
    │                      ├──────────────────>│                   │
    │                      │                   │                   │
    │                      │                   │ 13. Verify OTP    │
    │                      │                   │                   │
    │                      │                   │ 14. Update user   │
    │                      │                   │     (isVerified=  │
    │                      │                   │      true)        │
    │                      │                   │                   │
    │                      │                   │ 15. Generate      │
    │                      │                   │     tokens        │
    │                      │                   │                   │
    │                      │ 16. Return tokens │                   │
    │                      │     & user        │                   │
    │                      │<──────────────────┤                   │
    │                      │                   │                   │
    │                      │ 17. Store tokens  │                   │
    │                      │                   │                   │
    │ 18. Redirect to      │                   │                   │
    │     Dashboard        │                   │                   │
    │<─────────────────────┤                   │                   │
    │                      │                   │                   │
```

---

## 4. Google OAuth Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GOOGLE OAUTH FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

   USER            FRONTEND         API        GOOGLE OAUTH        DATABASE
    │                 │              │               │                 │
    │  1. Click       │              │               │                 │
    │     "Login      │              │               │                 │
    │      with       │              │               │                 │
    │      Google"    │              │               │                 │
    ├────────────────>│              │               │                 │
    │                 │              │               │                 │
    │                 │ 2. GET       │               │                 │
    │                 │    /auth/    │               │                 │
    │                 │    google    │               │                 │
    │                 ├─────────────>│               │                 │
    │                 │              │               │                 │
    │                 │ 3. Return    │               │                 │
    │                 │    authUrl   │               │                 │
    │                 │<─────────────┤               │                 │
    │                 │              │               │                 │
    │  4. Redirect to │              │               │                 │
    │     Google      │              │               │                 │
    │     consent     │              │               │                 │
    │<────────────────┤──────────────────────────────>│                 │
    │                 │              │               │                 │
    │  5. User grants │              │               │                 │
    │     permission  │              │               │                 │
    ├──────────────────────────────────────────────>│                 │
    │                 │              │               │                 │
    │  6. Google      │              │               │                 │
    │     redirects   │              │               │                 │
    │     to callback │              │               │                 │
    │<────────────────────────────────────────────────┤                 │
    │                 │              │               │                 │
    │  7. /auth/google│              │               │                 │
    │     /callback?  │              │               │                 │
    │     code=xxx    │              │               │                 │
    ├────────────────>│              │               │                 │
    │                 │              │               │                 │
    │                 │ 8. POST      │               │                 │
    │                 │    /auth/    │               │                 │
    │                 │    google/   │               │                 │
    │                 │    callback  │               │                 │
    │                 │    {code}    │               │                 │
    │                 ├─────────────>│               │                 │
    │                 │              │               │                 │
    │                 │              │ 9. Exchange   │                 │
    │                 │              │    code for   │                 │
    │                 │              │    tokens     │                 │
    │                 │              ├──────────────>│                 │
    │                 │              │               │                 │
    │                 │              │10. Return     │                 │
    │                 │              │   user info   │                 │
    │                 │              │<──────────────┤                 │
    │                 │              │               │                 │
    │                 │              │11. Find/Create│                 │
    │                 │              │   user        │                 │
    │                 │              ├──────────────────────────────>│
    │                 │              │               │                 │
    │                 │              │12. User data  │                 │
    │                 │              │<──────────────────────────────┤
    │                 │              │               │                 │
    │                 │              │13. Generate   │                 │
    │                 │              │   tokens      │                 │
    │                 │              │               │                 │
    │                 │14. Return    │               │                 │
    │                 │   tokens &   │               │                 │
    │                 │   user       │               │                 │
    │                 │<─────────────┤               │                 │
    │                 │              │               │                 │
    │                 │15. Store     │               │                 │
    │                 │   tokens     │               │                 │
    │                 │              │               │                 │
    │16. Redirect to  │              │               │                 │
    │    Dashboard    │              │               │                 │
    │<────────────────┤              │               │                 │
    │                 │              │               │                 │
```

---

## 5. Password Reset Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PASSWORD RESET FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

   USER            FRONTEND         API         EMAIL SERVICE      DATABASE
    │                 │              │               │                 │
    │  1. Click       │              │               │                 │
    │     "Forgot     │              │               │                 │
    │     Password"   │              │               │                 │
    ├────────────────>│              │               │                 │
    │                 │              │               │                 │
    │  2. Navigate to │              │               │                 │
    │     /forgot-    │              │               │                 │
    │     password    │              │               │                 │
    │<────────────────┤              │               │                 │
    │                 │              │               │                 │
    │  3. Enter email │              │               │                 │
    ├────────────────>│              │               │                 │
    │                 │              │               │                 │
    │  4. Submit form │              │               │                 │
    ├────────────────>│              │               │                 │
    │                 │              │               │                 │
    │                 │ 5. POST      │               │                 │
    │                 │    /auth/    │               │                 │
    │                 │    forgot-   │               │                 │
    │                 │    password  │               │                 │
    │                 ├─────────────>│               │                 │
    │                 │              │               │                 │
    │                 │              │ 6. Find user  │                 │
    │                 │              ├──────────────────────────────>│
    │                 │              │               │                 │
    │                 │              │ 7. User data  │                 │
    │                 │              │<──────────────────────────────┤
    │                 │              │               │                 │
    │                 │              │ 8. Generate   │                 │
    │                 │              │    reset      │                 │
    │                 │              │    token      │                 │
    │                 │              │               │                 │
    │                 │              │ 9. Save token │                 │
    │                 │              ├──────────────────────────────>│
    │                 │              │               │                 │
    │                 │              │10. Send reset │                 │
    │                 │              │   email with  │                 │
    │                 │              │   link        │                 │
    │                 │              ├──────────────>│                 │
    │                 │              │               │                 │
    │                 │11. Success   │               │                 │
    │                 │   message    │               │                 │
    │                 │<─────────────┤               │                 │
    │                 │              │               │                 │
    │ 12. Check email │              │               │                 │
    │<────────────────────────────────────────────────┤                 │
    │                 │              │               │                 │
    │ 13. Click reset │              │               │                 │
    │     link        │              │               │                 │
    │     /reset-     │              │               │                 │
    │     password/   │              │               │                 │
    │     {token}     │              │               │                 │
    ├────────────────>│              │               │                 │
    │                 │              │               │                 │
    │ 14. Enter new   │              │               │                 │
    │     password    │              │               │                 │
    ├────────────────>│              │               │                 │
    │                 │              │               │                 │
    │ 15. Submit form │              │               │                 │
    ├────────────────>│              │               │                 │
    │                 │              │               │                 │
    │                 │16. POST      │               │                 │
    │                 │   /auth/     │               │                 │
    │                 │   reset-     │               │                 │
    │                 │   password/  │               │                 │
    │                 │   {token}    │               │                 │
    │                 ├─────────────>│               │                 │
    │                 │              │               │                 │
    │                 │              │17. Verify     │                 │
    │                 │              │   token       │                 │
    │                 │              ├──────────────────────────────>│
    │                 │              │               │                 │
    │                 │              │18. Update     │                 │
    │                 │              │   password    │                 │
    │                 │              ├──────────────────────────────>│
    │                 │              │               │                 │
    │                 │              │19. Delete     │                 │
    │                 │              │   token       │                 │
    │                 │              ├──────────────────────────────>│
    │                 │              │               │                 │
    │                 │20. Success   │               │                 │
    │                 │   response   │               │                 │
    │                 │<─────────────┤               │                 │
    │                 │              │               │                 │
    │ 21. Redirect to │              │               │                 │
    │     Login       │              │               │                 │
    │<────────────────┤              │               │                 │
    │                 │              │               │                 │
```

---

## 6. Token Auto-Refresh Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOKEN AUTO-REFRESH FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

   USER            FRONTEND              API              DATABASE
    │                 │                   │                   │
    │  1. User makes  │                   │                   │
    │     API request │                   │                   │
    │     (e.g., get  │                   │                   │
    │     products)   │                   │                   │
    ├────────────────>│                   │                   │
    │                 │                   │                   │
    │                 │ 2. Add Bearer     │                   │
    │                 │    token header   │                   │
    │                 │                   │                   │
    │                 │ 3. GET /products  │                   │
    │                 ├──────────────────>│                   │
    │                 │                   │                   │
    │                 │                   │ 4. Verify token   │
    │                 │                   │                   │
    │                 │                   │ 5. Token expired! │
    │                 │                   │                   │
    │                 │ 6. 401           │                   │
    │                 │    Unauthorized   │                   │
    │                 │<──────────────────┤                   │
    │                 │                   │                   │
    │                 │ 7. Interceptor    │                   │
    │                 │    catches 401    │                   │
    │                 │                   │                   │
    │                 │ 8. POST /auth/    │                   │
    │                 │    refresh        │                   │
    │                 │    {refreshToken} │                   │
    │                 ├──────────────────>│                   │
    │                 │                   │                   │
    │                 │                   │ 9. Verify refresh │
    │                 │                   │    token          │
    │                 │                   │                   │
    │                 │                   │10. Generate new   │
    │                 │                   │   access token    │
    │                 │                   │                   │
    │                 │11. New access     │                   │
    │                 │   token           │                   │
    │                 │<──────────────────┤                   │
    │                 │                   │                   │
    │                 │12. Store new      │                   │
    │                 │   access token    │                   │
    │                 │                   │                   │
    │                 │13. Retry original │                   │
    │                 │   request with    │                   │
    │                 │   new token       │                   │
    │                 ├──────────────────>│                   │
    │                 │                   │                   │
    │                 │                   │14. Verify new     │
    │                 │                   │   token           │
    │                 │                   │                   │
    │                 │                   │15. Process        │
    │                 │                   │   request         │
    │                 │                   ├──────────────────>│
    │                 │                   │                   │
    │                 │                   │16. Products data  │
    │                 │                   │<──────────────────┤
    │                 │                   │                   │
    │                 │17. Return data    │                   │
    │                 │<──────────────────┤                   │
    │                 │                   │                   │
    │ 18. Display     │                   │                   │
    │     products    │                   │                   │
    │<────────────────┤                   │                   │
    │                 │                   │                   │
```

---

## 7. Session Persistence Flow (Page Refresh)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SESSION PERSISTENCE FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

   USER            FRONTEND          localStorage        API
    │                 │                   │               │
    │  1. Page        │                   │               │
    │     refresh     │                   │               │
    ├────────────────>│                   │               │
    │                 │                   │               │
    │                 │ 2. App loads      │               │
    │                 │    useEffect runs │               │
    │                 │                   │               │
    │                 │ 3. Check for      │               │
    │                 │    tokens         │               │
    │                 ├──────────────────>│               │
    │                 │                   │               │
    │                 │ 4. Get tokens &   │               │
    │                 │    user data      │               │
    │                 │<──────────────────┤               │
    │                 │                   │               │
    │                 │ 5. Rehydrate      │               │
    │                 │    Context &      │               │
    │                 │    Redux state    │               │
    │                 │                   │               │
    │                 │ 6. Set isLoading  │               │
    │                 │    = false        │               │
    │                 │                   │               │
    │  7. Show UI     │                   │               │
    │     with user   │                   │               │
    │     logged in   │                   │               │
    │<────────────────┤                   │               │
    │                 │                   │               │
    │                 │ 8. Background:    │               │
    │                 │    GET /auth/me   │               │
    │                 │    to validate    │               │
    │                 ├──────────────────────────────────>│
    │                 │                   │               │
    │                 │                   │ 9. Verify     │
    │                 │                   │    token      │
    │                 │                   │               │
    │                 │10. Return latest  │               │
    │                 │   user data       │               │
    │                 │<──────────────────────────────────┤
    │                 │                   │               │
    │                 │11. Update user    │               │
    │                 │   in storage &    │               │
    │                 │   state           │               │
    │                 ├──────────────────>│               │
    │                 │                   │               │
    │                 │                   │               │
    │  (If token expired, auto-refresh    │               │
    │   kicks in via interceptor)         │               │
    │                 │                   │               │
```

---

## 8. Logout Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          LOGOUT FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

   USER            FRONTEND          localStorage        API      DATABASE
    │                 │                   │               │           │
    │  1. Click       │                   │               │           │
    │     Logout      │                   │               │           │
    ├────────────────>│                   │               │           │
    │                 │                   │               │           │
    │                 │ 2. POST /auth/    │               │           │
    │                 │    logout         │               │           │
    │                 ├──────────────────────────────────>│           │
    │                 │                   │               │           │
    │                 │                   │               │ 3. Mark   │
    │                 │                   │               │    refresh│
    │                 │                   │               │    token  │
    │                 │                   │               │    invalid│
    │                 │                   │               ├──────────>│
    │                 │                   │               │           │
    │                 │ 4. Success        │               │           │
    │                 │<──────────────────────────────────┤           │
    │                 │                   │               │           │
    │                 │ 5. Clear all      │               │           │
    │                 │    localStorage   │               │           │
    │                 ├──────────────────>│               │           │
    │                 │                   │               │           │
    │                 │ 6. Clear Context  │               │           │
    │                 │    state          │               │           │
    │                 │                   │               │           │
    │                 │ 7. Clear Redux    │               │           │
    │                 │    state          │               │           │
    │                 │                   │               │           │
    │  8. Success     │                   │               │           │
    │     toast       │                   │               │           │
    │<────────────────┤                   │               │           │
    │                 │                   │               │           │
    │  9. Redirect to │                   │               │           │
    │     /login      │                   │               │           │
    │<────────────────┤                   │               │           │
    │                 │                   │               │           │
```

---

## 9. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ERROR HANDLING FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

   API CALL                   RESPONSE                    FRONTEND
      │                          │                            │
      │                          │                            │
      ├─────────────────────────>│                            │
      │                          │                            │
      │                          ▼                            │
      │                   ┌──────────────┐                   │
      │                   │  HTTP Status │                   │
      │                   │     Code     │                   │
      │                   └──────────────┘                   │
      │                          │                            │
      │                          │                            │
      │              ┌───────────┼───────────┬──────────┐    │
      │              │           │           │          │    │
      │              ▼           ▼           ▼          ▼    │
      │          ┌─────┐     ┌─────┐    ┌─────┐    ┌─────┐  │
      │          │ 200 │     │ 400 │    │ 401 │    │ 500 │  │
      │          │ OK  │     │ Bad │    │Auth │    │Error│  │
      │          └─────┘     └─────┘    └─────┘    └─────┘  │
      │              │           │           │          │    │
      │              │           │           │          │    │
      │              ▼           ▼           ▼          ▼    │
      │          ┌─────────┐ ┌─────────┐ ┌────────┐ ┌──────┐│
      │          │Success  │ │Validation│ │Trigger │ │Show  ││
      │          │Response │ │ Error    │ │Refresh │ │Error ││
      │          │         │ │          │ │  Flow  │ │Toast ││
      │          └─────────┘ └─────────┘ └────────┘ └──────┘│
      │              │           │           │          │    │
      │              │           │           │          │    │
      │              ▼           ▼           ▼          ▼    │
      │          ┌──────────────────────────────────────────┐│
      │          │         Update UI Accordingly            ││
      │          └──────────────────────────────────────────┘│
      │                                                       │
```

---

## 10. Protected Route Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PROTECTED ROUTE FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

   USER              REACT ROUTER           AUTH CONTEXT
    │                      │                       │
    │  1. Navigate to      │                       │
    │     /dashboard       │                       │
    ├─────────────────────>│                       │
    │                      │                       │
    │                      │ 2. Check auth state   │
    │                      ├──────────────────────>│
    │                      │                       │
    │                      │ 3. isLoading?         │
    │                      │<──────────────────────┤
    │                      │                       │
    │                      ▼                       │
    │              ┌───────────────┐              │
    │              │  isLoading?   │              │
    │              └───────────────┘              │
    │                      │                       │
    │              ┌───────┴───────┐              │
    │              │               │              │
    │              ▼               ▼              │
    │          ┌──────┐       ┌──────────┐       │
    │          │ YES  │       │    NO    │       │
    │          └──────┘       └──────────┘       │
    │              │               │              │
    │              ▼               ▼              │
    │      ┌─────────────┐  ┌──────────────┐    │
    │      │Show Loading │  │isAuthenticated│    │
    │      │  Spinner    │  │     ?        │    │
    │      └─────────────┘  └──────────────┘    │
    │              │               │              │
    │              │       ┌───────┴───────┐      │
    │              │       │               │      │
    │              │       ▼               ▼      │
    │              │   ┌──────┐       ┌──────┐   │
    │              │   │ YES  │       │  NO  │   │
    │              │   └──────┘       └──────┘   │
    │              │       │               │      │
    │              │       ▼               ▼      │
    │              │   ┌─────────┐   ┌─────────┐ │
    │              │   │  Render │   │Redirect │ │
    │              │   │Protected│   │   to    │ │
    │              │   │Component│   │ /login  │ │
    │              │   └─────────┘   └─────────┘ │
    │              │       │               │      │
    │              ▼       ▼               ▼      │
    │<─────────────────────────────────────────────
    │         User sees appropriate screen
    │
```

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0  
**Maintained By**: TEO KICKS Development Team

