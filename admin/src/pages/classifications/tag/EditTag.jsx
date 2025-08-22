import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEdit, FiLoader } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import ToggleSwitch from '../../../components/common/ToggleSwitch'
import { useGetTagById, useUpdateTag } from '../../../hooks/useTags'
import toast from 'react-hot-toast'


const EditTag = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    
    const { data, isLoading, isError } = useGetTagById(id)
    const updateTagMutation = useUpdateTag()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    })

    const [validationErrors, setValidationErrors] = useState({})

    // Handle description change from RichTextEditor
    const handleDescriptionChange = (html) => {
        setFormData(prev => ({ ...prev, description: html }))
        if (validationErrors.description) setValidationErrors(prev => ({ ...prev, description: '' }))
    }

    // Populate form when tag data is loaded
    useEffect(() => {
        if (data?.data?.data?.tag) {
            const tag = data.data.data.tag
            setFormData({
                name: tag.name || '',
                description: tag.description || '',
                isActive: tag.isActive ?? true
            })
        }
    }, [data])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }

    const validateForm = () => {
        const errors = {}

        if (!formData.name.trim()) {
            errors.name = 'Tag name is required'
        }

        if (!formData.type) {
            errors.type = 'Tag type is required'
        }

        if (!formData.color) {
            errors.color = 'Tag color is required'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the validation errors')
            return
        }

        try {
            const tagData = {
                tagId: id,
                ...formData,
                description: formData.description || ''
            }

            await updateTagMutation.mutateAsync(tagData)
            toast.success('Tag updated successfully!')
            navigate('/tags')
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update tag'
            toast.error(errorMessage)
            
            if (error.response?.data?.errors) {
                setValidationErrors(error.response.data.errors)
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
                        <div className="text-center text-red-500">Error loading tag.</div>
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
                            <h1 className="title2">Edit Tag</h1>
                            <p className="text-gray-600">Update tag details</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Tag Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`input ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                placeholder="Enter tag name"
                            />
                            {validationErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* Type */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                Tag Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className={`input ${validationErrors.type ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                            >
                                <option value="product">Product</option>
                                <option value="blog">Blog</option>
                                <option value="general">General</option>
                            </select>
                            {validationErrors.type && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
                            )}
                        </div>

                        {/* Color */}
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                                Tag Color *
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="color"
                                    id="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    className="h-10 w-16 border border-gray-300 rounded-lg cursor-pointer"
                                />
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    className={`input flex-1 ${validationErrors.color ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    placeholder="#3B82F6"
                                />
                            </div>
                            {validationErrors.color && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.color}</p>
                            )}
                        </div>

                        {/* Icon */}
                        <div>
                            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                                Icon (Optional)
                            </label>
                            <input
                                type="text"
                                id="icon"
                                name="icon"
                                value={formData.icon}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="e.g., star, heart, tag"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Enter an icon name from Feather Icons or leave empty
                            </p>
                        </div>

                        {/* Description - Rich Text Editor */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <RichTextEditor
                                content={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="Enter tag description..."
                                className={validationErrors.description ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : ''}
                            />
                            {validationErrors.description && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                            )}
                        </div>

                        {/* Status */}
                        <ToggleSwitch
                            isActive={formData.isActive}
                            onToggle={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                            disabled={updateTagMutation.isPending}
                            description="Active tags will be available for use in products"
                        />

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center"
                                disabled={updateTagMutation.isPending}
                            >
                                {updateTagMutation.isPending ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FiEdit className="mr-2 h-4 w-4" />
                                        Update Tag
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


export default EditTag