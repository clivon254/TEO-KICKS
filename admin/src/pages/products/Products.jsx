import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetProducts, useDeleteProduct } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'

import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiPackage, FiAlertTriangle, FiX, FiList, FiImage, FiDollarSign, FiGrid, FiEye } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'

import StatusBadge from '../../components/common/StatusBadge'

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterBrand, setFilterBrand] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [confirmDelete, setConfirmDelete] = useState({ open: false, product: null })

    const navigate = useNavigate()
    const deleteProduct = useDeleteProduct()

    // Debounce search term
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    // Memoize API parameters to prevent unnecessary re-renders
    const params = useMemo(() => {
        const p = {}
        if (filterStatus === 'active') p.status = 'active'
        if (filterStatus === 'draft') p.status = 'draft'
        if (filterStatus === 'archived') p.status = 'archived'
        if (filterBrand !== 'all') p.brand = filterBrand
        if (filterCategory !== 'all') p.category = filterCategory
        if (debouncedSearch) p.search = debouncedSearch
        p.page = currentPage
        p.limit = itemsPerPage
        return p
    }, [filterStatus, filterBrand, filterCategory, debouncedSearch, currentPage, itemsPerPage])

    const { data, isLoading } = useGetProducts(params)
    const { data: brandsData } = useGetBrands({ limit: 100 })
    const { data: categoriesData } = useGetCategories({ limit: 100 })

    // Memoize processed data to avoid re-computations
    const products = useMemo(() => data?.data || [], [data])
    const pagination = useMemo(() => data?.pagination || {}, [data])
    const totalItems = useMemo(() =>
        pagination.totalDocs || pagination.totalProducts || pagination.totalItems || products.length,
        [pagination, products.length]
    )
    const totalPages = useMemo(() =>
        pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1))),
        [pagination.totalPages, totalItems, itemsPerPage]
    )
    const brands = useMemo(() => brandsData?.data?.data?.brands || [], [brandsData])
    const categories = useMemo(() => categoriesData?.data?.data?.categories || [], [categoriesData])

    // Debug: Log the processed data
    console.log('Processed products:', products)
    console.log('Products length:', products.length)
    console.log('Is loading:', isLoading)
    console.log('Data structure check:', {
        hasData: !!data,
        dataType: typeof data,
        hasDataProperty: !!(data && data.data),
        dataPropertyType: data && data.data ? typeof data.data : 'undefined',
        isArray: Array.isArray(data?.data)
    })

    // Memoize event handlers to prevent unnecessary re-renders
    const handleSelectProduct = useCallback((productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }, [])

    // Memoize select all handler with products dependency
    const handleSelectAll = useCallback(() => {
        setSelectedProducts(prev => {
            if (prev.length === products.length) {
                return []
            } else {
                return products.map(prod => prod._id || prod.id)
            }
        })
    }, [products])

    const handleEdit = useCallback((product) => {
        navigate(`/products/${product._id || product.id}/edit`)
    }, [navigate])

    const handleViewDetails = useCallback((product) => {
        navigate(`/products/${product._id || product.id}/details`)
    }, [navigate])

    const handleDelete = useCallback((product) => {
        setConfirmDelete({ open: true, product })
    }, [])

    const confirmDeleteProduct = useCallback(async () => {
        try {
            await deleteProduct.mutateAsync(confirmDelete.product._id || confirmDelete.product.id)
            setConfirmDelete({ open: false, product: null })
        } catch (error) {
            console.error('Delete error:', error)
        }
    }, [confirmDelete.product, deleteProduct])

    const clearSearch = useCallback(() => {
        setSearchTerm('')
        setCurrentPage(1)
    }, [])

    const clearFilters = useCallback(() => {
        setFilterStatus('all')
        setFilterBrand('all')
        setFilterCategory('all')
        setCurrentPage(1)
    }, [])

    const LoadingSkeleton = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse mr-3" />
                                        <div>
                                            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-1" />
                                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></td>
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

            {/* Delete Confirmation Modal */}
            {confirmDelete.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{confirmDelete.product?.title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDelete({ open: false, product: null })}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={deleteProduct.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteProduct}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                disabled={deleteProduct.isPending}
                            >
                                {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-4">

                {/* Title */}
                <div className="mb-4">
                    <div className="mb-4">
                        <h1 className="title2">Products</h1>
                        <p className="text-gray-600">Manage your product catalog with variants and SKUs</p>
                    </div>
                </div>

                {/* Search Bar and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search products..."
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
                            to="/products/add"
                            className="btn-primary inline-flex items-center justify-center w-full sm:w-auto"
                        >
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </div>
                </div>

                {/* Product Count and Filters */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <p className="text-sm text-gray-600">Total {totalItems} products</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Brand Filter */}
                        <div className="relative">
                            <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={filterBrand}
                                onChange={(e) => setFilterBrand(e.target.value)}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                <option value="all">Brand: All</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <FiGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
                            >
                                <option value="all">Category: All</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>{category.name}</option>
                                ))}
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
                                {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows: {n}</option>))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(filterStatus !== 'all' || filterBrand !== 'all' || filterCategory !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                            >
                                <FiX className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Products Table */}
            <div className="bg-light rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : products.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <FiPackage className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No products yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
                        <div className="mt-6">
                            <Link to="/products/add" className="btn-primary inline-flex items-center">
                                <FiPlus className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </div>
                    </div>
                ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === products.length && products.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
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
                            {products.map((product) => (
                                <tr key={product._id || product.id} className="hover:bg-light">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product._id || product.id)}
                                            onChange={() => handleSelectProduct(product._id || product.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                        src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                                                        alt={product.title}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                        <FiImage className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                                <div className="text-sm text-gray-500">{product.slug}</div>
                                                {product.skus && product.skus.length > 0 && (
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        {product.skus.length} variant{product.skus.length !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">
                                            {brands.find(brand => brand._id === product.brand)?.name || 'No brand'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <FiDollarSign className="inline h-3 w-3" />
                                            {product.basePrice?.toLocaleString() || '0'}
                                        </div>
                                        {product.comparePrice && (
                                            <div className="text-xs text-gray-500 line-through">
                                                <FiDollarSign className="inline h-2 w-2" />
                                                {product.comparePrice.toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={product.status || 'draft'} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(product)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View product details"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-primary hover:text-secondary"
                                                title="Edit product"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete product"
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
                    {selectedProducts.length > 0 && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                {selectedProducts.length} of {products.length} selected
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                            <Pagination
                                currentPage={pagination.page || currentPage}
                                totalPages={totalPages}
                                onPageChange={(p) => setCurrentPage(p)}
                                totalItems={totalItems}
                                pageSize={itemsPerPage}
                                currentPageCount={products.length}
                            />
                        </div>
                    )}
                </>
                )}
            </div>
        </div>
    )
}

export default Products 