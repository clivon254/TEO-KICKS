import express from "express"

import { authenticateToken, authorizeRoles } from "../middlewares/auth.js"

import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, generateSKUs, updateSKU, deleteSKU } from "../controllers/productController.js"





const router = express.Router()





// Public routes
router.get("/", getAllProducts)

router.get("/:id", getProductById)





// Protected routes (require authentication and admin/manager role)
router.post("/", authenticateToken, authorizeRoles(["admin", "manager"]), createProduct)

router.put("/:id", authenticateToken, authorizeRoles(["admin", "manager"]), updateProduct)

router.delete("/:id", authenticateToken, authorizeRoles(["admin", "manager"]), deleteProduct)





// SKU management routes
router.post("/:id/generate-skus", authenticateToken, authorizeRoles(["admin", "manager"]), generateSKUs)

router.patch("/:productId/skus/:skuId", authenticateToken, authorizeRoles(["admin", "manager"]), updateSKU)

router.delete("/:productId/skus/:skuId", authenticateToken, authorizeRoles(["admin", "manager"]), deleteSKU)





export default router 