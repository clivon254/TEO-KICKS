import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiStar, FiCheckCircle, FiXCircle, FiFilter, FiList, FiX } from 'react-icons/fi'
import { useGetPackaging, useDeletePackaging, useSetDefaultPackaging } from '../../hooks/usePackaging'
import Pagination from '../../components/common/Pagination'


const Packaging = () => {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [active, setActive] = useState('all') // all | true | false
  const [isDefault, setIsDefault] = useState('all') // all | true | false
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(false)

  // debounce search like Products
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  const params = useMemo(() => ({
    page,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    active: active === 'all' ? undefined : active === 'true',
    isDefault: isDefault === 'all' ? undefined : isDefault === 'true',
    sort: 'createdAt:desc'
  }), [page, itemsPerPage, debouncedSearch, active, isDefault])

  const { data, isLoading } = useGetPackaging(params)
  const delMutation = useDeletePackaging()
  const setDefaultMutation = useSetDefaultPackaging()

  const list = data?.data?.data?.packaging || data?.data?.packaging || []
  const pagination = data?.data?.data?.pagination || data?.data?.pagination || {}
  const totalItems = pagination.totalItems || pagination.total || list.length

  useEffect(() => { setSelectedIds([]) }, [page, itemsPerPage, debouncedSearch, active, isDefault])

  // When search query changes, reset to first page
  useEffect(() => { setPage(1) }, [debouncedSearch])

  const allSelected = list.length > 0 && selectedIds.length === list.length

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(list.map((x) => x._id))
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) return
    setConfirmDelete(false)
    for (const id of selectedIds) {
      // sequential to keep API simpler
      // eslint-disable-next-line no-await-in-loop
      await delMutation.mutateAsync(id)
    }
    setSelectedIds([])
  }

  const clearFilters = () => {
    setSearchTerm('')
    setActive('all')
    setIsDefault('all')
    setPage(1)
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header + Search + Add */}
      <header className="mb-4">
        <div className="mb-4">
          <h1 className="title2">Packaging</h1>
          <p className="text-gray-600">Manage available packaging options and the standard default</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search packaging..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setPage(1) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="sm:w-auto">
            <button onClick={() => navigate('/packaging/add')} className="btn-primary inline-flex items-center justify-center w-full sm:w-auto">
              <FiPlus className="mr-2 h-4 w-4" />
              Add Packaging
            </button>
          </div>
        </div>

        {/* Count and Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <p className="text-sm text-gray-600">Total {totalItems} options</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Status */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
              <select
                value={active}
                onChange={(e) => { setActive(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
              >
                <option value="all">Status: All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Default */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
              <select
                value={isDefault}
                onChange={(e) => { setIsDefault(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
              >
                <option value="all">Default: Any</option>
                <option value="true">Default only</option>
                <option value="false">Non-default</option>
              </select>
            </div>

            {/* Rows per page */}
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setPage(1) }}
                className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs"
              >
                {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows: {n}</option>))}
              </select>
            </div>

            {/* Clear Filters */}
            {(active !== 'all' || isDefault !== 'all') && (
              <button onClick={clearFilters} className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                <FiX className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-4" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                    No packaging options. Create one to get started.
                  </td>
                </tr>
              ) : (
                list.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.includes(row._id)} onChange={() => toggleSelect(row._id)} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3">KSh {Number(row.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {row.isActive ? (
                        <span className="inline-flex items-center text-green-700 bg-green-100 rounded-full px-2 py-0.5 text-xs font-medium"><FiCheckCircle className="mr-1" /> Active</span>
                      ) : (
                        <span className="inline-flex items-center text-gray-700 bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium"><FiXCircle className="mr-1" /> Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.isDefault ? (
                        <span className="inline-flex items-center text-purple-700 bg-purple-100 rounded-full px-2 py-0.5 text-xs font-medium"><FiStar className="mr-1" /> Standard</span>
                      ) : (
                        <button onClick={() => setDefaultMutation.mutate(row._id)} className="text-primary hover:underline text-sm">Set as standard</button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => navigate(`/packaging/${row._id}/edit`)} className="text-gray-600 hover:text-gray-900"><FiEdit2 /></button>
                        <button onClick={() => { setSelectedIds([row._id]); setConfirmDelete(true) }} className="text-red-600 hover:text-red-700"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t flex items-center justify-end">
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage || page}
              totalPages={pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)))}
              onPageChange={setPage}
              totalItems={totalItems}
              pageSize={itemsPerPage}
              currentPageCount={list.length}
            />
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Delete Packaging</h3>
            <p className="text-gray-600 mb-6">
              {(() => {
                const names = list.filter(r => selectedIds.includes(r._id)).map(r => r.name)
                return names.length === 1
                  ? <>Are you sure you want to delete <span className="font-semibold">{names[0]}</span>?</>
                  : <>Are you sure you want to delete {names.length} packaging option(s)?</>
              })()}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={delMutation.isPending} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                {delMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default Packaging


