import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useState } from 'react'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'

// Pages
import Login from './pages/auth/Login'
import OTPVerification from './pages/auth/OTPVerification'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import GoogleCallback from './pages/auth/GoogleCallback'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import Categories from './pages/classifications/category/Categories'
import AddCategory from './pages/classifications/category/AddCategory'
import EditCategory from './pages/classifications/category/EditCategory'
import Brands from './pages/classifications/Brand/Brands'
import Collections from './pages/classifications/collection/Collections'
import Tags from './pages/classifications/tag/Tags'
import AddTag from './pages/classifications/tag/AddTag'
import EditTag from './pages/classifications/tag/EditTag'
import AddBrand from './pages/classifications/Brand/AddBrand'
import EditBrand from './pages/classifications/Brand/EditBrand'
import AddCollection from './pages/classifications/collection/AddCollection'
import EditCollection from './pages/classifications/collection/EditCollection'
import Variants from './pages/variant/Variants'
import AddVariant from './pages/variant/AddVariant'
import EditVariant from './pages/variant/EditVariant'
import Products from './pages/products/Products'
import AddProduct from './pages/products/AddProduct'
import EditProduct from './pages/products/EditProduct'
import ProductDetails from './pages/products/ProductDetails'
import Inventory from './pages/inventory/Inventory'
import Cart from './pages/Cart'
import ProductDetailDemo from './components/demo/ProductDetailDemo'
import Coupons from './pages/coupons/Coupons'
import Checkout from './pages/Checkout'
import Orders from './pages/orders/Orders'
import OrderDetail from './pages/orders/OrderDetail'
import AddCoupon from './pages/coupons/AddCoupon'
import EditCoupon from './pages/coupons/EditCoupon'
import PaymentStatus from './pages/PaymentStatus'
import Packaging from './pages/packaging/Packaging'
import AddPackaging from './pages/packaging/AddPackaging'
import EditPackaging from './pages/packaging/EditPackaging'
import Analytics from './pages/Analytics'

// Customers
import Customers from './pages/customers/Customers'
import EditCustomer from './pages/customers/EditCustomer'
import AddCustomer from './pages/customers/AddCustomer'

// Roles
import Roles from './pages/roles/Roles'
import AddRole from './pages/roles/AddRole'
import EditRole from './pages/roles/EditRole'

// Settings Pages
import Settings from './pages/settings/Settings'
import Profile from './pages/settings/Profile'
import Address from './pages/settings/Address'
import ChangePassword from './pages/settings/ChangePassword'
import StoreConfigurations from './pages/settings/StoreConfigurations'

function App() {
  // Main Layout - only for authenticated users (inside App component for AuthProvider context)
  const Layout = () => {
    const { isAuthenticated, isLoading } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen)
    }

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    return isAuthenticated ? (
      <div className="min-h-screen h-screen flex flex-col">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="flex-1 h-full overflow-y-auto relative">
            <Outlet />
          </div>
        </div>
      </div>
    ) : (
      <Navigate to="/login" replace />
    )
  }

  return (
    <Router>
      <AuthProvider>
        <div className="">
          <Routes>
            {/* Main authenticated layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/products/:id/edit" element={<EditProduct />} />
              <Route path="/products/:id/details" element={<ProductDetails />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/coupons/add" element={<AddCoupon />} />
              <Route path="/coupons/:couponId/edit" element={<EditCoupon />} />
              <Route path="/packaging" element={<Packaging />} />
              <Route path="/packaging/add" element={<AddPackaging />} />
              <Route path="/packaging/:id/edit" element={<EditPackaging />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/demo/product-detail" element={<ProductDetailDemo />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<AddCustomer />} />
              <Route path="/customers/:id/edit" element={<EditCustomer />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/roles/add" element={<AddRole />} />
              <Route path="/roles/:id/edit" element={<EditRole />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/add" element={<AddCategory />} />
              <Route path="/categories/:id/edit" element={<EditCategory />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/brands/add" element={<AddBrand />} />
              <Route path="/brands/:id/edit" element={<EditBrand />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/add" element={<AddCollection />} />
              <Route path="/collections/:id/edit" element={<EditCollection />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/tags/add" element={<AddTag />} />
              <Route path="/tags/:id/edit" element={<EditTag />} />
              <Route path="/variants" element={<Variants />} />
              <Route path="/variants/add" element={<AddVariant />} />
              <Route path="/variants/:id/edit" element={<EditVariant />} />

              {/* Settings Routes */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/profile" element={<Profile />} />
              <Route path="/settings/address" element={<Address />} />
              <Route path="/settings/change-password" element={<ChangePassword />} />
              <Route path="/settings/store-configurations" element={<StoreConfigurations />} />
            </Route>

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/payment-status" element={<PaymentStatus />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  )
}


export default App