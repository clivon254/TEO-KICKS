import React, { useState } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiGrid, FiAlertTriangle, FiX, FiList, FiLoader } from 'react-icons/fi'
import { useGetCollections, useDeleteCollection } from '../../../hooks/useCollections'
import { Link } from 'react-router-dom'
import StatusBadge from '../../../components/common/StatusBadge'
import Pagination from '../../../components/common/Pagination'
import toast from 'react-hot-toast'


const Collections = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Build query parameters
    const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { type: filterType })
    }

    const { data, isLoading, isError, error } = useGetCollections(queryParams)
    const deleteCollectionMutation = useDeleteCollection()

    const handleDelete = async (collectionId) => {
        if (window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
            try {
                await deleteCollectionMutation.mutateAsync(collectionId)
                toast.success('Collection deleted successfully')
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete collection')
            }
        }
    }

    const clearSearch = () => {
        setSearchTerm('')
        setCurrentPage(1)
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <FiLoader className="animate-spin h-8 w-8 text-primary" />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FiAlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error loading collections</h3>
                            <p className="text-sm text-red-700 mt-1">
                                {error?.response?.data?.message || 'Something went wrong while fetching collections.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const collections = data?.data?.data?.collections || []
    const totalCollections = data?.data?.data?.total || 0
    const totalPages = data?.data?.data?.totalPages || 1
    const currentPageCount = collections.length

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                    <h1 className="title2">Collections</h1>
                    <p className="text-gray-600">Manage your product collections and groups</p>
                </div>
                <Link
                    to="/collections/add"
                    className="btn-primary inline-flex items-center justify-center"
                >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Collection
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search collections..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-9 pr-9"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Status Filter */}
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                                className="input2 pl-9"
                        >
                            <option value="all">All Collections</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <FiGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="input2 pl-9"
                            >
                                <option value="all">All Types</option>
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>

                        {/* Rows per page */}
                        <div className="relative">
                            <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
                                className="input2 pl-9"
                            >
                                {[5, 10, 20, 50].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collections Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No.
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Collection
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
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
                            {collections.map((collection, index) => {
                                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
                                return (
                                <tr key={collection.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {globalIndex}
                                        </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 mr-3">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-white">
                                                            {collection.name?.charAt(0)?.toUpperCase() || 'C'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {collection.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {collection.slug}
                                                    </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                collection.type === 'manual' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {collection.type || 'manual'}
                                        </span>
                                    </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {collection.productCount || 0} products
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={collection.isActive ? 'active' : 'inactive'} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    to={`/collections/${collection.id}/edit`}
                                                    className="text-primary hover:text-secondary p-1 rounded"
                                                    title="Edit collection"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                                </Link>
                                            <button
                                                onClick={() => handleDelete(collection.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded"
                                                    title="Delete collection"
                                                    disabled={deleteCollectionMutation.isPending}
                                            >
                                                    {deleteCollectionMutation.isPending ? (
                                                        <FiLoader className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                <FiTrash2 className="h-4 w-4" />
                                                    )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
            </div>

                {/* Empty State */}
                {collections.length === 0 && (
                    <div className="text-center py-12">
                        <FiGrid className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No collections found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new collection.'}
                        </p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <Link
                                    to="/collections/add"
                                    className="btn-primary inline-flex items-center"
                                >
                                    <FiPlus className="mr-2 h-4 w-4" />
                                    Add Collection
                                </Link>
                                </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={totalCollections}
                        pageSize={itemsPerPage}
                        currentPageCount={currentPageCount}
                        align="center"
                    />
                </div>
            )}
        </div>
    )
}


export default Collections 