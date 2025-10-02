import express from "express"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.js"
import { 
  createOrder, 
  getOrderById, 
  updateOrderStatus, 
  assignRider, 
  getOrders, 
  deleteOrder,
  // New admin functions
  createAdminOrder,
  getAllOrders,
  getOrderStats,
  convertGuestToRegistered
} from "../controllers/orderController.js"


const router = express.Router()


// Existing customer routes
router.post('/', authenticateToken, createOrder)
router.get('/', authenticateToken, getOrders)
router.get('/:id', authenticateToken, getOrderById)
router.patch('/:id/status', authenticateToken, updateOrderStatus)
router.patch('/:id/assign-rider', authenticateToken, assignRider)
router.delete('/:id', authenticateToken, deleteOrder)

// New admin routes (require admin/staff role)
router.post('/admin/create', authenticateToken, authorizeRoles(['admin', 'staff', 'manager']), createAdminOrder)
router.get('/admin/all', authenticateToken, authorizeRoles(['admin', 'staff', 'manager']), getAllOrders)
router.get('/admin/stats', authenticateToken, authorizeRoles(['admin', 'staff', 'manager']), getOrderStats)
router.post('/admin/convert-guest', authenticateToken, authorizeRoles(['admin', 'staff', 'manager']), convertGuestToRegistered)


export default router

