import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi'


const Brands = () => {
    const [brands, setBrands] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedBrand, setSelectedBrand] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: '',
        website: '',
        isActive: true
    })


    // Mock data - replace with actual API calls
    useEffect(() => {
        const mockBrands = [
            { id: 1, name: 'Nike', description: 'Just Do It', logo: '', website: 'https://nike.com', isActive: true, productCount: 25 },
            { id: 2, name: 'Adidas', description: 'Impossible is Nothing', logo: '', website: 'https://adidas.com', isActive: true, productCount: 18 },
            { id: 3, name: 'Puma', description: 'Forever Faster', logo: '', website: 'https://puma.com', isActive: false, productCount: 8 },
            { id: 4, name: 'New Balance', description: 'Fearlessly Independent', logo: '', website: 'https://newbalance.com', isActive: true, productCount: 12 },
        ]
        setBrands(mockBrands)
        setIsLoading(false)
    }, [])


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        // TODO: Implement API call to create/update brand
        console.log('Form data:', formData)
        
        if (showEditModal) {
            // Update existing brand
            setBrands(prev => prev.map(brand => 
                brand.id === selectedBrand.id ? { ...brand, ...formData } : brand
            ))
            setShowEditModal(false)
        } else {
            // Add new brand
            const newBrand = {
                id: Date.now(),
                ...formData,
                productCount: 0
            }
            setBrands(prev => [...prev, newBrand])
            setShowAddModal(false)
        }
        
        setFormData({ name: '', description: '', logo: '', website: '', isActive: true })
        setSelectedBrand(null)
    }


    const handleEdit = (brand) => {
        setSelectedBrand(brand)
        setFormData({
            name: brand.name,
            description: brand.description,
            logo: brand.logo,
            website: brand.website,
            isActive: brand.isActive
        })
        setShowEditModal(true)
    }


    const handleDelete = async (brandId) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            // TODO: Implement API call to delete brand
            setBrands(prev => prev.filter(brand => brand.id !== brandId))
        }
    }


    const filteredBrands = brands.filter(brand => {
        const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            brand.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || 
                            (filterStatus === 'active' && brand.isActive) ||
                            (filterStatus === 'inactive' && !brand.isActive)
        return matchesSearch && matchesFilter
    })


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }


    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                    <p className="text-gray-600">Manage your product brands</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary inline-flex items-center"
                >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Brand
                </button>
            </div>


            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search brands..."
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
                            <option value="all">All Brands</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>


            {/* Brands List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Website
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
                            {filteredBrands.map((brand) => (
                                <tr key={brand.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {brand.logo ? (
                                                    <img className="h-10 w-10 rounded-lg object-cover" src={brand.logo} alt={brand.name} />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-500">{brand.name.charAt(0)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {brand.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {brand.website && (
                                            <a 
                                                href={brand.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:text-secondary"
                                            >
                                                Visit Website
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {brand.productCount} products
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            brand.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {brand.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(brand)}
                                                className="text-primary hover:text-secondary"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
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
            </div>


            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {showEditModal ? 'Edit Brand' : 'Add New Brand'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand Name
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
                                        Logo URL
                                    </label>
                                    <input
                                        type="url"
                                        name="logo"
                                        value={formData.logo}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website URL
                                    </label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com"
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
                                            setFormData({ name: '', description: '', logo: '', website: '', isActive: true })
                                            setSelectedBrand(null)
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


export default Brands 