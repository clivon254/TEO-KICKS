import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useCreateVariant } from '../../hooks/useVariants'
import { variantSchema } from '../../utils/validation'
import toast from 'react-hot-toast'


const AddVariant = () => {
    const navigate = useNavigate()
    const createVariantMutation = useCreateVariant()

    const [formData, setFormData] = useState({
        name: '',
        options: []
    })

    const [validationErrors, setValidationErrors] = useState({})
    const [optionInput, setOptionInput] = useState('')

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
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }))
    }

    const handleOptionKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addOption()
        }
    }

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

            // Prepare payload
            const payload = {
                name: formData.name.trim(),
                options: formData.options
            }

            await createVariantMutation.mutateAsync(payload)

            toast.success('Variant created successfully!')
            navigate('/variants')

        } catch (validationError) {
            if (validationError.name === 'ValidationError') {
                const errors = {}
                validationError.inner.forEach((error) => {
                    errors[error.path] = error.message
                })
                setValidationErrors(errors)
            } else {
                console.error('Error creating variant:', validationError)

                if (validationError.response?.data?.message) {
                    toast.error(validationError.response.data.message)
                } else if (validationError.message) {
                    toast.error(validationError.message)
                } else {
                    toast.error('Failed to create variant. Please try again.')
                }
            }
        }
    }

    const handleCancel = () => {
        navigate('/variants')
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Header */}
            <div className="max-w-2xl mx-auto px-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="title2">Add New Variant</h1>
                            <p className="text-gray-600">Create a new product variant with options</p>
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
                                disabled={createVariantMutation.isPending}
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
                                    disabled={createVariantMutation.isPending}
                                />
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="btn-primary px-4 py-2"
                                    disabled={createVariantMutation.isPending || !optionInput.trim()}
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
                                                disabled={createVariantMutation.isPending}
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
                                disabled={createVariantMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center"
                                disabled={createVariantMutation.isPending}
                            >
                                {createVariantMutation.isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2 h-4 w-4" />
                                        Create Variant
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddVariant