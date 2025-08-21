import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiLoader, FiX } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import { useCreateBrand } from '../../../hooks/useBrands'
import toast from 'react-hot-toast'


const AddBrand = () => {
    const navigate = useNavigate()
    const createBrandMutation = useCreateBrand()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: '',
        website: '',
        features: [],
        isActive: true
    })

    const [validationErrors, setValidationErrors] = useState({})
    const [featureInput, setFeatureInput] = useState('')

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

    const addFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }))
            setFeatureInput('')
        }
    }

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }

    const handleFeatureKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addFeature()
        }
    }

    const validateForm = () => {
        const errors = {}

        if (!formData.name.trim()) {
            errors.name = 'Brand name is required'
        }

        if (formData.website && !isValidUrl(formData.website)) {
            errors.website = 'Please enter a valid website URL'
        }

        if (formData.logo && !isValidUrl(formData.logo)) {
            errors.logo = 'Please enter a valid logo URL'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const isValidUrl = (string) => {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the validation errors')
            return
        }

        try {
            const brandData = {
                ...formData,
                description: formData.description || ''
            }

            await createBrandMutation.mutateAsync(brandData)
            toast.success('Brand created successfully!')
            navigate('/brands')
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create brand'
            toast.error(errorMessage)
            
            // Handle validation errors from server
            if (error.response?.data?.errors) {
                setValidationErrors(error.response.data.errors)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="title2">Add New Brand</h1>
                            <p className="text-gray-600">Create a new product brand</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`input ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                placeholder="Enter brand name"
                            />
                            {validationErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* Logo */}
                        <div>
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                                Logo URL (Optional)
                            </label>
                            <input
                                type="url"
                                id="logo"
                                name="logo"
                                value={formData.logo}
                                onChange={handleInputChange}
                                className={`input ${validationErrors.logo ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                placeholder="https://example.com/logo.png"
                            />
                            {validationErrors.logo && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.logo}</p>
                            )}
                            {formData.logo && (
                                <div className="mt-2">
                                    <img 
                                        src={formData.logo} 
                                        alt="Logo preview" 
                                        className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                            e.target.style.display = 'none'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Website */}
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                                Website URL (Optional)
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className={`input ${validationErrors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                placeholder="https://example.com"
                            />
                            {validationErrors.website && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.website}</p>
                            )}
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Features (Optional)
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    onKeyPress={handleFeatureKeyPress}
                                    className="input flex-1"
                                    placeholder="Add a feature and press Enter"
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="btn-outline px-4"
                                >
                                    Add
                                </button>
                            </div>
                            {formData.features.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                        >
                                            {feature}
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
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
                                placeholder="Enter brand description..."
                                className={validationErrors.description ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : ''}
                            />
                            {validationErrors.description && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                    Active
                                </span>
                            </label>
                            <p className="mt-1 text-sm text-gray-500">
                                Active brands will be available for use in products
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center"
                                disabled={createBrandMutation.isPending}
                            >
                                {createBrandMutation.isPending ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <FiPlus className="mr-2 h-4 w-4" />
                                        Add Brand
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


export default AddBrand