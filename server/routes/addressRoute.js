import express from "express"
import { 
    getUserAddresses, 
    getAddressById, 
    createAddress, 
    updateAddress, 
    deleteAddress,
    setDefaultAddress, 
    getDefaultAddress, 
    getAllAddresses 
} from "../controllers/addressController.js"
import { verifyBearerToken, requireAdmin } from "../utils/verify.js"


const router = express.Router()


// Protected routes - require authentication
router.use(verifyBearerToken)


/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all user addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     addresses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Address'
 *                     count:
 *                       type: number
 *                       description: Total number of addresses
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// User address routes
router.get('/', getUserAddresses)

router.get('/default', getDefaultAddress)

router.get('/:addressId', getAddressById)

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Create new address (new schema)
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - coordinates
 *               - regions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Place name
 *                 example: "Red Diamonds Ruaraka"
 *               address:
 *                 type: string
 *                 description: Full formatted address
 *                 example: "QV2C+CVW, Nairobi, Kenya"
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: -1.2490251
 *                   lng:
 *                     type: number
 *                     example: 36.8721826
 *               regions:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "Kenya"
 *                   locality:
 *                     type: string
 *                     example: "Nairobi"
 *                   sublocality:
 *                     type: string
 *                     example: "Ruaraka"
 *                   sublocality_level_1:
 *                     type: string
 *                     example: "Ruaraka"
 *                   administrative_area_level_1:
 *                     type: string
 *                     example: "Nairobi County"
 *                   plus_code:
 *                     type: string
 *                     example: "QV2C+CVW"
 *                   political:
 *                     type: string
 *                     example: "Kenya"
 *               details:
 *                 type: string
 *                 description: User notes
 *                 example: "Near gate B"
 *               isDefault:
 *                 type: boolean
 *                 description: Set as default address
 *                 example: false
 *     responses:
 *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Address created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     address:
 *                       $ref: '#/components/schemas/Address'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createAddress)

router.put('/:addressId', updateAddress)

router.put('/:addressId/default', setDefaultAddress)

router.delete('/:addressId', deleteAddress)


// Admin routes
router.get('/admin/all', requireAdmin, getAllAddresses)


export default router