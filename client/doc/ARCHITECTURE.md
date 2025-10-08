# TEO KICKS Client App - Architecture Overview

## 📐 Project Structure

```
client/
├── public/                          # Static assets
│   └── vite.svg                    # Placeholder favicon
│
├── src/
│   ├── assets/                     # Images, logos, icons
│   │   └── react.svg
│   │
│   ├── components/                 # Reusable React components
│   │   ├── common/                # Shared components
│   │   │   ├── Header.jsx         # Navigation bar
│   │   │   ├── Footer.jsx         # Footer
│   │   │   ├── ProductCard.jsx    # Product display card
│   │   │   ├── Button.jsx         # Custom button components
│   │   │   ├── Input.jsx          # Form inputs
│   │   │   ├── Modal.jsx          # Modal dialogs
│   │   │   ├── Loader.jsx         # Loading states
│   │   │   └── ...
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── MainLayout.jsx     # Main app layout wrapper
│   │   │   ├── AuthLayout.jsx     # Auth pages layout
│   │   │   └── AccountLayout.jsx  # Account section layout
│   │   │
│   │   ├── product/               # Product-specific components
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProductFilter.jsx
│   │   │   ├── VariantSelector.jsx
│   │   │   └── ReviewSection.jsx
│   │   │
│   │   ├── cart/                  # Cart-related components
│   │   │   ├── CartItem.jsx
│   │   │   ├── CartSummary.jsx
│   │   │   └── MiniCart.jsx
│   │   │
│   │   └── checkout/              # Checkout components
│   │       ├── AddressForm.jsx
│   │       ├── PaymentMethods.jsx
│   │       └── OrderReview.jsx
│   │
│   ├── pages/                     # Page components (routes)
│   │   ├── Home.jsx              # ✅ Landing page
│   │   ├── Products.jsx          # Product listing
│   │   ├── ProductDetail.jsx     # Single product view
│   │   ├── Collections.jsx       # Collections listing
│   │   ├── CollectionDetail.jsx  # Single collection view
│   │   ├── Category.jsx          # Category page
│   │   ├── Search.jsx            # Search results
│   │   ├── Compare.jsx           # Product comparison
│   │   ├── Contact.jsx           # Contact page
│   │   │
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   │
│   │   ├── account/              # User account pages
│   │   │   ├── Account.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Addresses.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── OrderDetail.jsx
│   │   │
│   │   ├── Wishlist.jsx          # Wishlist page
│   │   ├── Cart.jsx              # Shopping cart
│   │   ├── Checkout.jsx          # Checkout flow
│   │   └── NotFound.jsx          # 404 page
│   │
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.jsx       # Authentication state
│   │   ├── CartContext.jsx       # Shopping cart state
│   │   ├── WishlistContext.jsx   # Wishlist state
│   │   └── ThemeContext.jsx      # Theme/preferences
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.js            # Authentication hook
│   │   ├── useCart.js            # Cart management
│   │   ├── useProducts.js        # Product data fetching
│   │   ├── useOrders.js          # Order management
│   │   ├── useWishlist.js        # Wishlist operations
│   │   └── useDebounce.js        # Utility hooks
│   │
│   ├── services/                  # API services
│   │   ├── api.js                # Base API configuration
│   │   ├── auth.service.js       # Auth API calls
│   │   ├── product.service.js    # Product API calls
│   │   ├── cart.service.js       # Cart API calls
│   │   ├── order.service.js      # Order API calls
│   │   └── payment.service.js    # Payment API calls
│   │
│   ├── utils/                     # Utility functions
│   │   ├── validation.js         # Form validation
│   │   ├── formatters.js         # Data formatting (currency, dates)
│   │   ├── storage.js            # LocalStorage helpers
│   │   └── constants.js          # App constants
│   │
│   ├── styles/                    # Additional styling
│   │   ├── animations.css        # Custom animations
│   │   └── utilities.css         # Utility classes
│   │
│   ├── App.jsx                    # ✅ Main app component with routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # ✅ Global styles with Tailwind
│
├── .gitignore                     # Git ignore rules
├── APP_SPEC.md                    # ✅ Application specifications
├── ARCHITECTURE.md                # ✅ This file
├── eslint.config.js               # ESLint configuration
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── README.md                      # Project documentation
└── vite.config.js                 # Vite configuration
```

---

## 🎨 Design System

### Color Palette (Palette 4 - Modern Pink Accent)

```css
--primary-color: #4B2E83      /* Deep Purple - Main brand color */
--secondary-color: #E879F9     /* Pink - Accent color */
--primary-button: #3A1F66      /* Dark Purple - Primary buttons */
--secondary-button: #FDE7FF    /* Light Pink - Secondary buttons */
--background: #FFFFFF          /* White background */
```

### Component Classes (Tailwind Utilities)

- **Buttons**: `.btn-primary`, `.btn-secondary`, `.btn-outline`
- **Typography**: `.title`, `.title2`, `.title3`
- **Inputs**: `.input`, `.input2`, `.input3`
- **Containers**: `.container`, `.container-sm`, `.container-xs`

---

## 🗺️ Route Architecture

### Public Routes (No Auth Required)

```javascript
/                              → Home (Landing page)
/collections                   → Collections listing
/collections/:slug             → Single collection view
/c/:slug                       → Category page
/search                        → Search results
/products                      → Product listing
/product/:slug                 → Product detail
/compare                       → Product comparison
/contact                       → Contact page
```

### Auth Routes

```javascript
/login                         → User login
/register                      → User registration
/verify-otp                    → OTP verification
/forgot-password               → Password reset request
/reset-password                → Password reset form
/auth/callback                 → OAuth callback handler
```

### Protected Routes (Auth Required)

```javascript
/wishlist                      → User's wishlist
/cart                          → Shopping cart
/checkout                      → Checkout flow
/account                       → Account overview
/account/profile               → User profile
/account/addresses             → Saved addresses
/account/notifications         → Notification settings
/account/orders                → Order history
/account/orders/:id            → Order detail & receipt
```

---

## 🏗️ Home Page Structure

The landing page (`/pages/Home.jsx`) consists of:

### 1. **Hero Section**
- **Purpose**: First impression, brand messaging
- **Features**:
  - Gradient background with brand colors
  - Hero headline with CTA buttons
  - Key statistics (500+ Products, 50+ Brands, 10K+ Customers)
  - Feature image/sneaker showcase

### 2. **Features Section**
- **Purpose**: Build trust with key value propositions
- **Cards**:
  - ✅ Authentic Products
  - 💚 Easy Returns (30 days)
  - 📦 Fast Delivery with tracking

### 3. **Collections Section**
- **Purpose**: Showcase curated collections
- **Features**:
  - Grid of collection cards with images
  - Hover effects and animations
  - Product count per collection
  - Link to full collections page

### 4. **Featured Products Section**
- **Purpose**: Display handpicked/trending products
- **Features**:
  - 4-column grid (responsive)
  - Product cards with:
    - Image with hover effect
    - Name, price, rating
    - Quick add-to-cart button
  - Loading skeleton states

### 5. **CTA Section**
- **Purpose**: Newsletter signup & community building
- **Features**:
  - Email subscription form
  - Promotional messaging (10% off first order)
  - Privacy consent

---

## 📱 Responsive Breakpoints

```css
sm:  640px   /* Small devices (tablets) */
md:  768px   /* Medium devices */
lg:  1024px  /* Large devices (desktops) */
xl:  1280px  /* Extra large screens */
2xl: 1536px  /* Ultra wide screens */
```

---

## 🔄 State Management Strategy

### Local Component State
- Use `useState` for simple, isolated component state
- Examples: form inputs, toggles, modals

### Context API
- **AuthContext**: User authentication state
- **CartContext**: Shopping cart items & actions
- **WishlistContext**: Wishlist items
- **ThemeContext**: User preferences

### React Query (Planned)
- Server state management
- Caching product data
- Automatic refetching
- Optimistic updates

### Redux Toolkit (Planned Alternative)
- Optional for complex global state
- Cart UI, filters, modals

---

## 🔌 API Integration

### Base Configuration
```javascript
// services/api.js
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
axios.defaults.withCredentials = true

// Request interceptor: Attach auth token
// Response interceptor: Handle errors globally
```

### Service Pattern
```javascript
// services/product.service.js
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (query) => api.get('/products/search', { params: { q: query } })
}
```

---

## 🎯 Next Steps (Implementation Roadmap)

### Phase 1: Foundation ✅
- [x] Project setup with Vite + React
- [x] Tailwind CSS configuration
- [x] Design system (colors, utilities)
- [x] Home page (landing page)
- [x] Routing structure

### Phase 2: Core Components
- [ ] Header with navigation
- [ ] Footer
- [ ] Product card component
- [ ] Main layout wrapper
- [ ] Loading states & skeletons

### Phase 3: Product Pages
- [ ] Products listing with filters
- [ ] Product detail page
- [ ] Variant selection
- [ ] Reviews section

### Phase 4: Authentication
- [ ] Login/Register pages
- [ ] OTP verification
- [ ] Password reset flow
- [ ] OAuth integration (Google, Apple, Instagram)

### Phase 5: Shopping Features
- [ ] Wishlist functionality
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Address management
- [ ] Payment integration (M-Pesa, Paystack, Cash)

### Phase 6: User Account
- [ ] Account dashboard
- [ ] Profile management
- [ ] Order history
- [ ] Notification preferences

### Phase 7: Additional Features
- [ ] Search with faceted filters
- [ ] Product comparison
- [ ] Collections & categories
- [ ] Contact form

### Phase 8: Optimization
- [ ] Performance optimization
- [ ] SEO (react-helmet-async)
- [ ] PWA features
- [ ] Analytics integration

---

## 🛠️ Technology Stack

### Core
- **React 19.1** - UI library
- **Vite 7.1** - Build tool
- **React Router DOM 7.8** - Client-side routing

### Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **@tailwindcss/vite** - Vite integration

### Utilities (Current)
- **react-icons 5.5** - Icon library

### Planned
- **axios** - HTTP client
- **@tanstack/react-query** - Server state management
- **react-hook-form** - Form handling
- **zod** - Schema validation
- **framer-motion** - Animations
- **react-hot-toast / sonner** - Notifications
- **dayjs** - Date utilities

---

## 🎨 Component Design Principles

1. **Reusability**: Build generic, configurable components
2. **Composition**: Combine small components into larger ones
3. **Single Responsibility**: Each component does one thing well
4. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
5. **Performance**: Lazy loading, code splitting, memoization
6. **Consistency**: Follow design system and naming conventions

---

## 📦 Build & Deployment

### Development
```bash
npm run dev          # Start dev server (port 5173)
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Linting
```bash
npm run lint         # Run ESLint
```

---

## 🔐 Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TEO KICKS
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
VITE_MPESA_ENV=sandbox
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_APPLE_CLIENT_ID=com.teokicks.signin
VITE_INSTAGRAM_CLIENT_ID=xxx
VITE_OAUTH_REDIRECT_URL=http://localhost:5173/auth/callback
```

---

## 📝 Code Style Guide

### Component Structure
```javascript
import statements
// blank line x2

const ComponentName = ({ props }) => {
  // State
  const [state, setState] = useState()
  // blank line

  // Effects
  useEffect(() => {}, [])
  // blank line

  // Handlers
  const handleClick = () => {}
  // blank line

  // Render helpers
  const renderSection = () => {}
  // blank line

  return (
    <div>
      {/* JSX */}
    </div>
  )
}
// blank line x2

export default ComponentName
```

### Formatting Rules (User Preferences)
- Always 2 blank lines after imports
- 1 blank line between code blocks for readability
- No extra lines around simple text in JSX
- No spacing inside object literals/JSON
- Max 2 blank lines inside any function
- Imports are compact (no blank lines between them)

---

**Last Updated**: October 8, 2025  
**Status**: Phase 1 Complete (Foundation)  
**Next**: Phase 2 - Core Components & Layout

