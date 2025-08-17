import Address from "../models/addressModel.js"
import User from "../models/userModel.js"
import { errorHandler } from "../utils/error.js"


// @desc    Get all user addresses
// @route   GET /api/addresses
// @access  Private
export const getUserAddresses = async (req, res, next) => {

    try {

        const addresses = await Address.find({ 
            userId: req.user.userId, 
            isActive: true 
        }).sort({ isDefault: -1, createdAt: -1 })

        res.status(200).json({
            success: true,
            data: {
                addresses: addresses,
                count: addresses.length
            }
        })

    } catch (error) {

        console.error('Get user addresses error:', error)

        next(errorHandler(500, "Server error while fetching addresses"))

    }

}


// @desc    Get single address
// @route   GET /api/addresses/:addressId
// @access  Private
export const getAddressById = async (req, res, next) => {

    try {

        const { addressId } = req.params

        const address = await Address.findOne({
            _id: addressId,
            userId: req.user.userId,
            isActive: true
        })

        if (!address) {

            return next(errorHandler(404, "Address not found"))

        }

        res.status(200).json({
            success: true,
            data: {
                address: address
            }
        })

    } catch (error) {

        console.error('Get address by ID error:', error)

        next(errorHandler(500, "Server error while fetching address"))

    }

}


// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
export const createAddress = async (req, res, next) => {

    try {

        const { 
            label, 
            street, 
            city, 
            region, 
            country, 
            postal, 
            isDefault,
            googlePlaceId,
            coordinates,
            formattedAddress,
            locationDetails
        } = req.body

        // Validation
        if (!label) {

            return next(errorHandler(400, "Address label is required"))

        }

        // Allow either traditional address fields OR formatted address from Google Places
        if (!formattedAddress && (!street || !city || !region)) {

            return next(errorHandler(400, "Either formatted address or street, city, and region are required"))

        }

        // Check if user exists
        const user = await User.findById(req.user.userId)

        if (!user) {

            return next(errorHandler(404, "User not found"))

        }

        // Create new address
        const newAddress = new Address({
            userId: req.user.userId,
            label: label.trim(),
            street: street?.trim(),
            city: city?.trim(),
            region: region?.trim(),
            country: country || "Kenya",
            postal: postal?.trim(),
            isDefault: isDefault || false,
            googlePlaceId: googlePlaceId?.trim(),
            coordinates: coordinates && coordinates.latitude && coordinates.longitude ? {
                latitude: parseFloat(coordinates.latitude),
                longitude: parseFloat(coordinates.longitude)
            } : undefined,
            formattedAddress: formattedAddress?.trim(),
            locationDetails: locationDetails ? {
                neighborhood: locationDetails.neighborhood?.trim(),
                sublocality: locationDetails.sublocality?.trim(),
                administrativeArea: locationDetails.administrativeArea?.trim(),
                route: locationDetails.route?.trim(),
                streetNumber: locationDetails.streetNumber?.trim()
            } : undefined
        })

        await newAddress.save()

        res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: {
                address: newAddress
            }
        })

    } catch (error) {

        console.error('Create address error:', error)

        if (error.name === 'ValidationError') {

            const message = Object.values(error.errors).map(err => err.message).join(', ')

            return next(errorHandler(400, message))

        }

        next(errorHandler(500, "Server error while creating address"))

    }

}


// @desc    Update address
// @route   PUT /api/addresses/:addressId
// @access  Private
export const updateAddress = async (req, res, next) => {

    try {

        const { addressId } = req.params

        const { 
            label, 
            street, 
            city, 
            region, 
            country, 
            postal, 
            isDefault,
            googlePlaceId,
            coordinates,
            formattedAddress,
            locationDetails
        } = req.body

        const address = await Address.findOne({
            _id: addressId,
            userId: req.user.userId,
            isActive: true
        })

        if (!address) {

            return next(errorHandler(404, "Address not found"))

        }

        // Update fields if provided
        if (label) address.label = label.trim()

        if (street) address.street = street.trim()

        if (city) address.city = city.trim()

        if (region) address.region = region.trim()

        if (country) address.country = country.trim()

        if (postal !== undefined) address.postal = postal?.trim()

        if (isDefault !== undefined) address.isDefault = isDefault

        if (googlePlaceId) address.googlePlaceId = googlePlaceId.trim()

        if (coordinates && coordinates.latitude && coordinates.longitude) {
            address.coordinates = {
                latitude: parseFloat(coordinates.latitude),
                longitude: parseFloat(coordinates.longitude)
            }
        }

        if (formattedAddress) address.formattedAddress = formattedAddress.trim()

        if (locationDetails) {
            address.locationDetails = {
                neighborhood: locationDetails.neighborhood?.trim(),
                sublocality: locationDetails.sublocality?.trim(),
                administrativeArea: locationDetails.administrativeArea?.trim(),
                route: locationDetails.route?.trim(),
                streetNumber: locationDetails.streetNumber?.trim()
            }
        }

        await address.save()

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: {
                address: address
            }
        })

    } catch (error) {

        console.error('Update address error:', error)

        if (error.name === 'ValidationError') {

            const message = Object.values(error.errors).map(err => err.message).join(', ')

            return next(errorHandler(400, message))

        }

        next(errorHandler(500, "Server error while updating address"))

    }

}


// @desc    Delete address (soft delete)
// @route   DELETE /api/addresses/:addressId
// @access  Private
export const deleteAddress = async (req, res, next) => {

    try {

        const { addressId } = req.params

        const address = await Address.findOne({
            _id: addressId,
            userId: req.user.userId,
            isActive: true
        })

        if (!address) {

            return next(errorHandler(404, "Address not found"))

        }

        // Soft delete
        address.isActive = false

        address.isDefault = false

        await address.save()

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        })

    } catch (error) {

        console.error('Delete address error:', error)

        next(errorHandler(500, "Server error while deleting address"))

    }

}


// @desc    Set default address
// @route   PUT /api/addresses/:addressId/default
// @access  Private
export const setDefaultAddress = async (req, res, next) => {

    try {

        const { addressId } = req.params

        const address = await Address.findOne({
            _id: addressId,
            userId: req.user.userId,
            isActive: true
        })

        if (!address) {

            return next(errorHandler(404, "Address not found"))

        }

        // Set as default (pre-save hook will handle unsetting others)
        address.isDefault = true

        await address.save()

        res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            data: {
                address: address
            }
        })

    } catch (error) {

        console.error('Set default address error:', error)

        next(errorHandler(500, "Server error while setting default address"))

    }

}


// @desc    Get default address
// @route   GET /api/addresses/default
// @access  Private
export const getDefaultAddress = async (req, res, next) => {

    try {

        const defaultAddress = await Address.findOne({
            userId: req.user.userId,
            isDefault: true,
            isActive: true
        })

        if (!defaultAddress) {

            return next(errorHandler(404, "No default address found"))

        }

        res.status(200).json({
            success: true,
            data: {
                address: defaultAddress
            }
        })

    } catch (error) {

        console.error('Get default address error:', error)

        next(errorHandler(500, "Server error while fetching default address"))

    }

}


// @desc    Get all addresses for all users (Admin only)
// @route   GET /api/addresses/admin/all
// @access  Private (Admin)
export const getAllAddresses = async (req, res, next) => {

    try {

        const { page = 1, limit = 10, userId, city, region } = req.query

        const query = { isActive: true }

        // Filter by user if provided
        if (userId) query.userId = userId

        // Filter by city if provided
        if (city) query.city = { $regex: city, $options: 'i' }

        // Filter by region if provided
        if (region) query.region = { $regex: region, $options: 'i' }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const addresses = await Address.find(query)
            .populate('userId', 'name email phone')
            .sort(options.sort)
            .limit(options.limit * 1)
            .skip((options.page - 1) * options.limit)

        const total = await Address.countDocuments(query)

        res.status(200).json({
            success: true,
            data: {
                addresses: addresses,
                pagination: {
                    currentPage: options.page,
                    totalPages: Math.ceil(total / options.limit),
                    totalAddresses: total,
                    hasNextPage: options.page < Math.ceil(total / options.limit),
                    hasPrevPage: options.page > 1
                }
            }
        })

    } catch (error) {

        console.error('Get all addresses error:', error)

        next(errorHandler(500, "Server error while fetching all addresses"))

    }

}