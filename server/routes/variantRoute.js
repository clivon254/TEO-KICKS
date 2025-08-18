import express from "express"

import { authenticateToken, authorizeRoles } from "../middlewares/auth.js"

import {

    createVariant,

    getAllVariants,

    getVariantById,

    updateVariant,

    deleteVariant,

    addOption,

    updateOption,

    removeOption,

    getActiveVariants

} from "../controllers/variantController.js"





const router = express.Router()





// Public routes
router.get("/active", getActiveVariants)

router.get("/:id", getVariantById)





// Protected routes (admin only)
router.use(authenticateToken)

router.use(authorizeRoles(["admin", "manager"]))





// Variant CRUD operations
router.post("/", createVariant)

router.get("/", getAllVariants)

router.put("/:id", updateVariant)

router.delete("/:id", deleteVariant)





// Option management
router.post("/:id/options", addOption)

router.put("/:id/options/:optionId", updateOption)

router.delete("/:id/options/:optionId", removeOption)





export default router 