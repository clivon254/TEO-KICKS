import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Handle FormData - don't set Content-Type, let browser set it
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                        refreshToken
                    })

                    const { accessToken } = response.data.data
                    localStorage.setItem('accessToken', accessToken)

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                    return api(originalRequest)
                } catch (refreshError) {
                    // Refresh token failed; keep existing storage to allow manual retry or background validation.
                    // Do not redirect here; let the app decide based on guarded routes.
                    return Promise.reject(refreshError)
                }
            }
        }

        return Promise.reject(error)
    }
)

// Auth API calls
export const authAPI = {
    // Login
    login: (credentials) => api.post('/api/auth/login', credentials),
    
    // Register
    register: (userData) => api.post('/api/auth/register', userData),
    
    // Verify OTP
    verifyOTP: (otpData) => api.post('/api/auth/verify-otp', otpData),
    
    // Resend OTP
    resendOTP: (emailData) => api.post('/api/auth/resend-otp', emailData),
    
    // Forgot Password
    forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
    
    // Reset Password
    resetPassword: (token, newPassword) => api.post(`/api/auth/reset-password/${token}`, { newPassword }),
    
    // Get current user
    getMe: () => api.get('/api/auth/me'),
    
    // Logout
    logout: () => api.post('/api/auth/logout'),

    // Google OAuth
    googleAuth: () => api.get('/api/auth/google'),
    googleAuthCallback: (codeData) => api.post('/api/auth/google/callback', codeData),
    googleAuthMobile: (idTokenData) => api.post('/api/auth/google/mobile', idTokenData),
}

// User API calls
export const userAPI = {
    // Get user profile
    getProfile: () => api.get('/api/users/profile'),
    
    // Update user profile
    updateProfile: (profileData) => api.put('/api/users/profile', profileData),
    
    // Change password
    changePassword: (passwordData) => api.put('/api/users/change-password', passwordData),

    // Get notification preferences
    getNotificationPreferences: () => api.get('/api/users/notifications'),
    
    // Update notification preferences
    updateNotificationPreferences: (preferences) => api.put('/api/users/notifications', preferences),
}

// Product API calls
export const productAPI = {
    // Get all products (public)
    getAllProducts: (params) => api.get('/api/products', { params }),
    
    // Get product by ID (public)
    getProductById: (id) => api.get(`/api/products/${id}`),
    
    // Get optimized product images
    getOptimizedImages: (productId) => api.get(`/api/products/${productId}/images/optimized`),
}

// Category API calls
export const categoryAPI = {
    // Get all categories (public)
    getAllCategories: (params) => api.get('/api/categories', { params }),
    
    // Get category by ID (public)
    getCategoryById: (id) => api.get(`/api/categories/${id}`),
    
    // Get category tree (public)
    getCategoryTree: () => api.get('/api/categories/tree'),
    
    // Get categories with products (public)
    getCategoriesWithProducts: () => api.get('/api/categories/with-products'),
}

// Brand API calls
export const brandAPI = {
    // Get all brands (public)
    getAllBrands: (params) => api.get('/api/brands', { params }),
    
    // Get brand by ID (public)
    getBrandById: (id) => api.get(`/api/brands/${id}`),
    
    // Get popular brands (public)
    getPopularBrands: (params) => api.get('/api/brands/popular', { params }),
}

// Tag API calls
export const tagAPI = {
    // Get all tags (public)
    getAllTags: (params) => api.get('/api/tags', { params }),
    
    // Get tag by ID (public)
    getTagById: (id) => api.get(`/api/tags/${id}`),
    
    // Get tags by type (public)
    getTagsByType: (type) => api.get(`/api/tags`, { params: { type } }),
    
    // Get popular tags (public)
    getPopularTags: (params) => api.get('/api/tags', { params: { ...params, popular: true } }),
}

// Collection API calls
export const collectionAPI = {
    // Get all collections (public)
    getAllCollections: (params) => api.get('/api/collections', { params }),

    // Get collection by ID (public)
    getCollectionById: (id) => api.get(`/api/collections/${id}`),
}

// Variant API calls
export const variantAPI = {
    // Get all variants (public)
    getAllVariants: (params) => api.get('/api/variants', { params }),

    // Get variant by ID (public)
    getVariantById: (id) => api.get(`/api/variants/${id}`),

    // Get active variants (public)
    getActiveVariants: () => api.get('/api/variants/active'),
}

// Cart API calls
export const cartAPI = {
    // Get user's cart
    getCart: () => api.get('/api/cart'),
    
    // Add item to cart
    addToCart: (cartData) => api.post('/api/cart/add', cartData),
    
    // Update cart item quantity
    updateCartItem: (skuId, quantity) => api.put(`/api/cart/items/${skuId}`, { quantity }),
    
    // Remove item from cart
    removeFromCart: (skuId) => api.delete(`/api/cart/items/${skuId}`),
    
    // Clear cart
    clearCart: () => api.delete('/api/cart/clear'),
    
    // Validate cart
    validateCart: () => api.get('/api/cart/validate'),
}

// Order API calls
export const orderAPI = {
    // Create order
    createOrder: (payload) => api.post('/api/orders', payload),
    
    // Get user's orders
    getOrders: (params) => api.get('/api/orders', { params }),
    
    // Get order by ID
    getOrderById: (orderId) => api.get(`/api/orders/${orderId}`),
}

// Payment API calls
export const paymentAPI = {
    // Pay invoice
    payInvoice: (data) => api.post('/api/payments/pay-invoice', data),
    
    // Get payment by ID
    getPaymentById: (paymentId) => api.get(`/api/payments/${paymentId}`),
    
    // Get M-Pesa payment status
    getMpesaStatus: (paymentId) => api.get(`/api/payments/${paymentId}/mpesa-status`),
    
    // Query M-Pesa by checkout ID
    queryMpesaByCheckoutId: (checkoutRequestId) => api.get(`/api/payments/mpesa-status/${checkoutRequestId}`),
}

// Address API calls
export const addressAPI = {
    // Get user addresses
    getUserAddresses: () => api.get('/api/addresses'),
    
    // Get address by ID
    getAddressById: (addressId) => api.get(`/api/addresses/${addressId}`),
    
    // Create address
    createAddress: (addressData) => api.post('/api/addresses', addressData),
    
    // Update address
    updateAddress: (addressId, addressData) => api.put(`/api/addresses/${addressId}`, addressData),
    
    // Delete address
    deleteAddress: (addressId) => api.delete(`/api/addresses/${addressId}`),
    
    // Set default address
    setDefaultAddress: (addressId) => api.patch(`/api/addresses/${addressId}/default`),
    
    // Get default address
    getDefaultAddress: () => api.get('/api/addresses/default'),
}

// Review API calls
export const reviewAPI = {
    // Get reviews for a product
    getProductReviews: (productId, params) => api.get(`/api/reviews/products/${productId}`, { params }),
    
    // Get a single review
    getReviewById: (reviewId) => api.get(`/api/reviews/${reviewId}`),
    
    // Create a review
    createReview: (productId, reviewData) => api.post(`/api/reviews/products/${productId}`, reviewData),
    
    // Update a review
    updateReview: (reviewId, reviewData) => api.put(`/api/reviews/${reviewId}`, reviewData),
    
    // Delete a review
    deleteReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`),
    
    // Get user's reviews
    getUserReviews: (params) => api.get('/api/reviews/user/reviews', { params }),
}

// Coupon API calls
export const couponAPI = {
    // Validate coupon (public)
    validateCoupon: (code, orderAmount) => api.post('/api/coupons/validate', { code }, { params: { orderAmount } }),

    // Apply coupon to order (protected)
    applyCoupon: (code, orderAmount) => api.post('/api/coupons/apply', { code, orderAmount }),
}

// Packaging API calls
export const packagingAPI = {
    // Get active packaging options (public)
    getActivePublic: () => api.get('/api/packaging/public'),
    
    // Get default packaging option (public)
    getDefaultPublic: () => api.get('/api/packaging/public/default'),
}

// Store Configuration API calls
export const storeConfigAPI = {
    // Get store configuration (public)
    getStoreConfig: () => api.get('/api/store-config'),
}

export default api
