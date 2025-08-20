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
import Collections from './pages/classifications/collections/Collections'
import Tags from './pages/classifications/tags/Tags'


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
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* TODO: Implement mobile sidebar visibility */}
        <Sidebar />
        <div className="flex-1 lg:w-[70%] h-full overflow-y-auto relative">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <Navigate to="/login" replace />
  )
}


function App() {
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
              <Route path="/collections" element={<Collections />} />
              <Route path="/tags" element={<Tags />} />
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