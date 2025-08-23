import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'
import { useCreateVariant } from '../../hooks/useVariants'
import { variantSchema } from '../../utils/validation'
import toast from 'react-hot-toast'


const AddVariant = () => {
    const navigate = useNavigate()
    const createVariantMutation = useCreateVariant()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        displayType: 'dropdown',
        options: [],
        colorHex: '',
        measurement: '',
        status: 'active'
    })

    const [validationErrors, setValidationErrors] = useState({})
    const [optionInput, setOptionInput] = useState('')

    // Handle description change from RichTextEditor
    const handleDescriptionChange = (html) => {
        setFormData(prev => ({
            ...prev,
            description: html
        }))

        // Clear validation error when user starts typing
        if (validationErrors.description) {
            setValidationErrors(prev => ({
                ...prev,
                description: ''
            }))
        }
    }

    // Handle options management
    const addOption = () => {
        if (optionInput.trim()) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, {
                    value: optionInput.trim(),
                    isActive: true,
                    sortOrder: prev.options.length
                }]
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
                description: formData.description.trim() || undefined,
                options: formData.options,
                displayType: formData.displayType,
                colorHex: formData.colorHex || undefined,
                measurement: formData.measurement || undefined,
                isActive: formData.status === 'active'
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


    // Get plain text length for character count
    const getPlainTextLength = () => {
        return formData.description.length
    }


    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="title2">Add New Variant</h1>
                            <p className="text-gray-600">Create a new product variant</p>
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
                                placeholder="Enter variant name"
                                disabled={createVariantMutation.isPending}
                            />
                            {validationErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* Description - Rich Text Editor */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>

                            <RichTextEditor
                                content={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="Enter variant description..."
                                disabled={createVariantMutation.isPending}
                                className={validationErrors.description ? 'border-red-500' : ''}
                                minHeight="150px"
                            />

                            {validationErrors.description && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                            )}

                            <p className="mt-1 text-xs text-gray-500">
                                {getPlainTextLength()}/500 characters
                            </p>
                        </div>

                        {/* Display Type */}
                        <div>
                            <label htmlFor="displayType" className="block text-sm font-medium text-gray-700 mb-2">
                                Display Type
                            </label>
                            <select
                                id="displayType"
                                name="displayType"
                                value={formData.displayType}
                                onChange={handleInputChange}
                                className="input"
                                disabled={createVariantMutation.isPending}
                            >
                                <option value="dropdown">Dropdown</option>
                                <option value="radio">Radio Buttons</option>
                                <option value="checkbox">Checkboxes</option>
                                <option value="swatch">Color Swatches</option>
                            </select>
                        </div>

                        {/* Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Options (Optional)
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={optionInput}
                                    onChange={(e) => setOptionInput(e.target.value)}
                                    onKeyPress={handleOptionKeyPress}
                                    className="input flex-1"
                                    placeholder="Add an option and press Enter"
                                    disabled={createVariantMutation.isPending}
                                />
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="btn-outline px-4"
                                    disabled={createVariantMutation.isPending}
                                >
                                    Add
                                </button>
                            </div>
                            {formData.options.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.options.map((option, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                        >
                                            {option.value}
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                disabled={createVariantMutation.isPending}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Color Hex (for swatches) */}
                        <div>
                            <label htmlFor="colorHex" className="block text-sm font-medium text-gray-700 mb-2">
                                Color Hex (Optional)
                            </label>
                            <input
                                type="text"
                                id="colorHex"
                                name="colorHex"
                                value={formData.colorHex}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="#FF0000"
                                disabled={createVariantMutation.isPending}
                            />
                            {formData.colorHex && (
                                <div className="mt-2">
                                    <div
                                        className="inline-block w-8 h-8 rounded border-2 border-gray-300"
                                        style={{ backgroundColor: formData.colorHex }}
                                        title={formData.colorHex}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Measurement (for sizes) */}
                        <div>
                            <label htmlFor="measurement" className="block text-sm font-medium text-gray-700 mb-2">
                                Measurement (Optional)
                            </label>
                            <input
                                type="text"
                                id="measurement"
                                name="measurement"
                                value={formData.measurement}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="e.g., XL, 42, 10.5"
                                disabled={createVariantMutation.isPending}
                            />
                        </div>

                        {/* Status (Toggle) */}
                        <ToggleSwitch
                            isActive={formData.status === 'active'}
                            onToggle={() => setFormData(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))}
                            disabled={createVariantMutation.isPending}
                            description="Active variants will be available for use in products"
                        />

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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