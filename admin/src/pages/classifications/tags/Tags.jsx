import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi'


const Tags = () => {
    const [tags, setTags] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedTag, setSelectedTag] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        isActive: true
    })


    // Mock data - replace with actual API calls
    useEffect(() => {
        const mockTags = [
            { id: 1, name: 'New Arrival', description: 'Recently added products', color: '#10B981', isActive: true, productCount: 12 },
            { id: 2, name: 'Sale', description: 'Products on discount', color: '#EF4444', isActive: true, productCount: 8 },
            { id: 3, name: 'Limited Edition', description: 'Exclusive limited products', color: '#8B5CF6', isActive: true, productCount: 5 },
            { id: 4, name: 'Best Seller', description: 'Top selling products', color: '#F59E0B', isActive: true, productCount: 15 },
            { id: 5, name: 'Out of Stock', description: 'Currently unavailable', color: '#6B7280', isActive: false, productCount: 3 },
        ]
        setTags(mockTags)
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
        // TODO: Implement API call to create/update tag
        console.log('Form data:', formData)
        
        if (showEditModal) {
            // Update existing tag
            setTags(prev => prev.map(tag => 
                tag.id === selectedTag.id ? { ...tag, ...formData } : tag
            ))
            setShowEditModal(false)
        } else {
            // Add new tag
            const newTag = {
                id: Date.now(),
                ...formData,
                productCount: 0
            }
            setTags(prev => [...prev, newTag])
            setShowAddModal(false)
        }
        
        setFormData({ name: '', description: '', color: '#3B82F6', isActive: true })
        setSelectedTag(null)
    }


    const handleEdit = (tag) => {
        setSelectedTag(tag)
        setFormData({
            name: tag.name,
            description: tag.description,
            color: tag.color,
            isActive: tag.isActive
        })
        setShowEditModal(true)
    }


    const handleDelete = async (tagId) => {
        if (window.confirm('Are you sure you want to delete this tag?')) {
            // TODO: Implement API call to delete tag
            setTags(prev => prev.filter(tag => tag.id !== tagId))
        }
    }


    const filteredTags = tags.filter(tag => {
        const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tag.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || 
                            (filterStatus === 'active' && tag.isActive) ||
                            (filterStatus === 'inactive' && !tag.isActive)
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
                    <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
                    <p className="text-gray-600">Manage your product tags</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary inline-flex items-center"
                >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Tag
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
                                placeholder="Search tags..."
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
                            <option value="all">All Tags</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>


            {/* Tags List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tag
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Color
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
                            {filteredTags.map((tag) => (
                                <tr key={tag.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div 
                                                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                                style={{ backgroundColor: tag.color }}
                                            >
                                                {tag.name.charAt(0)}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {tag.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div 
                                                className="h-6 w-6 rounded border border-gray-300"
                                                style={{ backgroundColor: tag.color }}
                                            ></div>
                                            <span className="ml-2 text-sm text-gray-500">{tag.color}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {tag.productCount} products
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            tag.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {tag.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(tag)}
                                                className="text-primary hover:text-secondary"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
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
                                {showEditModal ? 'Edit Tag' : 'Add New Tag'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tag Name
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
                                        Color
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            className="h-10 w-16 border border-gray-300 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="#3B82F6"
                                        />
                                    </div>
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
                                            setFormData({ name: '', description: '', color: '#3B82F6', isActive: true })
                                            setSelectedTag(null)
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


export default Tags 