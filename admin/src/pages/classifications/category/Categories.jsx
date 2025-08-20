import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetCategories, useDeleteCategory } from '../../../hooks/useCategories'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle } from 'react-icons/fi'
import Pagination from '../../../components/common/Pagination'
import toast from 'react-hot-toast'


const Categories = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    const params = {}
    if (filterStatus === 'active') params.status = 'active'
    if (filterStatus === 'inactive') params.status = 'inactive'
    if (filterStatus === 'all') delete params.status
    if (debouncedSearch) params.search = debouncedSearch
    params.page = currentPage
    params.limit = itemsPerPage

    const { data, isLoading } = useGetCategories(params)
    const categories = data?.data?.data?.categories || []
    const pagination = data?.data?.data?.pagination || {}
    const totalItems = pagination.totalCategories || pagination.totalItems || 0
    const totalPages = pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)))
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState({ open: false, category: null })
    const navigate = useNavigate()
    const deleteCategory = useDeleteCategory()


    // Real data now fetched via useGetCategories


    const handleInputChange = () => {}


    const handleSubmit = async () => {}


    const handleEdit = (category) => {
        navigate(`/categories/${category._id || category.id}/edit`)
    }


    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            // TODO: Implement API call to delete category
            setCategories(prev => prev.filter(cat => cat.id !== categoryId))
        }
    }


    const filteredCategories = categories


    const LoadingSkeleton = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4"><div className="h-4 w-6 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4 text-right"><div className="h-8 w-24 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
        )


    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600">Manage your product categories</p>
                </div>
                <Link
                    to="/categories/add"
                    className="btn-primary inline-flex items-center"
                >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Category
                </Link>
            </div>


            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-gray-400 h-4 w-4" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Categories</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    {/* Items per page moved to top next to status filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            {[5, 10, 20, 50].map(n => (<option key={n} value={n}>{n}</option>))}
                        </select>
                    </div>
                </div>
            </div>


            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : filteredCategories.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <FiGrid className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No categories yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first category.</p>
                        <div className="mt-6">
                            <Link to="/categories/add" className="btn-primary inline-flex items-center">
                                <FiPlus className="mr-2 h-4 w-4" />
                                Add Category
                            </Link>
                        </div>
                    </div>
                ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                {/* Description column removed */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Products
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map((category, index) => (
                                <tr key={category._id || category.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(pagination.currentPage ? (pagination.currentPage - 1) * itemsPerPage : (currentPage - 1) * itemsPerPage) + index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            <div className="text-sm text-gray-500">{category.slug}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {category.productCount || 0} products
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            (category.status || (category.isActive ? 'active' : 'inactive')) === 'active'
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {(category.status || (category.isActive ? 'active' : 'inactive')) === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-primary hover:text-secondary"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete({ open: true, category })}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={pagination.currentPage || currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => setCurrentPage(p)}
                    totalItems={totalItems}
                    pageSize={itemsPerPage}
                    currentPageCount={categories.length}
                    align="center"
                />
                </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDelete.open && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <FiAlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete category?</h3>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">Are you sure you want to delete "{confirmDelete.category?.name}"? This action cannot be undone.</p>
                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete({ open: false, category: null })}
                                className="btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await deleteCategory.mutateAsync(confirmDelete.category?._id || confirmDelete.category?.id)
                                        toast.success('Category deleted')
                                    } catch (err) {
                                        toast.error(err.response?.data?.message || 'Failed to delete')
                                    } finally {
                                        setConfirmDelete({ open: false, category: null })
                                    }
                                }}
                                className="btn-primary bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                            >
                                {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {showEditModal ? 'Edit Category' : 'Add New Category'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-900">
                                        Active
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false)
                                            setShowEditModal(false)
                                            setFormData({ name: '', description: '', slug: '', isActive: true })
                                            setSelectedCategory(null)
                                        }}
                                        className="btn-outline"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {showEditModal ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default Categories 