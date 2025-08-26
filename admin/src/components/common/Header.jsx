import { useAuth } from '../../contexts/AuthContext'
import { FiUser, FiBell, FiSearch, FiMenu, FiX, FiLogOut, FiShoppingCart } from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useGetCart } from '../../hooks/useCart'


const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Get cart data for count
    const { data: cartData } = useGetCart()
    const cartItems = cartData?.data?.items || []
    const cartCount = cartItems.length


    const handleLogout = async () => {
        await logout()
        setIsUserDropdownOpen(false)
    }


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])


    return (
        <header className="bg-white shadow-lg border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Left side - Logo and Mobile Menu */}
                    <div className="flex items-center space-x-4">
                        
                        {/* Mobile menu button */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                        >
                            {isSidebarOpen ? (
                                <FiX className="h-6 w-6" />
                            ) : (
                                <FiMenu className="h-6 w-6" />
                            )}
                        </button>


                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <img src={logo} alt="TEO KICKS" className="h-8 w-auto" />
                        </div>

                    </div>


                    {/* Right side - User menu and notifications */}
                    <div className="flex items-center space-x-4">
                        
                        {/* Cart */}
                        <button 
                            onClick={() => navigate('/cart')}
                            className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md relative"
                        >
                            <FiShoppingCart className="h-6 w-6" />
                        </button>

                        {/* Notifications */}
                        <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md">
                            <FiBell className="h-6 w-6" />
                        </button>


                        {/* User dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <FiUser className="h-5 w-5 text-primary" />
                                    )}
                                </div>
                            </button>


                            {/* Dropdown menu */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <FiLogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                    
                </div>
            </div>
        </header>
    )
}


export default Header 