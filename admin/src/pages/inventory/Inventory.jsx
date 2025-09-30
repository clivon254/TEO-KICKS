import { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiFilter, FiList, FiX, FiPackage, FiArrowUpCircle, FiArrowDownCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { useGetProducts, useUpdateSKU } from '../../hooks/useProducts'
import { useGetBrands } from '../../hooks/useBrands'
import { useGetCategories } from '../../hooks/useCategories'
import { useGetVariants } from '../../hooks/useVariants'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'


const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterBrand, setFilterBrand] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [adjusting, setAdjusting] = useState({ open: false, product: null, sku: null })
  const [adjustForm, setAdjustForm] = useState({ type: 'increase', amount: 1, reason: 'receive', note: '' })
  const [skuManagement, setSkuManagement] = useState({ open: false, product: null, sku: null })
  const [skuForm, setSkuForm] = useState({
    price: '',
    stock: '',
    lowStockThreshold: '',
    allowPreOrder: false,
    preOrderStock: '',
    barcode: ''
  })
  const [expanded, setExpanded] = useState({})


  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])


  const params = useMemo(() => {
    const p = {}
    if (filterBrand !== 'all') p.brand = filterBrand
    if (filterCategory !== 'all') p.category = filterCategory
    if (debouncedSearch) p.search = debouncedSearch
    p.page = currentPage
    p.limit = itemsPerPage
    return p
  }, [filterBrand, filterCategory, debouncedSearch, currentPage, itemsPerPage])


  const { data, isLoading } = useGetProducts(params)
  const { data: brandsData } = useGetBrands({ limit: 100 })
  const { data: categoriesData } = useGetCategories({ limit: 100 })
  const { data: variantsData } = useGetVariants({ limit: 1000 })
  const updateSku = useUpdateSKU()


  const products = useMemo(() => data?.data || [], [data])
  const pagination = useMemo(() => data?.pagination || {}, [data])
  const totalItems = useMemo(() => pagination.totalDocs || products.length, [pagination, products.length])
  const totalPages = useMemo(() => pagination.totalPages || Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1))), [pagination.totalPages, totalItems, itemsPerPage])
  const brands = useMemo(() => brandsData?.data?.data?.brands || [], [brandsData])
  const categories = useMemo(() => categoriesData?.data?.data?.categories || [], [categoriesData])


  const toggleProduct = (productId) => {
    setExpanded((prev) => ({ ...prev, [productId]: !prev[productId] }))
  }

  // Build quick lookups for variant name and option value by id
  const variantNameById = useMemo(() => {
    const list = variantsData?.data?.data || variantsData?.data || variantsData || []
    const map = {}
    list.forEach(v => { map[v._id] = v.name })
    return map
  }, [variantsData])

  const optionValueById = useMemo(() => {
    const list = variantsData?.data?.data || variantsData?.data || variantsData || []
    const map = {}
    list.forEach(v => {
      ;(v.options || []).forEach(opt => { map[opt._id] = opt.value })
    })
    return map
  }, [variantsData])

  const renderSkuAttributes = (sku) => {
    const attrs = (sku.attributes || []).map(a => {
      const variantName = variantNameById[a.variantId] || 'Option'
      const optionValue = optionValueById[a.optionId] || '-'
      return `${variantName}: ${optionValue}`
    })
    return attrs.length ? attrs.join(', ') : (sku.skuCode || '-')
  }


  const openAdjust = (product, sku) => {
    setAdjusting({ open: true, product, sku })
    setAdjustForm({ type: 'increase', amount: 1, reason: 'receive', note: '' })
  }

  const openSkuManagement = (product, sku) => {
    setSkuManagement({ open: true, product, sku })
    setSkuForm({
      price: sku.price !== undefined && sku.price !== null ? sku.price.toString() : '',
      stock: sku.stock !== undefined && sku.stock !== null ? sku.stock.toString() : '',
      lowStockThreshold: sku.lowStockThreshold !== undefined && sku.lowStockThreshold !== null ? sku.lowStockThreshold.toString() : '',
      allowPreOrder: sku.allowPreOrder || false,
      preOrderStock: sku.preOrderStock !== undefined && sku.preOrderStock !== null ? sku.preOrderStock.toString() : '',
      barcode: sku.barcode || ''
    })
  }


  const closeAdjust = () => setAdjusting({ open: false, product: null, sku: null })

  const closeSkuManagement = () => setSkuManagement({ open: false, product: null, sku: null })


  const submitAdjust = async () => {
    try {
      const { product, sku } = adjusting
      if (!product || !sku) return
      const delta = (adjustForm.type === 'increase' ? 1 : -1) * Math.max(1, Number(adjustForm.amount || 1))
      const newStock = Math.max(0, Number(sku.stock || 0) + delta)
      await updateSku.mutateAsync({ productId: product._id, skuId: sku._id, skuData: { stock: newStock } })
      toast.success('Stock adjusted')
      closeAdjust()
    } catch (e) {
      toast.error('Failed to adjust stock')
    }
  }

  const submitSkuUpdate = async () => {
    try {
      const { product, sku } = skuManagement
      if (!product || !sku) return
      
      const skuData = {
        price: parseFloat(skuForm.price) || 0,
        stock: parseInt(skuForm.stock) || 0,
        lowStockThreshold: parseInt(skuForm.lowStockThreshold) || 5,
        allowPreOrder: skuForm.allowPreOrder,
        preOrderStock: parseInt(skuForm.preOrderStock) || 0,
        barcode: skuForm.barcode
      }
      
      await updateSku.mutateAsync({ productId: product._id, skuId: sku._id, skuData })
      toast.success('SKU updated successfully')
      closeSkuManagement()
    } catch (e) {
      toast.error('Failed to update SKU')
    }
  }


  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="title2">Inventory</h1>
        <p className="text-gray-600">Manage SKUs, stock levels, and low‑stock thresholds</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products or SKU code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search">
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
          <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setCurrentPage(1) }} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
            <option value="all">Brand: All</option>
            {brands.map((b) => (<option key={b._id} value={b._id}>{b.name}</option>))}
          </select>
        </div>

        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1) }} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
            <option value="all">Category: All</option>
            {categories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
        </div>

        <div className="relative">
          <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }} className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-xs">
            {[5, 10, 20, 50].map(n => (<option key={n} value={n}>Rows: {n}</option>))}
          </select>
        </div>
      </div>

      <div className="bg-light rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading inventory...</div>
        ) : products.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center"><FiPackage className="h-6 w-6 text-primary" /></div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Adjust filters or add products with SKUs to manage inventory.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 [&>*]:py-3">
            {products.map((p) => (
              <div key={p._id} className="px-4">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => toggleProduct(p._id)}
                  aria-expanded={!!expanded[p._id]}
                >
                  <div>
                    <h4 className="text-sm font-semibold text-primary">{p.title}</h4>
                    <div className="text-xs text-gray-500">{(p.skus || []).reduce((sum, s) => sum + (Number(s.stock) || 0), 0)} units • {p.trackInventory ? 'Tracking' : 'Not tracking'}</div>
                  </div>

                  <div className="ml-4 text-gray-500">
                    {expanded[p._id] ? (
                      <FiChevronDown className="h-4 w-4" />
                    ) : (
                      <FiChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {expanded[p._id] && (
                  <div className="overflow-x-auto mt-3">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                          <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Low Stock</th>
                          <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Pre‑order</th>
                          <th className="px-4 py-2 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(p.skus || []).map((sku) => (
                          <tr key={sku._id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{renderSkuAttributes(sku)}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-900">{sku.stock ?? 0}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{sku.lowStockThreshold ?? 0}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{sku.allowPreOrder ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-2 text-right text-sm">
                              <div className="inline-flex gap-2">
                                <button onClick={() => openSkuManagement(p, sku)} className="btn-outline px-3 py-1.5 text-xs flex items-center gap-1">
                                  <FiPackage className="h-4 w-4" />
                                  Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="px-2 py-3">
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

      {adjusting.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Adjust Stock</h3>
            <p className="text-sm text-gray-600 mb-4">{adjusting.product?.title} • {adjusting.sku?.skuCode}</p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setAdjustForm((f) => ({ ...f, type: 'increase' }))} className={`px-3 py-2 rounded-lg border text-sm flex items-center justify-center gap-1 ${adjustForm.type === 'increase' ? 'bg-secondary-button text-primary border-secondary-button' : 'bg-white text-gray-700 border-gray-300'}`}>
                  <FiArrowUpCircle className="h-4 w-4" /> Increase
                </button>
                <button onClick={() => setAdjustForm((f) => ({ ...f, type: 'decrease' }))} className={`px-3 py-2 rounded-lg border text-sm flex items-center justify-center gap-1 ${adjustForm.type === 'decrease' ? 'bg-secondary-button text-primary border-secondary-button' : 'bg-white text-gray-700 border-gray-300'}`}>
                  <FiArrowDownCircle className="h-4 w-4" /> Decrease
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Amount</label>
                <input type="number" min={1} value={adjustForm.amount} onChange={(e) => setAdjustForm((f) => ({ ...f, amount: e.target.value }))} className="input" />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Reason</label>
                <select value={adjustForm.reason} onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="receive">Receive</option>
                  <option value="return">Return</option>
                  <option value="correction">Correction</option>
                  <option value="damage">Damage</option>
                  <option value="shrink">Shrink</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Note (optional)</label>
                <input type="text" value={adjustForm.note} onChange={(e) => setAdjustForm((f) => ({ ...f, note: e.target.value }))} className="input" />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={submitAdjust} disabled={updateSku.isPending} className="btn-primary flex-1 py-2">{updateSku.isPending ? 'Saving...' : 'Save'}</button>
                <button onClick={closeAdjust} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SKU Management Modal */}
      {skuManagement.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">SKU Management</h3>
              <button onClick={closeSkuManagement} className="text-gray-400 hover:text-gray-600">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Product:</strong> {skuManagement.product?.title}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>SKU:</strong> {skuManagement.sku?.skuCode}
              </p>
              
              {/* Variant and Options Display */}
              {skuManagement.sku?.attributes && skuManagement.sku.attributes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skuManagement.sku.attributes.map(attr => {
                    // Find variant in the variants array
                    const variant = variantsData?.data?.data?.find(v => v._id === attr.variantId) || 
                                  variantsData?.data?.find(v => v._id === attr.variantId) ||
                                  variantsData?.find(v => v._id === attr.variantId)
                    const option = variant?.options?.find(o => o._id === attr.optionId)
                    return (
                      <span key={attr._id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {variant?.name || 'Unknown'}: {option?.value || 'Unknown'}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  Default SKU
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Price and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={skuForm.price}
                    onChange={(e) => setSkuForm(prev => ({ ...prev, price: e.target.value }))}
                    min="0"
                    step="0.01"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={skuForm.stock}
                    onChange={(e) => setSkuForm(prev => ({ ...prev, stock: e.target.value }))}
                    min="0"
                    className="input"
                  />
                </div>
              </div>

              {/* Low Stock Threshold and Barcode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    value={skuForm.lowStockThreshold}
                    onChange={(e) => setSkuForm(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                    min="0"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={skuForm.barcode}
                    onChange={(e) => setSkuForm(prev => ({ ...prev, barcode: e.target.value }))}
                    className="input"
                    placeholder="Enter barcode"
                  />
                </div>
              </div>

              {/* Pre-order Settings */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={skuForm.allowPreOrder}
                    onChange={(e) => setSkuForm(prev => ({ ...prev, allowPreOrder: e.target.checked }))}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className="ml-2 text-sm text-gray-700">Allow Pre-order</label>
                </div>

                {skuForm.allowPreOrder && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pre-order Stock
                    </label>
                    <input
                      type="number"
                      value={skuForm.preOrderStock}
                      onChange={(e) => setSkuForm(prev => ({ ...prev, preOrderStock: e.target.value }))}
                      min="0"
                      className="input"
                    />
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Stock Status:</span>
                  <span className={`font-medium ${
                    parseInt(skuForm.stock) > (parseInt(skuForm.lowStockThreshold) || 5) 
                      ? 'text-green-600' 
                      : parseInt(skuForm.stock) > 0 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {parseInt(skuForm.stock) > (parseInt(skuForm.lowStockThreshold) || 5) 
                      ? 'In Stock' 
                      : parseInt(skuForm.stock) > 0 
                      ? 'Low Stock' 
                      : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={closeSkuManagement} className="btn-outline">
                  Cancel
                </button>
                <button 
                  onClick={submitSkuUpdate} 
                  disabled={updateSku.isPending}
                  className="btn-primary"
                >
                  {updateSku.isPending ? 'Updating...' : 'Update SKU'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default Inventory

