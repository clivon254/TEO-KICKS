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
 *     summary: Create new address (supports Google Places API data)
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
 *               - label
 *             properties:
 *               label:
 *                 type: string
 *                 description: Address label
 *                 example: "Home"
 *               street:
 *                 type: string
 *                 description: Street address
 *                 example: "123 Kimathi Street"
 *               city:
 *                 type: string
 *                 description: City name
 *                 example: "Nairobi"
 *               region:
 *                 type: string
 *                 description: Region/County
 *                 example: "Nairobi County"
 *               country:
 *                 type: string
 *                 description: Country name
 *                 example: "Kenya"
 *               postal:
 *                 type: string
 *                 description: Postal code
 *                 example: "00100"
 *               googlePlaceId:
 *                 type: string
 *                 description: Google Places API place ID
 *                 example: "ChIJN1t_tDeuEmsRUsoyG83frY4"
 *               formattedAddress:
 *                 type: string
 *                 description: Formatted address from Google Places
 *                 example: "123 Kimathi Street, Nairobi, Kenya"
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: -1.2920659
 *                   longitude:
 *                     type: number
 *                     example: 36.82194619999999
 *               locationDetails:
 *                 type: object
 *                 properties:
 *                   neighborhood:
 *                     type: string
 *                     example: "City Center"
 *                   sublocality:
 *                     type: string
 *                     example: "Nairobi Central"
 *                   administrativeArea:
 *                     type: string
 *                     example: "Nairobi County"
 *                   route:
 *                     type: string
 *                     example: "Kimathi Street"
 *                   streetNumber:
 *                     type: string
 *                     example: "123"
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