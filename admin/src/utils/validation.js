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
    name: yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
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
    name: yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
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

// Category validation schema
export const categorySchema = yup.object().shape({
    name: yup.string()
        .required('Category name is required')
        .min(2, 'Category name must be at least 2 characters')
        .max(100, 'Category name must be less than 100 characters'),
    description: yup.string()
        .max(500, 'Description must be less than 500 characters'),
    status: yup.string().oneOf(['active', 'inactive']).optional(),

})

// Variant validation schema
export const variantSchema = yup.object().shape({
    name: yup.string()
        .required('Variant name is required')
        .min(2, 'Variant name must be at least 2 characters')
        .max(100, 'Variant name must be less than 100 characters'),
    description: yup.string()
        .max(500, 'Description must be less than 500 characters'),
    status: yup.string().oneOf(['active', 'inactive']).optional(),

}) 