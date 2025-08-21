import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import RichTextEditor from '../../../components/common/RichTextEditor'
import { categorySchema } from '../../../utils/validation'
import { useGetCategoryById, useUpdateCategory } from '../../../hooks/useCategories'
import toast from 'react-hot-toast'

const EditCategory = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { data, isLoading } = useGetCategoryById(id)
    const updateCategory = useUpdateCategory()

    const category = data?.data?.data?.category

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    })

    const [validationErrors, setValidationErrors] = useState({})

    // Handle description change from RichTextEditor
    const handleDescriptionChange = (html) => {
        setFormData(prev => ({ ...prev, description: html }))
        if (validationErrors.description) setValidationErrors(prev => ({ ...prev, description: '' }))
    }

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                status: category.status || (category.isActive ? 'active' : 'inactive')
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])




    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await categorySchema.validate(formData, { abortEarly: false })
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                status: formData.status
            }
            await updateCategory.mutateAsync({ categoryId: id, categoryData: payload })
            toast.success('Category updated successfully!')
            navigate('/categories')
        } catch (validationError) {
            if (validationError.name === 'ValidationError') {
                const errors = {}
                validationError.inner.forEach((error) => { errors[error.path] = error.message })
                setValidationErrors(errors)
            } else {
                toast.error(validationError.response?.data?.message || validationError.message || 'Failed to update category')
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        )
    }

    if (!category) {
        return (
            <div className="p-6">
                <p className="text-gray-600">Category not found.</p>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
                <button onClick={() => navigate('/categories')} className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md">
                    <FiArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
                    <p className="text-gray-600">Update category details</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`input ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                            placeholder="Enter category name"
                            disabled={updateCategory.isPending}
                        />
                        {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>

                        <RichTextEditor
                            content={formData.description}
                            onChange={handleDescriptionChange}
                            placeholder="Enter category description..."
                            disabled={updateCategory.isPending}
                            className={validationErrors.description ? 'border-red-500' : ''}
                            minHeight="150px"
                        />

                        {validationErrors.description && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))}
                            disabled={updateCategory.isPending}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${formData.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}
                            aria-pressed={formData.status === 'active'}
                        >
                            <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transform transition-transform ${formData.status === 'active' ? 'translate-x-7' : 'translate-x-0'}`} />
                            <span className="sr-only">Toggle status</span>
                        </button>
                        <span className={`ml-3 text-sm font-medium ${formData.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>
                            {formData.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button type="button" onClick={() => navigate('/categories')} className="btn-outline">Cancel</button>
                        <button type="submit" className="btn-primary inline-flex items-center" disabled={updateCategory.isPending}>
                            {updateCategory.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditCategory

