import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiEdit, FiLoader } from 'react-icons/fi'
import RichTextEditor from '../../components/common/RichTextEditor'
import ToggleSwitch from '../../components/common/ToggleSwitch'
import { useGetVariantById, useUpdateVariant } from '../../hooks/useVariants'
import toast from 'react-hot-toast'


const EditVariant = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data, isLoading, isError } = useGetVariantById(id)
    const updateVariantMutation = useUpdateVariant()

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

    // Handle description change from RichTextEditor
    const handleDescriptionChange = (html) => {
        setFormData(prev => ({ ...prev, description: html }))
        if (validationErrors.description) {
            setValidationErrors(prev => ({ ...prev, description: '' }))
        }
    }





    // Populate form when variant data is loaded
    useEffect(() => {
        if (data?.data?.data?.variant) {
            const variant = data.data.data.variant
            setFormData({
                name: variant.name || '',
                description: variant.description || '',
                displayType: variant.displayType || 'dropdown',
                options: variant.options || [],
                colorHex: variant.colorHex || '',
                measurement: variant.measurement || '',
                status: variant.isActive ? 'active' : 'inactive'
            })
        }
    }, [data])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear validation error for this field
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

            await updateVariantMutation.mutateAsync({ variantId: id, ...payload })
            toast.success('Variant updated successfully!')
            navigate('/variants')
        } catch (error) {
            console.error('Error updating variant:', error)

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else if (error.message) {
                toast.error(error.message)
            } else {
                toast.error('Failed to update variant. Please try again.')
            }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-6">
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
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="text-center text-red-500">Error loading variant.</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="title2">Edit Variant</h1>
                            <p className="text-gray-600">Update variant details</p>
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
                                disabled={updateVariantMutation.isPending}
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
                                disabled={updateVariantMutation.isPending}
                                className={validationErrors.description ? 'border-red-500' : ''}
                                minHeight="150px"
                            />

                            {validationErrors.description && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                            )}

                            <p className="mt-1 text-xs text-gray-500">
                                {formData.description.length}/500 characters
                            </p>
                        </div>

                        {/* Status (Toggle) */}
                        <ToggleSwitch
                            isActive={formData.status === 'active'}
                            onToggle={() => setFormData(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))}
                            disabled={updateVariantMutation.isPending}
                            description="Active variants will be available for use in products"
                        />

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center"
                                disabled={updateVariantMutation.isPending}
                            >
                                {updateVariantMutation.isPending ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
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
        </div>
    )
}


export default EditVariant