import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiSave, FiLoader, FiArrowLeft } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import ToggleSwitch from '../../../components/common/ToggleSwitch'
import { useGetCollectionById, useUpdateCollection } from '../../../hooks/useCollections'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const EditCollection = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const updateCollectionMutation = useUpdateCollection()
    const { data: collectionData, isLoading: isLoadingCollection } = useGetCollectionById(id)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    })

    const [validationErrors, setValidationErrors] = useState({})

    // Load collection data when available
    useEffect(() => {
        if (collectionData?.data?.data?.collection) {
            const collection = collectionData.data.data.collection
            setFormData({
                name: collection.name || '',
                description: collection.description || '',
                isActive: collection.isActive !== undefined ? collection.isActive : true
            })
        }
    }, [collectionData])

    // Handle description change from RichTextEditor
    const handleDescriptionChange = (html) => {
        setFormData(prev => ({ ...prev, description: html }))
        if (validationErrors.description) {
            setValidationErrors(prev => ({ ...prev, description: '' }))
        }
    }

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

    const validateForm = () => {
        const errors = {}

        if (!formData.name.trim()) {
            errors.name = 'Collection name is required'
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
            const collectionData = {
                ...formData,
                description: formData.description || ''
            }

            await updateCollectionMutation.mutateAsync({ collectionId: id, ...collectionData })
            toast.success('Collection updated successfully!')
            navigate('/collections')
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update collection'
            toast.error(errorMessage)

            // Handle validation errors from server
            if (error.response?.data?.errors) {
                setValidationErrors(error.response.data.errors)
            }
        }
    }

    if (isLoadingCollection) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center justify-center">
                            <FiLoader className="animate-spin h-8 w-8 text-primary" />
                            <span className="ml-2 text-gray-600">Loading collection...</span>
                        </div>
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
                            <h1 className="title2">Edit Collection</h1>
                            <p className="text-gray-600">Update collection information</p>
                        </div>
                        <Link
                            to="/collections"
                            className="btn-outline inline-flex items-center"
                        >
                            <FiArrowLeft className="mr-2 h-4 w-4" />
                            Back to Collections
                        </Link>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Collection Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`input ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                placeholder="Enter collection name"
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
                                placeholder="Enter collection description..."
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
                            disabled={updateCollectionMutation.isPending}
                            description="Active collections will be available for use in products"
                        />

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                            <Link
                                to="/collections"
                                className="btn-outline"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center"
                                disabled={updateCollectionMutation.isPending}
                            >
                                {updateCollectionMutation.isPending ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2 h-4 w-4" />
                                        Update Collection
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

export default EditCollection