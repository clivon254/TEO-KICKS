import { Routes, Route, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import './index.css'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'


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
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/compare" element={<div className="p-8">Compare Page</div>} />
          <Route path="/contact" element={<div className="p-8">Contact Page</div>} />

          {/* Auth Routes (with header/footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/wishlist" element={<div className="p-8">Wishlist Page (Protected)</div>} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
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
