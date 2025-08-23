import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { useState } from 'react'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'

// Pages
import Login from './pages/auth/Login'
import OTPVerification from './pages/auth/OTPVerification'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
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

// Settings Pages
import Settings from './pages/settings/Settings'
import Profile from './pages/settings/Profile'
import Address from './pages/settings/Address'
import ChangePassword from './pages/settings/ChangePassword'
import StoreConfigurations from './pages/settings/StoreConfigurations'





function App() {
  // Main Layout - only for authenticated users
  function Layout() {
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