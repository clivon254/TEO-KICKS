# Client Setup Guide

This guide will help you set up the client application with all the necessary configurations.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

## Environment Configuration

Create a `.env` file in the client directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=TEO KICKS
VITE_APP_DESCRIPTION=Your premier destination for stylish kicks

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_OAUTH_REDIRECT_URL=http://localhost:5173/auth/google/callback

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=your_analytics_id_here

# Error Tracking (Optional)
VITE_SENTRY_DSN=your_sentry_dsn_here

# Payment Configuration (Optional)
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
VITE_MPESA_ENV=sandbox

# Features Flags (Optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=false
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
client/src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── store/              # Redux store configuration
├── utils/              # Utility functions (API, validation)
└── assets/             # Static assets

```

## Key Features Implemented

### Authentication
- JWT-based authentication
- Google OAuth integration
- Password reset functionality
- OTP verification
- Redux state management

### API Integration
- Axios with interceptors
- Automatic token refresh
- Error handling
- Request/response logging

### State Management
- Redux Toolkit
- Redux Persist for state persistence
- TanStack Query for server state

### UI Components
- Tailwind CSS with custom theme
- Responsive design utilities
- Common component patterns
- Form validation with Yup

### Hooks Available
- `useAuth` - Authentication management
- `useProducts` - Product data fetching
- `useCart` - Shopping cart operations
- `useOrders` - Order management
- `useAddresses` - Address management
- `useReviews` - Review system
- `useCategories` - Category data
- `useBrands` - Brand data
- `useCollections` - Collection data
- `useCoupons` - Coupon validation
- `useStoreConfig` - Store configuration

## Usage Examples

### Authentication
```jsx
import { useAuth } from './contexts/AuthContext'

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  
  const handleLogin = async (credentials) => {
    const result = await login(credentials)
    if (result.success) {
      // Redirect to dashboard
    }
  }
  
  return (
    // Login form JSX
  )
}
```

### API Calls
```jsx
import { useGetProducts } from './hooks/useProducts'

function ProductList() {
  const { data: products, isLoading, error } = useGetProducts({
    category: 'shoes',
    page: 1,
    limit: 20
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {products?.data?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### Cart Operations
```jsx
import { useAddToCart, useGetCart } from './hooks/useCart'

function ProductCard({ product }) {
  const addToCart = useAddToCart()
  const { data: cart } = useGetCart()
  
  const handleAddToCart = () => {
    addToCart.mutate({
      skuId: product.skuId,
      quantity: 1
    })
  }
  
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  )
}
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. The application will be available at `http://localhost:5173`

## Production Build

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist` directory

## Integration with Backend

The client is configured to work with the backend API running on `http://localhost:5000` by default. Make sure the backend server is running before starting the client.

## Next Steps

1. Create page components in `src/pages/`
2. Add routing configuration
3. Implement authentication pages (Login, Register, etc.)
4. Add product listing and detail pages
5. Implement shopping cart and checkout flow
6. Add user dashboard and profile management
