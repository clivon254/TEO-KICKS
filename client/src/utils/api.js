import axios from 'axios'


const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
      const refreshToken = localStorage.getItem('refreshToken')

      // Do not attempt refresh for auth endpoints (e.g., login failure) or when no refresh token
      if (isAuthEndpoint || !refreshToken) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
        const { accessToken } = response.data.data

        localStorage.setItem('accessToken', accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        // Let the app's route guards handle unauthenticated state; do not hard-refresh here
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)


export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData),
  resendOTP: (emailData) => api.post('/auth/resend-otp', emailData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  googleAuth: () => api.get('/auth/google'),
  googleAuthCallback: (data) => api.post('/auth/google/callback', data),
  googleAuthMobile: (data) => api.post('/auth/google/mobile', data),
}


export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (productId) => api.get(`/products/${productId}`),
  createProduct: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (productId, formData) => api.put(`/products/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),
  generateSKUs: (productId) => api.post(`/products/${productId}/generate-skus`),
  updateSKU: (productId, skuId, skuData) => api.put(`/products/${productId}/skus/${skuId}`, skuData),
  deleteSKU: (productId, skuId) => api.delete(`/products/${productId}/skus/${skuId}`),
  uploadImages: (productId, formData) => api.post(`/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
  setPrimaryImage: (productId, imageId) => api.put(`/products/${productId}/images/${imageId}/primary`),
}


export const categoryAPI = {
  getAllCategories: (params) => api.get('/categories', { params }),
  getCategoryById: (categoryId) => api.get(`/categories/${categoryId}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/categories/${categoryId}`),
}


export const collectionAPI = {
  getAllCollections: (params) => api.get('/collections', { params }),
  getCollectionById: (collectionId) => api.get(`/collections/${collectionId}`),
  createCollection: (collectionData) => api.post('/collections', collectionData),
  updateCollection: (collectionId, collectionData) => api.put(`/collections/${collectionId}`, collectionData),
  deleteCollection: (collectionId) => api.delete(`/collections/${collectionId}`),
}


export const brandAPI = {
  getAllBrands: (params) => api.get('/brands', { params }),
  getBrandById: (brandId) => api.get(`/brands/${brandId}`),
  createBrand: (brandData) => api.post('/brands', brandData),
  updateBrand: (brandId, brandData) => api.put(`/brands/${brandId}`, brandData),
  deleteBrand: (brandId) => api.delete(`/brands/${brandId}`),
}


export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (cartItemData) => api.post('/cart', cartItemData),
  updateCartItem: (skuId, quantity) => api.put(`/cart/${skuId}`, { quantity }),
  removeFromCart: (skuId) => api.delete(`/cart/${skuId}`),
  clearCart: () => api.delete('/cart'),
  validateCart: () => api.get('/cart/validate'),
}


export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  updateOrderStatus: (orderId, statusData) => api.put(`/orders/${orderId}/status`, statusData),
  deleteOrder: (orderId) => api.delete(`/orders/${orderId}`),
}


export const paymentAPI = {
  payInvoice: (paymentData) => api.post('/payments/pay-invoice', paymentData),
  getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),
  queryMpesaByCheckoutId: (checkoutRequestId) => api.get(`/payments/query-mpesa/${checkoutRequestId}`),
}


export const couponAPI = {
  getAllCoupons: (params) => api.get('/coupons', { params }),
  getCouponById: (couponId) => api.get(`/coupons/${couponId}`),
  validateCoupon: (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount }),
  applyCoupon: (code, orderAmount) => api.post('/coupons/apply', { code, orderAmount }),
}


export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  updateUserStatus: (userId, data) => api.put(`/users/${userId}/status`, data),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
}


export const reviewAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  getUserReviews: (params) => api.get('/reviews/user', { params }),
  getReviewById: (reviewId) => api.get(`/reviews/${reviewId}`),
  createReview: (productId, reviewData) => api.post(`/reviews/product/${productId}`, reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  approveReview: (reviewId, isApproved) => api.put(`/reviews/${reviewId}/approve`, { isApproved }),
}


export default api
