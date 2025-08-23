import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import ToggleSwitch from '../../../components/common/ToggleSwitch'
import { useCreateCategory } from '../../../hooks/useCategories'
import { categorySchema } from '../../../utils/validation'
import toast from 'react-hot-toast'


const AddCategory = () => {
    const navigate = useNavigate()
    const createCategoryMutation = useCreateCategory()
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    })
    
    const [validationErrors, setValidationErrors] = useState({})


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
            await categorySchema.validate(formData, { abortEarly: false })
            
            // Prepare payload
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                status: formData.status
            }
            
            await createCategoryMutation.mutateAsync(payload)
            
            toast.success('Category created successfully!')
            navigate('/categories')
            
        } catch (validationError) {
            if (validationError.name === 'ValidationError') {
                const errors = {}
                validationError.inner.forEach((error) => {
                    errors[error.path] = error.message
                })
                setValidationErrors(errors)
            } else {
                console.error('Error creating category:', validationError)
                
                if (validationError.response?.data?.message) {
                    toast.error(validationError.response.data.message)
                } else if (validationError.message) {
                    toast.error(validationError.message)
                } else {
                    toast.error('Failed to create category. Please try again.')
                }
            }
        }
    }


    const handleCancel = () => {
        navigate('/categories')
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
                            <h1 className="title2">Add New Category</h1>
                            <p className="text-gray-600">Create a new product category</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`input ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                placeholder="Enter category name"
                                disabled={createCategoryMutation.isPending}
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
                                placeholder="Enter category description..."
                                disabled={createCategoryMutation.isPending}
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

                        {/* Status (Toggle) */}
                        <ToggleSwitch
                            isActive={formData.status === 'active'}
                            onToggle={() => setFormData(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))}
                            disabled={createCategoryMutation.isPending}
                            description="Active categories will be available for use in products"
                        />

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn-outline"
                                disabled={createCategoryMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center"
                                disabled={createCategoryMutation.isPending}
                            >
                                {createCategoryMutation.isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2 h-4 w-4" />
                                        Create Category
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


export default AddCategory 