import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import { 
    FiHome, 
    FiPackage, 
    FiGrid, 
    FiTag, 
    FiShoppingBag, 
    FiUsers, 
    FiSettings,
    FiBarChart2,
    FiFileText,
    FiTruck,
    FiLogOut,
    FiChevronDown,
    FiChevronRight,
    FiLayers,
    FiX
} from 'react-icons/fi'


const Sidebar = ({ isSidebarOpen = false, toggleSidebar = () => {} }) => {
    const { logout } = useAuth()
    const [isClassificationOpen, setIsClassificationOpen] = useState(false)

    const navigation = [
        { name: 'Dashboard', href: '/', icon: FiHome },
        { name: 'Products', href: '/products', icon: FiPackage },
        { name: 'Orders', href: '/orders', icon: FiShoppingBag },
        { name: 'Customers', href: '/customers', icon: FiUsers },
        { name: 'Inventory', href: '/inventory', icon: FiTruck },
        { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
        { name: 'Reports', href: '/reports', icon: FiFileText },
        { name: 'Settings', href: '/settings', icon: FiSettings },
    ]

    const classificationItems = [
        { name: 'Categories', href: '/categories', icon: FiGrid },
        { name: 'Brands', href: '/brands', icon: FiTag },
        { name: 'Collections', href: '/collections', icon: FiLayers },
        { name: 'Tags', href: '/tags', icon: FiTag },
    ]


    const handleLogout = async () => {
        await logout()
    }


    const toggleClassification = () => {
        setIsClassificationOpen(!isClassificationOpen)
    }


    return (
        <>
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 h-screen transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0 lg:z-auto lg:flex lg:flex-shrink-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col w-64 h-full">
                    <div className="flex flex-col h-full bg-white border-r border-gray-200 relative">
                        
                        {/* Mobile close button */}
                        {isSidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="absolute top-4 right-4 p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden z-10"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        )}
                    {/* Main navigation area */}
                    <div className="flex-1 flex flex-col pt-5 pb-20 overflow-y-auto">
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => {
                                            // Close sidebar on mobile when navigating
                                            if (window.innerWidth < 1024) {
                                                toggleSidebar()
                                            }
                                        }}
                                        className={({ isActive }) =>
                                            `group flex items-center gap-x-3 px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                isActive
                                                    ? 'bg-secondary-button text-primary'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`
                                        }
                                    >
                                        <Icon
                                            className={({ isActive }) =>
                                                `flex-shrink-0 h-6 w-6 ${
                                                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                                                }`
                                            }
                                        />
                                        {item.name}
                                    </NavLink>
                                )
                            })}

                            {/* Classification Section */}
                            <div className="">
                                <button
                                    onClick={toggleClassification}
                                    className="group flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-x-3">
                                        <FiLayers className="flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                                        Classification
                                    </div>
                                    {isClassificationOpen ? (
                                        <FiChevronDown className="flex-shrink-0 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                    ) : (
                                        <FiChevronRight className="flex-shrink-0 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                    )}
                                </button>

                                {/* Classification Sub-items */}
                                {isClassificationOpen && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {classificationItems.map((item) => {
                                            const Icon = item.icon
                                            return (
                                                <NavLink
                                                    key={item.name}
                                                    to={item.href}
                                                    onClick={() => {
                                                        // Close sidebar on mobile when navigating
                                                        if (window.innerWidth < 1024) {
                                                            toggleSidebar()
                                                        }
                                                    }}
                                                    className={({ isActive }) =>
                                                        `group flex items-center gap-x-3 px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                            isActive
                                                                ? 'bg-secondary-button text-primary'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`
                                                    }
                                                >
                                                    <Icon
                                                        className={({ isActive }) =>
                                                            `flex-shrink-0 h-5 w-5 ${
                                                                isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                                                            }`
                                                        }
                                                    />
                                                    {item.name}
                                                </NavLink>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>

                    {/* absolute bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-start gap-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors duration-200"
                        >
                            <FiLogOut className="flex-shrink-0 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}


export default Sidebar 