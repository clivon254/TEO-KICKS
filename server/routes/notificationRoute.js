import express from "express"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.js"
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    getAllNotifications,
    sendBroadcastNotification,
    getNotificationStats
} from "../controllers/notificationController.js"

const router = express.Router()


// User notification routes
router.get("/", authenticateToken, getUserNotifications)
router.get("/unread", authenticateToken, getUnreadCount)
router.put("/:id/read", authenticateToken, markAsRead)
router.put("/read-all", authenticateToken, markAllAsRead)
router.delete("/:id", authenticateToken, deleteNotification)
router.delete("/clear-read", authenticateToken, clearReadNotifications)


// Admin notification routes
router.get("/admin", authenticateToken, authorizeRoles(['admin', 'manager']), getAllNotifications)
router.post("/admin/broadcast", authenticateToken, authorizeRoles(['admin', 'manager']), sendBroadcastNotification)
router.get("/admin/stats", authenticateToken, authorizeRoles(['admin', 'manager']), getNotificationStats)


export default router
