import express from "express"

import { 
    register, 
    verifyOTP, 
    resendOTP,
    login, 
    refreshToken, 
    forgotPassword, 
    resetPassword, 
    logout, 
    getMe 
} from "../controllers/authController.js"



const router = express.Router()



// Public routes
router.post('/register', register)

router.post('/verify-otp', verifyOTP)

router.post('/resend-otp', resendOTP)

router.post('/login', login)

router.post('/refresh', refreshToken)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password', resetPassword)



// Protected routes (require authentication middleware)
// Note: Add auth middleware when created
router.post('/logout', logout)

router.get('/me', getMe)



export default router