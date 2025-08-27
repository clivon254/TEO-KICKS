import express from 'express'
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    applyCoupon,
    getCouponStats,
    generateNewCode
} from '../controllers/couponController.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'

const router = express.Router()

// Public routes
router.post('/validate', validateCoupon)

// Protected routes (require authentication)
router.use(authenticateToken)

// Apply coupon to order
router.post('/apply', applyCoupon)

// Admin routes (require admin role)
router.use(authorizeRoles(['admin']))

// CRUD operations
router.post('/', createCoupon)
router.get('/', getAllCoupons)
router.get('/stats', getCouponStats)
router.get('/:couponId', getCouponById)
router.put('/:couponId', updateCoupon)
router.delete('/:couponId', deleteCoupon)
router.patch('/:couponId/generate-code', generateNewCode)

export default router 