import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import validator from "validator"
import crypto from "crypto"
import { errorHandler } from "../utils/error.js"


// Helper function to generate JWT tokens
const generateTokens = (userId) => {

    const accessToken = jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    )

    const refreshToken = jwt.sign(
        { userId }, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
        { expiresIn: '7d' }
    )

    return { accessToken, refreshToken }

}


// Helper function to generate OTP
const generateOTP = () => {

    return Math.floor(100000 + Math.random() * 900000).toString()

}


// Helper function to send OTP (placeholder - implement with actual SMS/Email service)
const sendOTP = async (contact, otp, method = 'email') => {

    // TODO: Implement actual SMS/Email sending
    console.log(`Sending OTP ${otp} to ${contact} via ${method}`)

    // Return success for now
    return { success: true }

}


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {

    try {

        const { name, email, phone, password } = req.body

        // Validation
        if (!name || !email || !phone || !password) {

            return next(errorHandler(400, "All fields are required"))

        }

        // Validate email format
        if (!validator.isEmail(email)) {

            return next(errorHandler(400, "Please provide a valid email"))

        }

        // Validate phone format (basic validation)
        if (!validator.isMobilePhone(phone)) {

            return next(errorHandler(400, "Please provide a valid phone number"))

        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        })

        if (existingUser) {

            return next(errorHandler(400, "User already exists with this email or phone"))

        }

        // Hash password
        const saltRounds = 12

        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // Generate OTP
        const otp = generateOTP()

        const otpExpiry = new Date(Date.now() + (parseInt(process.env.OTP_EXP_MINUTES) || 10) * 60 * 1000)

        // Create user
        const user = new User({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            otpCode: otp,
            otpExpiry,
            isVerified: false
        })

        await user.save()

        // Send OTP
        await sendOTP(email, otp, 'email')

        res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email with the OTP sent.",
            data: {
                userId: user._id,
                email: user.email,
                phone: user.phone,
                isVerified: user.isVerified
            }
        })

    } catch (error) {

        console.error('Register error:', error)

        next(errorHandler(500, "Server error during registration"))

    }

}


// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {

    try {

        const { email, phone, otp } = req.body

        if (!otp) {

            return next(errorHandler(400, "OTP is required"))

        }

        if (!email && !phone) {

            return next(errorHandler(400, "Email or phone is required"))

        }

        // Find user by email or phone
        const query = email ? { email: email.toLowerCase() } : { phone }

        const user = await User.findOne(query)

        if (!user) {

            return next(errorHandler(404, "User not found"))

        }

        // Check if OTP is valid and not expired
        if (user.otpCode !== otp || user.otpExpiry < new Date()) {

            return next(errorHandler(400, "Invalid or expired OTP"))

        }

        // Update user verification status
        user.isVerified = true

        user.otpCode = undefined

        user.otpExpiry = undefined

        await user.save()

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id)

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    isVerified: user.isVerified,
                    roles: user.roles
                },
                accessToken,
                refreshToken
            }
        })

    } catch (error) {

        console.error('Verify OTP error:', error)

        next(errorHandler(500, "Server error during OTP verification"))

    }

}


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {

    try {

        const { email, phone, password } = req.body

        if (!password) {

            return next(errorHandler(400, "Password is required"))

        }

        if (!email && !phone) {

            return next(errorHandler(400, "Email or phone is required"))

        }

        // Find user by email or phone
        const query = email ? { email: email.toLowerCase() } : { phone }

        const user = await User.findOne(query)

        if (!user) {

            return next(errorHandler(401, "Invalid credentials"))

        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {

            return next(errorHandler(401, "Invalid credentials"))

        }

        // Check if user is verified
        if (!user.isVerified) {

            return next(errorHandler(403, "Please verify your email before logging in"))

        }

        // Check if user is active
        if (!user.isActive) {

            return next(errorHandler(403, "Account is deactivated. Please contact support."))

        }

        // Update last login
        user.lastLoginAt = new Date()

        await user.save()

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id)

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    roles: user.roles,
                    isVerified: user.isVerified
                },
                accessToken,
                refreshToken
            }
        })

    } catch (error) {

        console.error('Login error:', error)

        next(errorHandler(500, "Server error during login"))

    }

}


// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {

    try {

        const { refreshToken } = req.body



        if (!refreshToken) {

            return next(errorHandler(400, "Refresh token is required"))

        }


        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)

        

        // Check if user still exists
        const user = await User.findById(decoded.userId)

        if (!user || !user.isActive) {

            return next(errorHandler(403, "User not found or inactive"))

        }



        // Generate new tokens
        const tokens = generateTokens(user._id)



        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: tokens
        })

    } catch (error) {

        console.error('Refresh token error:', error)

        next(errorHandler(403, "Invalid refresh token"))

    }

}


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {

    try {

        const { email } = req.body



        if (!email) {

            return next(errorHandler(400, "Email is required"))

        }



        const user = await User.findOne({ email: email.toLowerCase() })



        if (!user) {

            return next(errorHandler(404, "No user found with this email"))

        }



        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')

        const resetExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes



        user.resetPasswordToken = resetToken

        user.resetPasswordExpiry = resetExpiry

        await user.save()



        // TODO: Send reset email with token
        console.log(`Password reset token for ${email}: ${resetToken}`)



        res.status(200).json({
            success: true,
            message: "Password reset instructions sent to your email"
        })

    } catch (error) {

        console.error('Forgot password error:', error)

        next(errorHandler(500, "Server error during password reset request"))

    }

}


// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {

    try {

        const { token, newPassword } = req.body



        if (!token || !newPassword) {

            return next(errorHandler(400, "Token and new password are required"))

        }



        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: new Date() }
        })



        if (!user) {

            return next(errorHandler(400, "Invalid or expired reset token"))

        }



        // Hash new password
        const saltRounds = 12

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)



        // Update user password and clear reset fields
        user.password = hashedPassword

        user.resetPasswordToken = undefined

        user.resetPasswordExpiry = undefined

        await user.save()



        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        })

    } catch (error) {

        console.error('Reset password error:', error)

        next(errorHandler(500, "Server error during password reset"))

    }

}


// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {

    try {

        // In a production app, you might want to blacklist the token
        // For now, we'll just send a success response
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })

    } catch (error) {

        console.error('Logout error:', error)

        next(errorHandler(500, "Server error during logout"))

    }

}


// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {

    try {

        const user = await User.findById(req.user.userId).select('-password -otpCode -resetPasswordToken')


        if (!user) {

            return next(errorHandler(404, "User not found"))

        }



        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    roles: user.roles,
                    isVerified: user.isVerified,
                    addresses: user.addresses,
                    notificationPreferences: user.notificationPreferences,
                    country: user.country,
                    timezone: user.timezone,
                    lastLoginAt: user.lastLoginAt
                }
            }
        })

    } catch (error) {

        console.error('Get me error:', error)

        next(errorHandler(500, "Server error while fetching user profile"))

    }

}