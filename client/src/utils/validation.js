import * as yup from 'yup'

// Login validation schema
export const loginSchema = yup.object().shape({
    email: yup.string().when('loginMethod', {
        is: 'email',
        then: (schema) => schema.email('Please enter a valid email address').required('Email is required'),
        otherwise: (schema) => schema.notRequired()
    }),
    phone: yup.string().when('loginMethod', {
        is: 'phone',
        then: (schema) => schema.required('Phone number is required').min(9, 'Phone number must be at least 9 digits'),
        otherwise: (schema) => schema.notRequired()
    }),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    loginMethod: yup.string().oneOf(['email', 'phone'], 'Invalid login method').required('Login method is required')
})

// OTP validation schema
export const otpSchema = yup.object().shape({
    otp: yup.string()
        .required('OTP is required')
        .length(6, 'OTP must be exactly 6 digits')
        .matches(/^\d{6}$/, 'OTP must contain only numbers'),
    email: yup.string().email('Please enter a valid email address').required('Email is required')
})

// Forgot password validation schema
export const forgotPasswordSchema = yup.object().shape({
    email: yup.string()
        .email('Please enter a valid email address')
        .required('Email is required')
})

// Reset password validation schema
export const resetPasswordSchema = yup.object().shape({
    newPassword: yup.string()
        .required('New password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: yup.string()
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
})

// Register validation schema
export const registerSchema = yup.object().shape({
    firstName: yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastName: yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    email: yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    phone: yup.string()
        .required('Phone number is required')
        .min(9, 'Phone number must be at least 9 digits'),
    password: yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: yup.string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password'), null], 'Passwords must match')
})

// Profile update validation schema
export const profileSchema = yup.object().shape({
    firstName: yup.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastName: yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    email: yup.string()
        .email('Please enter a valid email address'),
    phone: yup.string()
        .min(9, 'Phone number must be at least 9 digits'),
    avatar: yup.string()
})

// Change password validation schema
export const changePasswordSchema = yup.object().shape({
    currentPassword: yup.string()
        .required('Current password is required'),
    newPassword: yup.string()
        .required('New password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
        .notOneOf([yup.ref('currentPassword'), null], 'New password must be different from current password'),
    confirmPassword: yup.string()
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
})

// Address validation schema
export const addressSchema = yup.object().shape({
    type: yup.string()
        .oneOf(['home', 'office', 'other'], 'Invalid address type')
        .required('Address type is required'),
    label: yup.string()
        .min(2, 'Label must be at least 2 characters')
        .max(50, 'Label must be less than 50 characters')
        .required('Address label is required'),
    street: yup.string()
        .min(5, 'Street address must be at least 5 characters')
        .max(200, 'Street address must be less than 200 characters')
        .required('Street address is required'),
    city: yup.string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City must be less than 100 characters')
        .required('City is required'),
    state: yup.string()
        .min(2, 'State must be at least 2 characters')
        .max(100, 'State must be less than 100 characters')
        .required('State is required'),
    postalCode: yup.string()
        .min(3, 'Postal code must be at least 3 characters')
        .max(20, 'Postal code must be less than 20 characters')
        .required('Postal code is required'),
    country: yup.string()
        .min(2, 'Country must be at least 2 characters')
        .max(100, 'Country must be less than 100 characters')
        .required('Country is required'),
    latitude: yup.number()
        .min(-90, 'Invalid latitude')
        .max(90, 'Invalid latitude'),
    longitude: yup.number()
        .min(-180, 'Invalid longitude')
        .max(180, 'Invalid longitude'),
    isDefault: yup.boolean()
})

// Review validation schema
export const reviewSchema = yup.object().shape({
    rating: yup.number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5')
        .required('Rating is required'),
    comment: yup.string()
        .min(10, 'Comment must be at least 10 characters')
        .max(1000, 'Comment must be less than 1000 characters')
        .required('Comment is required')
})

// Coupon validation schema
export const couponSchema = yup.object().shape({
    code: yup.string()
        .min(3, 'Coupon code must be at least 3 characters')
        .max(50, 'Coupon code must be less than 50 characters')
        .required('Coupon code is required')
})

// Contact form validation schema
export const contactSchema = yup.object().shape({
    name: yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .required('Name is required'),
    email: yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    subject: yup.string()
        .min(5, 'Subject must be at least 5 characters')
        .max(200, 'Subject must be less than 200 characters')
        .required('Subject is required'),
    message: yup.string()
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must be less than 1000 characters')
        .required('Message is required')
})

// Search validation schema
export const searchSchema = yup.object().shape({
    query: yup.string()
        .min(2, 'Search query must be at least 2 characters')
        .max(100, 'Search query must be less than 100 characters')
        .required('Search query is required'),
    category: yup.string().optional(),
    brand: yup.string().optional(),
    minPrice: yup.number().min(0, 'Minimum price must be positive').optional(),
    maxPrice: yup.number().min(0, 'Maximum price must be positive').optional(),
    sortBy: yup.string().oneOf(['name', 'price', 'createdAt', 'popularity'], 'Invalid sort option').optional(),
    sortOrder: yup.string().oneOf(['asc', 'desc'], 'Invalid sort order').optional()
})

// Newsletter subscription validation schema
export const newsletterSchema = yup.object().shape({
    email: yup.string()
        .email('Please enter a valid email address')
        .required('Email is required')
})
