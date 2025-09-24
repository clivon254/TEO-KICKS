import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit, FiSearch, FiFilter, FiX, FiList, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import Pagination from '../../components/common/Pagination'
import api from '../../utils/api'


const Roles = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterActive, setFilterActive] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedRoles, setSelectedRoles] = useState([])
    const [confirmDelete, setConfirmDelete] = useState({ open: false, role: null })

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    const params = useMemo(() => {
        const p = {}
        if (debouncedSearch) p.search = debouncedSearch
        if (filterActive !== 'all') p.isActive = filterActive === 'active'
        p.page = currentPage
        p.limit = itemsPerPage
        return p
    }, [debouncedSearch, filterActive, currentPage, itemsPerPage])

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/roles', { params })
            setData(res.data)
        } finally {
            setLoading(false)
        }
    }, [params])

    useEffect(() => { load() }, [load])

    const roles = useMemo(() => data?.data?.roles || [], [data])
    const pagination = useMemo(() => data?.data?.pagination || {}, [data])
    const totalItems = useMemo(() => pagination.total || roles.length, [pagination, roles.length])
    const totalPages = useMemo(() => pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1))), [pagination.totalPages, totalItems, itemsPerPage])

    const handleSelect = (id) => {
        setSelectedRoles((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
    const handleSelectAll = () => {
        setSelectedRoles((prev) => prev.length === roles.length ? [] : roles.map(r => r._id))
    }

    const clearSearch = () => { setSearchTerm(''); setCurrentPage(1) }
    const clearFilters = () => { setFilterActive('all'); setCurrentPage(1) }

    const onDelete = (role) => setConfirmDelete({ open: true, role })
    const confirmDeleteRole = async () => {
        try {
            await api.delete(`/roles/${confirmDelete.role._id}`)
            setConfirmDelete({ open: false, role: null })
            load()
        } catch {}
    }

    const LoadingSkeleton = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" /></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-72 bg-gray-200 rounded animate-pulse" /></td>
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
        <div className="p-4">

            {confirmDelete.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <FiAlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Role</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{confirmDelete.role?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setConfirmDelete({ open: false, role: null })} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={confirmDeleteRole} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-4">
                <div className="mb-4">
                    <div className="mb-4">
                        <h1 className="title2">Roles</h1>
                        <p className="text-gray-600">Manage application roles</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input type="text" placeholder="Search roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                            {searchTerm && (
                                <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search">
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="sm:w-auto">
                        <Link to="/roles/add" className="btn-primary inline-flex items-center justify-center w-full sm:w-auto">
                            <FiPlus className="mr-2 h-4 w-4" />
                            Add Role
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <p className="text-sm text-gray-600">Total {totalItems} roles</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
                                <option value="all">Status: All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="relative">
                            <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
                                {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows: {n}</option>))}
                            </select>
                        </div>
                        {(filterActive !== 'all') && (
                            <button onClick={clearFilters} className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                                <FiX className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="bg-light rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <LoadingSkeleton />
                ) : roles.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No roles</h3>
                        <p className="mt-1 text-sm text-gray-500">Create your first role to get started.</p>
                    </div>
                ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox" checked={selectedRoles.length === roles.length && roles.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 text-primary focus:ring-primary" /></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map((role) => (
                                <tr key={role._id} className="hover:bg-light">
                                    <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={selectedRoles.includes(role._id)} onChange={() => handleSelect(role._id)} className="rounded border-gray-300 text-primary focus:ring-primary" /></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{role.name}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-700">{role.description || '—'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-0.5 rounded text-xs border ${role.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{role.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link to={`/roles/${role._id}/edit`} className="text-primary hover:text-secondary" title="Edit role"><FiEdit className="h-4 w-4" /></Link>
                                            <button onClick={() => onDelete(role)} className="text-red-600 hover:text-red-900" title="Delete role"><FiTrash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedRoles.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">{selectedRoles.length} of {roles.length} selected</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <Pagination currentPage={pagination.currentPage || currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} totalItems={totalItems} pageSize={itemsPerPage} currentPageCount={roles.length} />
                    </div>
                )}
                </>
                )}
            </div>
        </div>
    )
}


export default Roles 

