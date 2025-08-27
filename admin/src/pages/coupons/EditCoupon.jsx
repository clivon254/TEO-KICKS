import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import { useGetCouponById, useUpdateCoupon } from '../../hooks/useCoupons'
import toast from 'react-hot-toast'


const EditCoupon = () => {
    const navigate = useNavigate()
    const { couponId } = useParams()
    const updateCouponMutation = useUpdateCoupon()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minimumOrderAmount: '',
        maximumDiscountAmount: '',
        isActive: true,
        hasExpiry: false,
        expiryDate: '',
        hasUsageLimit: false,
        usageLimit: '',
        isFirstTimeOnly: false,
        applicableProducts: [],
        applicableCategories: [],
        excludedProducts: [],
        excludedCategories: []
    })

    const [errors, setErrors] = useState({})

    // Get coupon data
    const {
        data: couponData,
        isLoading,
        error
    } = useGetCouponById(couponId)

    // Load coupon data when available
    useEffect(() => {
        if (couponData?.data?.data) {
            const coupon = couponData.data.data
            setFormData({
                name: coupon.name || '',
                description: coupon.description || '',
                discountType: coupon.discountType || 'percentage',
                discountValue: coupon.discountValue?.toString() || '',
                minimumOrderAmount: coupon.minimumOrderAmount?.toString() || '',
                maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
                isActive: coupon.isActive !== undefined ? coupon.isActive : true,
                hasExpiry: coupon.hasExpiry || false,
                expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : '',
                hasUsageLimit: coupon.hasUsageLimit || false,
                usageLimit: coupon.usageLimit?.toString() || '',
                isFirstTimeOnly: coupon.isFirstTimeOnly || false,
                applicableProducts: coupon.applicableProducts || [],
                applicableCategories: coupon.applicableCategories || [],
                excludedProducts: coupon.excludedProducts || [],
                excludedCategories: coupon.excludedCategories || []
            })
        }
    }, [couponData])

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Coupon name is required'
        }

        if (!formData.discountValue || formData.discountValue <= 0) {
            newErrors.discountValue = 'Discount value must be greater than 0'
        }

        if (formData.discountType === 'percentage' && formData.discountValue > 100) {
            newErrors.discountValue = 'Percentage discount cannot exceed 100%'
        }

        if (formData.hasExpiry && !formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required when expiry is enabled'
        }

        if (formData.hasExpiry && formData.expiryDate) {
            const expiry = new Date(formData.expiryDate)
            if (expiry <= new Date()) {
                newErrors.expiryDate = 'Expiry date must be in the future'
            }
        }

        if (formData.hasUsageLimit && (!formData.usageLimit || formData.usageLimit < 1)) {
            newErrors.usageLimit = 'Usage limit must be at least 1'
        }

        if (formData.minimumOrderAmount && formData.minimumOrderAmount < 0) {
            newErrors.minimumOrderAmount = 'Minimum order amount cannot be negative'
        }

        if (formData.maximumDiscountAmount && formData.maximumDiscountAmount < 0) {
            newErrors.maximumDiscountAmount = 'Maximum discount amount cannot be negative'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            const couponData = {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : 0,
                maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : undefined,
                usageLimit: formData.hasUsageLimit ? parseInt(formData.usageLimit) : undefined,
                expiryDate: formData.hasExpiry ? formData.expiryDate : undefined
            }

            await updateCouponMutation.mutateAsync({ couponId, couponData })
            toast.success('Coupon updated successfully')
            navigate('/coupons')
        } catch (error) {
            toast.error('Failed to update coupon')
        }
    }

    // Handle cancel
    const handleCancel = () => {
        navigate('/coupons')
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-red-600">Failed to load coupon. Please try again.</p>
                    <button
                        onClick={() => navigate('/coupons')}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Back to Coupons
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FiArrowLeft className="h-4 w-4" />
                        Back to Coupons
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
                        <p className="text-gray-600 mt-1">Update coupon settings and configuration</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        </div>

                        {/* Coupon Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coupon Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Summer Sale 20% Off"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Optional description for this coupon"
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Status */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Inactive coupons cannot be used by customers
                            </p>
                        </div>

                        {/* Discount Configuration */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Configuration</h3>
                        </div>

                        {/* Discount Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Type *
                            </label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                            </select>
                        </div>

                        {/* Discount Value */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Value *
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleInputChange}
                                placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                                step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                min="0"
                                max={formData.discountType === 'percentage' ? '100' : undefined}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.discountValue ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.discountValue && (
                                <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>
                            )}
                        </div>

                        {/* Minimum Order Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Order Amount
                            </label>
                            <input
                                type="number"
                                name="minimumOrderAmount"
                                value={formData.minimumOrderAmount}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.minimumOrderAmount ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.minimumOrderAmount && (
                                <p className="mt-1 text-sm text-red-600">{errors.minimumOrderAmount}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Leave empty for no minimum</p>
                        </div>

                        {/* Maximum Discount Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Discount Amount
                            </label>
                            <input
                                type="number"
                                name="maximumDiscountAmount"
                                value={formData.maximumDiscountAmount}
                                onChange={handleInputChange}
                                placeholder="50.00"
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.maximumDiscountAmount ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.maximumDiscountAmount && (
                                <p className="mt-1 text-sm text-red-600">{errors.maximumDiscountAmount}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Leave empty for no maximum</p>
                        </div>

                        {/* Usage Limits */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Limits</h3>
                        </div>

                        {/* Has Usage Limit */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="hasUsageLimit"
                                    checked={formData.hasUsageLimit}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Set usage limit
                                </label>
                            </div>
                        </div>

                        {/* Usage Limit */}
                        {formData.hasUsageLimit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Usage Limit *
                                </label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    placeholder="100"
                                    min="1"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                        errors.usageLimit ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.usageLimit && (
                                    <p className="mt-1 text-sm text-red-600">{errors.usageLimit}</p>
                                )}
                            </div>
                        )}

                        {/* First Time Only */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isFirstTimeOnly"
                                    checked={formData.isFirstTimeOnly}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    First-time customers only
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                This coupon can only be used once per customer
                            </p>
                        </div>

                        {/* Expiry Settings */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiry Settings</h3>
                        </div>

                        {/* Has Expiry */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="hasExpiry"
                                    checked={formData.hasExpiry}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Set expiry date
                                </label>
                            </div>
                        </div>

                        {/* Expiry Date */}
                        {formData.hasExpiry && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                        errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.expiryDate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateCouponMutation.isPending}
                            className="btn-primary inline-flex items-center"
                        >
                            {updateCouponMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiSave className="mr-2 h-4 w-4" />
                                    Update Coupon
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default EditCoupon 