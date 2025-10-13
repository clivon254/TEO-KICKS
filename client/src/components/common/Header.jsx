import { useAuth } from '../../contexts/AuthContext'
import { FiUser, FiBell, FiMenu, FiX, FiLogOut, FiShoppingCart } from 'react-icons/fi'
import { useGetCart } from '../../hooks/useCart'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'


const Header = () => {

  const { user, logout } = useAuth()

  const navigate = useNavigate()

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const dropdownRef = useRef(null)


  const { data: cartData } = useGetCart({ enabled: !!user })

  const cartItems = cartData?.data?.data?.items || cartData?.data?.items || []

  const cartItemCount = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0)
    : 0


  const handleLogout = async () => {
    await logout()
    setIsUserDropdownOpen(false)
  }


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
          
          <div className="flex items-center space-x-4">
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            >
              {isSidebarOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>

            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}> 
              <img src={logo} alt="TEO KICKS" className="h-8 w-auto" />
            </div>
          </div>


          <div className="flex items-center space-x-4">
            
            <button 
              onClick={() => navigate('/cart')}
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md relative"
              aria-label="Cart"
            >
              <div className="relative">
                <FiShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </div>
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md" aria-label="Notifications">
              <FiBell className="h-6 w-6" />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'Not signed in'}</p>
                  </div>

                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <FiLogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign In
                    </button>
                  )}
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


