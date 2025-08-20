import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
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


    // TipTap editor configuration - simplified
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: formData.description,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
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
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none',
            },
        },
    })


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
        if (!editor) return 0
        return editor.getText().length
    }


    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                    >
                        <FiArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
                        <p className="text-gray-600">Create a new product category</p>
                    </div>
                </div>
            </div>


            {/* Form */}
            <div className="max-w-2xl">
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
                        <div className={`${validationErrors.description ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-gray-300 focus-within:border-primary focus-within:ring-primary/20'} border rounded-lg focus-within:ring-2 transition-all duration-200`}>
                            {/* Simple Toolbar */}
                            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleBold().run()}
                                    className={`p-2 rounded-md transition-colors ${
                                        editor?.isActive('bold') 
                                            ? 'bg-primary text-white' 
                                            : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                    }`}
                                    disabled={createCategoryMutation.isPending}
                                >
                                    <strong>B</strong>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                                    className={`p-2 rounded-md transition-colors ${
                                        editor?.isActive('italic') 
                                            ? 'bg-primary text-white' 
                                            : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                    }`}
                                    disabled={createCategoryMutation.isPending}
                                >
                                    <em>I</em>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                    className={`p-2 rounded-md transition-colors ${
                                        editor?.isActive('bulletList') 
                                            ? 'bg-primary text-white' 
                                            : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                    }`}
                                    disabled={createCategoryMutation.isPending}
                                >
                                    •
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                    className={`p-2 rounded-md transition-colors ${
                                        editor?.isActive('orderedList') 
                                            ? 'bg-primary text-white' 
                                            : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                    }`}
                                    disabled={createCategoryMutation.isPending}
                                >
                                    1.
                                </button>
                            </div>
                            
                            {/* Editor Content */}
                            <div className="p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                        {validationErrors.description && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {getPlainTextLength()}/500 characters
                        </p>
                    </div>

                    {/* Status (Toggle) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))}
                            disabled={createCategoryMutation.isPending}
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


                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn-outline inline-flex items-center"
                            disabled={createCategoryMutation.isPending}
                        >
                            <FiX className="mr-2 h-4 w-4" />
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
    )
}


export default AddCategory 