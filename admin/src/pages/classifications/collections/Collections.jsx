import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi'


const Collections = () => {
    const [collections, setCollections] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        isActive: true,
        featured: false
    })


    // Mock data - replace with actual API calls
    useEffect(() => {
        const mockCollections = [
            { id: 1, name: 'Summer Collection 2024', description: 'Light and breathable footwear for summer', image: '', isActive: true, featured: true, productCount: 15 },
            { id: 2, name: 'Winter Boots', description: 'Warm and comfortable boots for cold weather', image: '', isActive: true, featured: false, productCount: 8 },
            { id: 3, name: 'Athletic Series', description: 'Performance footwear for sports and fitness', image: '', isActive: true, featured: true, productCount: 22 },
            { id: 4, name: 'Casual Wear', description: 'Everyday comfortable shoes', image: '', isActive: false, featured: false, productCount: 5 },
        ]
        setCollections(mockCollections)
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
        // TODO: Implement API call to create/update collection
        console.log('Form data:', formData)
        
        if (showEditModal) {
            // Update existing collection
            setCollections(prev => prev.map(collection => 
                collection.id === selectedCollection.id ? { ...collection, ...formData } : collection
            ))
            setShowEditModal(false)
        } else {
            // Add new collection
            const newCollection = {
                id: Date.now(),
                ...formData,
                productCount: 0
            }
            setCollections(prev => [...prev, newCollection])
            setShowAddModal(false)
        }
        
        setFormData({ name: '', description: '', image: '', isActive: true, featured: false })
        setSelectedCollection(null)
    }


    const handleEdit = (collection) => {
        setSelectedCollection(collection)
        setFormData({
            name: collection.name,
            description: collection.description,
            image: collection.image,
            isActive: collection.isActive,
            featured: collection.featured
        })
        setShowEditModal(true)
    }


    const handleDelete = async (collectionId) => {
        if (window.confirm('Are you sure you want to delete this collection?')) {
            // TODO: Implement API call to delete collection
            setCollections(prev => prev.filter(collection => collection.id !== collectionId))
        }
    }


    const filteredCollections = collections.filter(collection => {
        const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            collection.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || 
                            (filterStatus === 'active' && collection.isActive) ||
                            (filterStatus === 'inactive' && !collection.isActive)
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
                    <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
                    <p className="text-gray-600">Manage your product collections</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary inline-flex items-center"
                >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Collection
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
                                placeholder="Search collections..."
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
                            <option value="all">All Collections</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>


            {/* Collections List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Collection
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Products
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Featured
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCollections.map((collection) => (
                                <tr key={collection.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 flex-shrink-0">
                                                {collection.image ? (
                                                    <img className="h-12 w-12 rounded-lg object-cover" src={collection.image} alt={collection.name} />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-500">{collection.name.charAt(0)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {collection.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {collection.productCount} products
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            collection.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {collection.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            collection.featured 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {collection.featured ? 'Featured' : 'Regular'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(collection)}
                                                className="text-primary hover:text-secondary"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(collection.id)}
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
                                {showEditModal ? 'Edit Collection' : 'Add New Collection'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Collection Name
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
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image.jpg"
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
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-900">
                                        Featured Collection
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false)
                                            setShowEditModal(false)
                                            setFormData({ name: '', description: '', image: '', isActive: true, featured: false })
                                            setSelectedCollection(null)
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


export default Collections 