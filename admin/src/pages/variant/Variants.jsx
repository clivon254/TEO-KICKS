import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetVariants, useDeleteVariant } from '../../hooks/useVariants'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/common/StatusBadge'


const Variants = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [selectedVariants, setSelectedVariants] = useState([])

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

    const { data, isLoading } = useGetVariants(params)
    const variants = data?.data?.data?.variants || []
    const pagination = data?.data?.data?.pagination || {}
    const totalItems = pagination.totalVariants || pagination.totalItems || 0
    const totalPages = pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)))
    const [confirmDelete, setConfirmDelete] = useState({ open: false, variant: null })
    const navigate = useNavigate()
    const deleteVariant = useDeleteVariant()

    // Handle variant selection
    const handleSelectVariant = (variantId) => {
        setSelectedVariants(prev =>
            prev.includes(variantId)
                ? prev.filter(id => id !== variantId)
                : [...prev, variantId]
        )
    }

    // Handle select all
    const handleSelectAll = () => {
        if (selectedVariants.length === variants.length) {
            setSelectedVariants([])
        } else {
            setSelectedVariants(variants.map(variant => variant._id || variant.id))
        }
    }

    const handleEdit = (variant) => {
        navigate(`/variants/${variant._id || variant.id}/edit`)
    }

    const handleDelete = async (variantId) => {
        if (window.confirm('Are you sure you want to delete this variant?')) {
            // TODO: Implement API call to delete variant
            setSelectedVariants(prev => prev.filter(id => id !== variantId))
        }
    }

    const clearSearch = () => {
        setSearchTerm('')
        setCurrentPage(1)
    }

    const LoadingSkeleton = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4 text-right"><div className="h-8 w-24 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    return (
        <div className="p-4">

            <header className="mb-4">

                {/* title */}
                <div className="mb-4">
                    <div className="mb-4">
                        <h1 className="title2">Variants</h1>
                        <p className="text-gray-600">Manage your product variants and options</p>
                    </div>
                </div>

                {/* Search Bar and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search variants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    aria-label="Clear search"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="sm:w-auto">
                        <Link
                            to="/variants/add"
                            className="btn-primary inline-flex items-center justify-center w-full sm:w-auto"
                        >
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Variant
                        </Link>
                    </div>
                </div>

                {/* Product Count and Filters */}
                <div className="flex items-center justify-between">
                    <div className="hidden lg:block">
                        <p className="text-sm text-gray-600">Total {totalItems} variants</p>
                    </div>
                    <div className="flex gap-4">
                        {/* Status Filter */}
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                <option value="all">Status: All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Rows per page */}
                        <div className="relative">
                            <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows per page: {n}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

            </header>

            {/* Variants Table */}
            <div className="bg-light rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : variants.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                        <FiGrid className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No variants</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new variant.</p>
                        <div className="mt-6">
                            <Link
                                to="/variants/add"
                                className="btn-primary inline-flex items-center"
                            >
                                <FiPlus className="mr-2 h-4 w-4" />
                                Add Variant
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedVariants.length === variants.length && variants.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {variants.map((variant) => (
                                        <tr key={variant.id} className="hover:bg-light">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedVariants.includes(variant._id || variant.id)}
                                                    onChange={() => handleSelectVariant(variant._id || variant.id)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{variant.name}</div>
                                                    {variant.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{variant.description}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {variant.options?.length || 0} options
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 capitalize">
                                                    {variant.displayType || 'dropdown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={variant.isActive ? 'active' : 'inactive'} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(variant)}
                                                        className="text-primary hover:text-secondary p-1 rounded"
                                                        title="Edit variant"
                                                    >
                                                        <FiEdit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete({ open: true, variant })}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded"
                                                        title="Delete variant"
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

                        {/* Selection Info */}
                        {selectedVariants.length > 0 && (
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    {selectedVariants.length} of {variants.length} selected
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                                <Pagination
                                    currentPage={pagination.currentPage || currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(p) => setCurrentPage(p)}
                                    totalItems={totalItems}
                                    pageSize={itemsPerPage}
                                    currentPageCount={variants.length}
                                    align="center"
                                />
                            </div>
                        )}
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
                                <h3 className="text-lg font-semibold text-gray-900">Delete variant?</h3>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">Are you sure you want to delete "{confirmDelete.variant?.name}"? This action cannot be undone.</p>
                            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    onClick={() => setConfirmDelete({ open: false, variant: null })}
                                    className="btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await deleteVariant.mutateAsync(confirmDelete.variant?._id || confirmDelete.variant?.id)
                                            toast.success('Variant deleted successfully')
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || 'Failed to delete variant')
                                        } finally {
                                            setConfirmDelete({ open: false, variant: null })
                                        }
                                    }}
                                    className="btn-primary bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                                >
                                    {deleteVariant.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default Variants