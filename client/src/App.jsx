import { Routes, Route, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import './index.css'
import Header from './components/common/Header'
import Footer from './components/common/Footer'


function App() {

  const Layout = () => {
  return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      <Routes>

        <Route element={<Layout /> }>
          <Route path="/" element={<Home />} />
          
          {/* Public Routes */}
          <Route path="/collections" element={<div className="p-8">Collections Page</div>} />
          <Route path="/collections/:slug" element={<div className="p-8">Collection Detail Page</div>} />
          <Route path="/c/:slug" element={<div className="p-8">Category Page</div>} />
          <Route path="/search" element={<div className="p-8">Search Page</div>} />
          <Route path="/products" element={<div className="p-8">Products Page</div>} />
          <Route path="/product/:slug" element={<div className="p-8">Product Detail Page</div>} />
          <Route path="/compare" element={<div className="p-8">Compare Page</div>} />
          <Route path="/contact" element={<div className="p-8">Contact Page</div>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<div className="p-8">Login Page</div>} />
          <Route path="/register" element={<div className="p-8">Register Page</div>} />
          <Route path="/verify-otp" element={<div className="p-8">OTP Verification Page</div>} />
          <Route path="/forgot-password" element={<div className="p-8">Forgot Password Page</div>} />
          <Route path="/reset-password" element={<div className="p-8">Reset Password Page</div>} />
          
          {/* Protected Routes */}
          <Route path="/wishlist" element={<div className="p-8">Wishlist Page (Protected)</div>} />
          <Route path="/cart" element={<div className="p-8">Cart Page (Protected)</div>} />
          <Route path="/checkout" element={<div className="p-8">Checkout Page (Protected)</div>} />
          <Route path="/account" element={<div className="p-8">Account Page (Protected)</div>} />
          <Route path="/account/profile" element={<div className="p-8">Profile Page (Protected)</div>} />
          <Route path="/account/addresses" element={<div className="p-8">Addresses Page (Protected)</div>} />
          <Route path="/account/notifications" element={<div className="p-8">Notifications Page (Protected)</div>} />
          <Route path="/account/orders" element={<div className="p-8">Orders Page (Protected)</div>} />
          <Route path="/account/orders/:id" element={<div className="p-8">Order Detail Page (Protected)</div>} />
        </Route>
          
          {/* 404 */}
        <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />

      </Routes>

    </div>
  )
}


export default App
