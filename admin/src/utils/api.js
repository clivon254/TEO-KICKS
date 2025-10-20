import axios from 'axios'

const API_BASE_URL =  'http://localhost:5000'

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

    // Admin: Get all users
    getAllUsers: (params) => api.get('/api/users', { params }),

    // Admin: Get user by ID
    getUserById: (userId) => api.get(`/api/users/${userId}`),

    // Admin: Update user status / roles
    updateUserStatus: (userId, data) => api.put(`/api/users/${userId}/status`, data),

    // Admin: Delete user
    deleteUser: (userId) => api.delete(`/api/users/${userId}`),

    // Admin: Create customer (password = phone)
    adminCreateCustomer: (data) => api.post('/api/users/admin-create', data),
}

// Product API calls
export const productAPI = {
    // Get all products
    getAllProducts: (params) => api.get('/api/products', { params }),
    
    // Get product by ID
    getProductById: (id) => api.get(`/api/products/${id}`),
    
    // Create product
    createProduct: (productData) => api.post('/api/products', productData),
    
    // Update product
    updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
    
    // Delete product
    deleteProduct: (id) => api.delete(`/api/products/${id}`),
    
    // Upload product images
    uploadImages: (id, formData) => api.post(`/api/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Delete product image
    deleteImage: (productId, imageId) => api.delete(`/api/products/${productId}/images/${imageId}`),
    
    // Set primary image
    setPrimaryImage: (productId, imageId) => api.put(`/api/products/${productId}/images/${imageId}/primary`),
    
    // Update SKU
    updateSKU: (productId, skuId, skuData) => api.patch(`/api/products/${productId}/skus/${skuId}`, skuData),
    
    // Delete SKU
    deleteSKU: (productId, skuId) => api.delete(`/api/products/${productId}/skus/${skuId}`),
    
    // Generate SKUs
    generateSKUs: (productId) => api.post(`/api/products/${productId}/generate-skus`),
}

// Category API calls
export const categoryAPI = {
    // Get all categories
    getAllCategories: (params) => api.get('/api/categories', { params }),
    
    // Get category by ID
    getCategoryById: (id) => api.get(`/api/categories/${id}`),
    
    // Create category
    createCategory: (categoryData) => api.post('/api/categories', categoryData),
    
    // Update category
    updateCategory: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
    
    // Delete category
    deleteCategory: (id) => api.delete(`/api/categories/${id}`),
    
    // Get category tree
    getCategoryTree: () => api.get('/api/categories/tree'),
    
    // Get categories with products
    getCategoriesWithProducts: () => api.get('/api/categories/with-products'),
}

// Brand API calls
export const brandAPI = {
    // Get all brands
    getAllBrands: (params) => api.get('/api/brands', { params }),
    
    // Get brand by ID
    getBrandById: (id) => api.get(`/api/brands/${id}`),
    
    // Create brand
    createBrand: (brandData) => api.post('/api/brands', brandData),
    
    // Update brand
    updateBrand: (id, brandData) => api.put(`/api/brands/${id}`, brandData),
    
    // Delete brand
    deleteBrand: (id) => api.delete(`/api/brands/${id}`),
    
    // Get popular brands
    getPopularBrands: (params) => api.get('/api/brands/popular', { params }),
}

// Tag API calls
export const tagAPI = {
    // Get all tags
    getAllTags: (params) => api.get('/api/tags', { params }),
    
    // Get tag by ID
    getTagById: (id) => api.get(`/api/tags/${id}`),
    
    // Create tag
    createTag: (tagData) => api.post('/api/tags', tagData),
    
    // Update tag
    updateTag: (id, tagData) => api.put(`/api/tags/${id}`, tagData),
    
    // Delete tag
    deleteTag: (id) => api.delete(`/api/tags/${id}`),
    
    // Get tags by type
    getTagsByType: (type) => api.get(`/api/tags/type/${type}`),
    
    // Get popular tags
    getPopularTags: (params) => api.get('/api/tags/popular', { params }),
}

// Collection API calls
export const collectionAPI = {
    // Get all collections
    getAllCollections: (params) => api.get('/api/collections', { params }),

    // Get collection by ID
    getCollectionById: (id) => api.get(`/api/collections/${id}`),

    // Create collection
    createCollection: (collectionData) => api.post('/api/collections', collectionData),

    // Update collection
    updateCollection: (id, collectionData) => api.put(`/api/collections/${id}`, collectionData),

    // Delete collection
    deleteCollection: (id) => api.delete(`/api/collections/${id}`),

    // Add product to collection
    addProduct: (id, productId) => api.post(`/api/collections/${id}/products`, { productId }),

    // Remove product from collection
    removeProduct: (id, productId) => api.delete(`/api/collections/${id}/products/${productId}`),
}

// Variant API calls
export const variantAPI = {
    // Get all variants
    getAllVariants: (params) => api.get('/api/variants', { params }),

    // Get variant by ID
    getVariantById: (id) => api.get(`/api/variants/${id}`),

    // Create variant
    createVariant: (variantData) => api.post('/api/variants', variantData),

    // Update variant
    updateVariant: (id, variantData) => api.put(`/api/variants/${id}`, variantData),

    // Delete variant
    deleteVariant: (id) => api.delete(`/api/variants/${id}`),

    // Get active variants
    getActiveVariants: () => api.get('/api/variants/active'),

    // Add option to variant
    addOption: (variantId, optionData) => api.post(`/api/variants/${variantId}/options`, optionData),

    // Update variant option
    updateOption: (variantId, optionId, optionData) => api.put(`/api/variants/${variantId}/options/${optionId}`, optionData),

    // Remove option from variant
    removeOption: (variantId, optionId) => api.delete(`/api/variants/${variantId}/options/${optionId}`),
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


// Checkout APIs
export const orderAPI = {
    createOrder: (payload) => api.post('/api/orders', payload),
    getOrders: (params) => api.get('/api/orders', { params }),
    getOrderById: (orderId) => api.get(`/api/orders/${orderId}`),
    updateOrderStatus: (orderId, status) => api.patch(`/api/orders/${orderId}/status`, { status }),
    deleteOrder: (orderId) => api.delete(`/api/orders/${orderId}`),
}


export const invoiceAPI = {
    getInvoiceById: (invoiceId) => api.get(`/api/invoices/${invoiceId}`),
}


export const paymentAPI = {
    payInvoice: (data) => api.post('/api/payments/pay-invoice', data),
    getPaymentById: (paymentId) => api.get(`/api/payments/${paymentId}`),
    markCashCollected: (paymentId, amount) => api.patch(`/api/payments/${paymentId}/cash`, { amount }),
    getMpesaStatus: (paymentId) => api.get(`/api/payments/${paymentId}/mpesa-status`),
    queryMpesaByCheckoutId: (checkoutRequestId) => api.get(`/api/payments/mpesa-status/${checkoutRequestId}`),
}


export const receiptAPI = {
    getReceiptById: (receiptId) => api.get(`/api/receipts/${receiptId}`),
}

// Stats API calls (Admin)
export const statsAPI = {
    getOverview: () => api.get('/api/stats/overview'),
    getAnalytics: (params) => api.get('/api/stats/analytics', { params }),
}

// Packaging API calls
export const packagingAPI = {
    // Admin list/search/filter/sort
    getPackaging: (params) => api.get('/api/packaging', { params }),
    getById: (id) => api.get(`/api/packaging/${id}`),
    create: (data) => api.post('/api/packaging', data),
    update: (id, data) => api.patch(`/api/packaging/${id}`, data),
    remove: (id) => api.delete(`/api/packaging/${id}`),
    setDefault: (id) => api.patch(`/api/packaging/${id}/default`),

    // Public for checkout
    getActivePublic: () => api.get('/api/packaging/public'),
    getDefaultPublic: () => api.get('/api/packaging/public/default'),
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
    
    // Admin: Approve/Reject review
    approveReview: (reviewId, isApproved) => api.patch(`/api/reviews/${reviewId}/approve`, { isApproved }),
}

// Coupon API calls
export const couponAPI = {
    // Get all coupons (admin only)
    getAllCoupons: (params) => api.get('/api/coupons', { params }),

    // Get coupon by ID
    getCouponById: (couponId) => api.get(`/api/coupons/${couponId}`),

    // Create coupon (admin only)
    createCoupon: (couponData) => api.post('/api/coupons', couponData),

    // Update coupon (admin only)
    updateCoupon: (couponId, couponData) => api.put(`/api/coupons/${couponId}`, couponData),

    // Delete coupon (admin only)
    deleteCoupon: (couponId) => api.delete(`/api/coupons/${couponId}`),

    // Validate coupon (public)
    validateCoupon: (code, orderAmount) => api.post('/api/coupons/validate', { code }, { params: { orderAmount } }),

    // Apply coupon to order (protected)
    applyCoupon: (code, orderAmount) => api.post('/api/coupons/apply', { code, orderAmount }),

    // Get coupon statistics (admin only)
    getCouponStats: () => api.get('/api/coupons/stats'),

    // Generate new coupon code (admin only)
    generateNewCode: (couponId) => api.patch(`/api/coupons/${couponId}/generate-code`),
}

// Store Configuration API calls
export const storeConfigAPI = {
    // Get store configuration
    getStoreConfig: () => api.get('/api/store-config'),

    // Create store configuration (admin only)
    createStoreConfig: (configData) => api.post('/api/store-config', configData),

    // Update store configuration (admin only)
    updateStoreConfig: (configData) => api.put('/api/store-config', configData),

    // Delete store configuration (admin only)
    deleteStoreConfig: () => api.delete('/api/store-config'),

    // Get store configuration status
    getStoreConfigStatus: () => api.get('/api/store-config/status'),

    // Initialize default store configuration (admin only)
    initStoreConfig: () => api.post('/api/store-config/init'),
}

export default api 