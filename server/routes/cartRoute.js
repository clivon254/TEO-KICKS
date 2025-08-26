import express from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    validateCart
} from '../controllers/cartController.js'

const router = express.Router()

// All cart routes require authentication
router.use(authenticateToken)

// Get user's cart
router.get('/', getCart)

// Add item to cart
router.post('/add', addToCart)

// Update cart item quantity
router.put('/items/:skuId', updateCartItem)

// Remove item from cart
router.delete('/items/:skuId', removeFromCart)

// Clear cart
router.delete('/clear', clearCart)

// Validate cart (check stock availability)
router.get('/validate', validateCart)

export default router 