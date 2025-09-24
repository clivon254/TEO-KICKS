import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiEdit, FiPlus, FiTrash2, FiLoader, FiAlertTriangle, FiX } from 'react-icons/fi'
import { useGetVariantById, useUpdateVariant } from '../../hooks/useVariants'
import { variantAPI } from '../../utils/api'
import { variantSchema } from '../../utils/validation'
import toast from 'react-hot-toast'


const EditVariant = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data, isLoading, isError, error } = useGetVariantById(id)
    const updateVariantMutation = useUpdateVariant()

    const [formData, setFormData] = useState({
        name: '',
        options: []
    })

    const [validationErrors, setValidationErrors] = useState({})
    const [optionInput, setOptionInput] = useState('')
    const [confirmDelete, setConfirmDelete] = useState({ open: false, option: null, index: null })
    const initialOptionsRef = useRef([])

    // Handle options management
    const addOption = () => {
        if (optionInput.trim() && !formData.options.some(opt => opt.value === optionInput.trim())) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, { value: optionInput.trim() }]
            }))
            setOptionInput('')
        }
    }

    const removeOption = (index) => {
        const option = formData.options[index]
        setConfirmDelete({ open: true, option, index })
    }

    const confirmDeleteOption = () => {
        if (confirmDelete.index !== null) {
            setFormData(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== confirmDelete.index)
            }))
        }
        setConfirmDelete({ open: false, option: null, index: null })
    }

    const cancelDeleteOption = () => {
        setConfirmDelete({ open: false, option: null, index: null })
    }

    const handleOptionKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addOption()
        }
    }

    // Populate form when variant data is loaded
    useEffect(() => {
        if (!data) return

        // Axios response shape: data.data => { success, data }
        const payload = data?.data

        const variant = payload?.data
            || payload?.variant
            || data?.variant
            || data

        if (variant && (variant.name || Array.isArray(variant.options))) {
            setFormData({
                name: variant.name || '',
                options: Array.isArray(variant.options) ? variant.options : []
            })

            // Keep the original options for diffing on submit
            initialOptionsRef.current = Array.isArray(variant.options) ? variant.options : []
        }
    }, [data])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // Validate form data
            await variantSchema.validate(formData, { abortEarly: false })

            // 1) Update base variant fields (include sanitized options to satisfy backend validation)
            const namePayload = {
                name: formData.name.trim(),
                options: (formData.options || [])
                    .filter(o => (o?.value || '').trim().length > 0)
                    .map(o => ({ value: o.value.trim() }))
            }
            await updateVariantMutation.mutateAsync({ variantId: id, ...namePayload })

            // 2) Diff options and sync via dedicated endpoints
            const original = initialOptionsRef.current || []
            const current = formData.options || []

            const originalIds = new Set(original.filter(o => o && o._id).map(o => String(o._id)))
            const currentIds = new Set(current.filter(o => o && o._id).map(o => String(o._id)))

            // New options: no _id present
            const optionsToAdd = current.filter(o => !o._id && (o.value || '').trim().length > 0)
            // Removed options: present in original but not in current
            const optionsToRemove = original.filter(o => o._id && !currentIds.has(String(o._id)))

            // Perform add/remove operations
            for (const opt of optionsToAdd) {
                try {
                    await variantAPI.addOption(id, { value: opt.value.trim() })
                } catch (error) {
                    console.error('Failed to add option:', error)
                    throw new Error(`Failed to add option "${opt.value}": ${error.response?.data?.message || error.message}`)
                }
            }

            for (const opt of optionsToRemove) {
                try {
                    await variantAPI.removeOption(id, String(opt._id))
                } catch (error) {
                    console.error('Failed to remove option:', error)
                    throw new Error(`Failed to remove option "${opt.value}": ${error.response?.data?.message || error.message}`)
                }
            }

            toast.success('Variant updated successfully!')
            navigate('/variants')

        } catch (validationError) {
            if (validationError.name === 'ValidationError') {
                const errors = {}
                validationError.inner.forEach((error) => {
                    errors[error.path] = error.message
                })
                setValidationErrors(errors)
            } else {
                console.error('Error updating variant:', validationError)

                if (validationError.response?.data?.message) {
                    toast.error(validationError.response.data.message)
                } else if (validationError.message) {
                    toast.error(validationError.message)
                } else {
                    toast.error('Failed to update variant. Please try again.')
                }
            }
        }
    }

    const handleCancel = () => {
        navigate('/variants')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="flex justify-center items-center h-32">
                            <FiLoader className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="text-center">
                            <div className="text-red-500 mb-4">Error loading variant.</div>
                            {error && (
                                <div className="text-sm text-gray-600">
                                    <p><strong>Error details:</strong></p>
                                    <p>{error.message || 'Unknown error occurred'}</p>
                                    {error.response?.status && (
                                        <p>Status: {error.response.status}</p>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={() => navigate('/variants')}
                                className="btn-primary mt-4"
                            >
                                Back to Variants
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Header */}
            <div className="max-w-2xl mx-auto px-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="title2">Edit Variant</h1>
                            <p className="text-gray-600">Update variant details and options</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Variant Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Variant Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`input ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                placeholder="Enter variant name (e.g., Size, Color, Material)"
                                disabled={updateVariantMutation.isPending}
                            />
                            {validationErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* Options Management */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Options <span className="text-red-500">*</span>
                            </label>

                            {/* Add Option Input */}
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={optionInput}
                                    onChange={(e) => setOptionInput(e.target.value)}
                                    onKeyPress={handleOptionKeyPress}
                                    placeholder="Enter option value (e.g., Small, Red, Cotton)"
                                    className="input flex-1"
                                    disabled={updateVariantMutation.isPending}
                                />
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="btn-primary px-4 py-2"
                                    disabled={updateVariantMutation.isPending || !optionInput.trim()}
                                >
                                    <FiPlus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Options List */}
                            {formData.options.length > 0 && (
                                <div className="space-y-2">
                                    {formData.options.map((option, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                            <span className="text-sm text-gray-700">{option.value}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="text-red-600 hover:text-red-800"
                                                disabled={updateVariantMutation.isPending}
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {validationErrors.options && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.options}</p>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn-outline"
                                disabled={updateVariantMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center"
                                disabled={updateVariantMutation.isPending}
                            >
                                {updateVariantMutation.isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FiEdit className="mr-2 h-4 w-4" />
                                        Update Variant
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDelete.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Option</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete the option "{confirmDelete.option?.value}"? This action cannot be undone and will affect any products using this variant.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDeleteOption}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteOption}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default EditVariant