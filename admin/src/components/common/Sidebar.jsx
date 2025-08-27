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
        { name: 'Variants', href: '/variants', icon: FiGrid },
        { name: 'Coupons', href: '/coupons', icon: FiTag },
        { name: 'Orders', href: '/orders', icon: FiShoppingBag },
        { name: 'Customers', href: '/customers', icon: FiUsers },
        { name: 'Inventory', href: '/inventory', icon: FiTruck },
        { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
        { name: 'Reports', href: '/reports', icon: FiFileText },
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
            {/* Overlay for mobile */}
                <div 
                className={`fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
                    isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                    onClick={toggleSidebar}
                />

            {/* Sidebar */}
            <aside
                className={`
                    fixed z-50 top-0 left-0 h-screen w-56 bg-white shadow-lg border-r border-gray-200
                    transform transition-transform duration-300
                    flex flex-col
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:static lg:translate-x-0 lg:w-[25%] lg:max-w-56 lg:h-full lg:shadow-none lg:border-r-4 lg:bg-light
                    overflow-hidden
                `}
                style={{ minWidth: "180px", maxWidth: "280px" }}
            >
                {/* Close button for mobile */}
                <div className="flex items-center justify-end lg:hidden p-4">
                            <button
                                onClick={toggleSidebar}
                        className="text-red-600 hover:bg-red-50 rounded-lg p-1 transition"
                        aria-label="Close sidebar"
                            >
                        <FiX className="h-7 w-7" />
                            </button>
                </div>

                {/* Friendly heading */}
                <div className="px-4 pt-2 pb-4">
                    <h2 className="text-lg font-bold text-primary mb-1">TEO KICKS ADMIN</h2>
                    <p className="text-xs text-gray-500">Your business, powered by innovation.</p>
                </div>

                {/* Main navigation area - scrollable */}
                <nav className="flex flex-col gap-1 px-3 pb-32 flex-1 overflow-y-auto">
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
                                    `flex items-center gap-3 px-3 py-2 rounded-lg font-small text-xs transition ${
                                                    isActive
                                            ? "bg-secondary-button text-primary"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" />
                                            {item.name}
                                        </NavLink>
                                    )
                                })}

                                {/* Classification Section */}
                    <div className="mt-2">
                                    <button
                                        onClick={toggleClassification}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-lg font-small text-xs transition text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    >
                            <div className="flex items-center gap-3">
                                <FiLayers className="h-5 w-5" />
                                            Classification
                                        </div>
                                        {isClassificationOpen ? (
                                <FiChevronDown className="h-4 w-4" />
                                        ) : (
                                <FiChevronRight className="h-4 w-4" />
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
                                                `flex items-center gap-3 px-3 py-2 rounded-lg font-small text-xs transition ${
                                                                isActive
                                                        ? "bg-secondary-button text-primary"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                }`
                                            }
                                        >
                                            <Icon className="h-4 w-4" />
                                                        {item.name}
                                                    </NavLink>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </nav>

                {/* Bottom section - absolutely positioned */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                            <div className="space-y-2">
                                {/* Settings button */}
                                <NavLink
                                    to="/settings"
                                    onClick={() => {
                                        // Close sidebar on mobile when navigating
                                if (window.innerWidth < 1024) {
                                            toggleSidebar()
                                        }
                                    }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition"
                                >
                            <FiSettings className="h-5 w-5" />
                                    Settings
                                </NavLink>
                                
                                {/* Logout button */}
                                <button
                                    onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition"
                                >
                            <FiLogOut className="h-5 w-5" />
                                    Logout
                                </button>
                    </div>
                </div>
            </aside>
        </>
    )
}


export default Sidebar 