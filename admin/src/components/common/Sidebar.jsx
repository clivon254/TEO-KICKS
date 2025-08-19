import { NavLink } from 'react-router-dom'
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
    FiTruck
} from 'react-icons/fi'

const Sidebar = () => {
    const navigation = [
        { name: 'Dashboard', href: '/', icon: FiHome },
        { name: 'Products', href: '/products', icon: FiPackage },
        { name: 'Categories', href: '/categories', icon: FiGrid },
        { name: 'Brands', href: '/brands', icon: FiTag },
        { name: 'Orders', href: '/orders', icon: FiShoppingBag },
        { name: 'Customers', href: '/customers', icon: FiUsers },
        { name: 'Inventory', href: '/inventory', icon: FiTruck },
        { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
        { name: 'Reports', href: '/reports', icon: FiFileText },
        { name: 'Settings', href: '/settings', icon: FiSettings },
    ]

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
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
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar 