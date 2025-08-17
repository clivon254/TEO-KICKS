import { errorHandler } from "./error.js"
import jwt from "jsonwebtoken"
import axios from "axios"


export const verifyToken = (req, res, next) => {

    const { token } = req.headers

    if (!token) {

        return next(errorHandler(403, "There is no token"))

    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) {

            return next(errorHandler(401, "Unauthorized, the token doesn't match"))

        }
        
        req.user = user

        next()
        
    })

}


// Alternative token verification from Authorization header (Bearer token)
export const verifyBearerToken = (req, res, next) => {

    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {

        return next(errorHandler(403, "Access token required"))

    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) {

            return next(errorHandler(401, "Invalid or expired token"))

        }
        
        req.user = user

        next()
        
    })

}


// Role-based authorization middleware
export const requireRole = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {

            return next(errorHandler(401, "Authentication required"))

        }

        // Admin users have access to all roles
        if (req.user.isAdmin) {

            return next()

        }

        // Check if user has any of the required roles (by role name)
        const hasRole = roles.some(role => req.user.roleNames?.includes(role))

        if (!hasRole) {

            return next(errorHandler(403, "Insufficient permissions"))

        }

        next()

    }

}


// Admin only middleware
export const requireAdmin = (req, res, next) => {

    if (!req.user) {

        return next(errorHandler(401, "Authentication required"))

    }

    if (!req.user.isAdmin) {

        return next(errorHandler(403, "Admin access required"))

    }

    next()

}


// Permission-based authorization middleware (simplified without specific permissions)
export const requirePermission = (...roleNames) => {

    return (req, res, next) => {

        if (!req.user) {

            return next(errorHandler(401, "Authentication required"))

        }

        // Admin users have all permissions
        if (req.user.isAdmin) {

            return next()

        }

        // Check if user has any of the required roles
        const hasRole = roleNames.some(roleName => req.user.roleNames?.includes(roleName))

        if (!hasRole) {

            return next(errorHandler(403, "Insufficient permissions"))

        }

        next()

    }

}


// M-Pesa token generation for Daraja API
export const generateMpesaToken = async (req, res, next) => {

    const consumerKey = process.env.DARaja_CONSUMER_KEY

    const consumerSecret = process.env.DARaja_CONSUMER_SECRET

    if (!consumerKey || !consumerSecret) {

        return next(errorHandler(500, "M-Pesa credentials not configured"))

    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

    try {

        const baseUrl = process.env.DARaja_ENV === 'production' 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke'

        const response = await axios.get(
            `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        )

        // Attach the token to the request object
        req.mpesaToken = response.data.access_token

        next()

    } catch (error) {

        console.error("Failed to generate M-Pesa token:", error.response ? error.response.data : error.message)

        return next(errorHandler(500, "Failed to generate M-Pesa token"))

    }

}


// Optional: User verification check
export const requireVerified = (req, res, next) => {

    if (!req.user) {

        return next(errorHandler(401, "Authentication required"))

    }

    if (!req.user.isVerified) {

        return next(errorHandler(403, "Account verification required"))

    }

    next()

}


// Optional: Active account check
export const requireActive = (req, res, next) => {

    if (!req.user) {

        return next(errorHandler(401, "Authentication required"))

    }

    if (!req.user.isActive) {

        return next(errorHandler(403, "Account is deactivated"))

    }

    next()

}
