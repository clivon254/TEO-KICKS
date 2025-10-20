### Client App Spec (Storefront)

This document defines the customer‑facing React app: flow, pages, functionalities, routes, packages (roles), and environment variables. Do not install packages yet; for now, install only `react-router-dom`.

---

## Flow (Customer Journey)

1) Guest browses storefront (home, collections, categories, brands, search) and views product details.
2) Register/Login (email/phone + password or SSO via Google, Apple ID, Instagram). Forgot/Reset Password supported.
3) Verify OTP to activate account and unlock features.
4) Manage profile and settings; set default address; manage notification preferences.
5) Receive alerts (order status, promotions, price drops, low stock) in‑app/email/SMS.
6) Discover products via search, collections, categories, brands; filter and sort.
7) Wishlist and compare products; organize and remove anytime.
8) Product detail: choose variants/options; see real‑time price and stock per variant.
9) Pre‑orders: when enabled, allow adding out‑of‑stock variants to cart; otherwise block.
10) Packaging options (e.g., standard, gift, premium) with clear fees.
11) Contact store via Contact page; receive confirmation and response.
12) Reviews: verified purchasers can write reviews/ratings (badge shown).
13) Cart and quantity management; apply coupon codes and view savings.
14) Checkout: confirm address, delivery/pick‑up, schedule (optional fee), and payment.
15) Payments: M‑Pesa (Daraja prompt), Paystack (card), or Cash (if available/policy allows).
16) Order created and tracked: Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered (or Cancelled/Returned). Receipt generated and accessible.

---

## Pages and Functionalities

- Home `/`
  - Featured collections, new arrivals, best sellers, banners.
  - Carousels, quick links to categories/brands.

- Catalog & Discovery
  - Collections `/collections` and detail `/collections/:handle`
  - Categories `/categories` and detail `/category/:slug`
  - Brands `/brands` and detail `/brands/:slug`
  - Search `/search` with results, filters, and sorting
  - Filters: category, collection, brand, size, color, style, price, rating, availability, variants/options
  - Sorting: relevance, newest, price, popularity

- Product
  - Product detail `/products/:slug`
    - Images/gallery, description (rich text), specs, price, discounts
    - Variant/option picker (e.g., size, color); displays per‑variant price and stock
    - Packaging select with fee preview
    - Reviews: list, rating summary; write review if verified purchaser

- Cart & Checkout
  - Cart `/cart` — adjust quantity, change variants, remove items, coupon input, totals
  - Checkout `/checkout` — address confirmation, delivery/pick‑up, schedule (optional), payment selection
  - Order status
    - Success `/order/success`
    - Failure `/order/failed`

- Auth
  - Login `/login`
  - Register `/register`
  - Verify OTP `/verify-otp`
  - Forgot/Reset Password `/forgot-password`, `/reset-password`

- Account
  - Overview `/account`
  - Profile `/account/profile`
  - Addresses `/account/addresses`
  - Orders `/account/orders`
  - Order detail `/account/orders/:id`
  - Notifications `/account/notifications`
  - Reviews `/account/reviews` (user’s submitted reviews)

- Wishlist & Compare
  - Wishlist `/wishlist`
  - Compare `/compare`

- Contact & Content
  - Contact `/contact`
  - Content pages `/pages/:slug` (About, Terms, Privacy, etc.)

Notes:
- Real‑time availability per variant on product detail; prevent add‑to‑cart if out of stock unless pre‑order is enabled.
- Distance‑based delivery fee is shown before payment when applicable.

---

## Routes (Browser Routes)

- `/`, `/collections`, `/collections/:handle`
- `/categories`, `/category/:slug`, `/brands`, `/brands/:slug`
- `/search`
- `/products/:slug`
- `/cart`, `/checkout`, `/order/success`, `/order/failed`
- `/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`
- `/account`, `/account/profile`, `/account/addresses`, `/account/orders`, `/account/orders/:id`, `/account/notifications`, `/account/reviews`
- `/wishlist`, `/compare`
- `/contact`, `/pages/:slug`

Auth & Guards:
- Protect `/account/*`, `/checkout`, and write actions (add to cart, wishlist, compare, submit review) with auth guards.
- Guests may browse all catalog pages and product details; writing actions require login.

---

## Packages & Libraries (Roles)

Install now:
- `react-router-dom` — Routing, nested routes, and protected route guards.

Planned (do not install yet):
- `axios` — HTTP client with interceptors for auth/session and retries.
- `@tanstack/react-query` — Product lists/details, cart mutations, order creation with caching.
- State: `zustand` or `@reduxjs/toolkit` — Cart, auth, UI preferences.
- UI: `tailwindcss` + `@headlessui/react` + `@radix-ui/react-*` — Storefront UI, dialogs, menus.
- Forms & validation: `react-hook-form` + `zod` — Checkout forms, profile, addresses.
- SEO: `react-helmet-async` — Meta tags, canonical links, structured data.
- Media: `swiper` (or `keen-slider`) — Product carousels and galleries.
- Dates: `dayjs` — Formatting dates in reviews and orders.
- Icons: `lucide-react` (or similar) — UI icons.
- Rich text (read‑only): `tiptap` or `react-quill` for product descriptions (optional if server‑rendered HTML is safe).

---

## Environment Variables (Vite)

- `VITE_API_BASE_URL` — Backend base URL for storefront endpoints.
- `VITE_STORE_NAME` — Display name of the storefront.
- `VITE_PAYSTACK_PUBLIC_KEY` — Initialize Paystack.
- `VITE_MPESA_ENV` — `sandbox` or `production` for environment badges and flows.
- `VITE_ANALYTICS_ID` — Analytics for storefront usage (optional).
- `VITE_SENTRY_DSN` — Error tracking (optional).
- `VITE_GOOGLE_CLIENT_ID` — OAuth client ID for Google sign‑in.
- `VITE_APPLE_CLIENT_ID` — OAuth client ID/service ID for Apple sign‑in.
- `VITE_INSTAGRAM_CLIENT_ID` — OAuth client ID for Instagram sign‑in.
- `VITE_OAUTH_REDIRECT_URL` — Frontend URL to handle OAuth redirects (e.g., `/auth/callback`).
- `VITE_DEFAULT_CURRENCY` — ISO currency code for price formatting (optional).
- `VITE_MAPS_API_KEY` — For address autocomplete/distance fee preview (optional).

Usage note: Only `VITE_`‑prefixed variables are exposed to the client app at build time.

---

## Install (only routing for now)

```sh
npm i react-router-dom
```


---

## Theme (Light – White background)

Four palette options derived from the brand purple. Use as Tailwind custom colors or CSS variables.

- Palette 1 (Monochrome Lavender)
  - primary-color: #4B2E83
  - secondary-color: #BFA6FF
  - primary-button-color: #3A1F66
  - secondary-button-color: #EDE8FF

- Palette 2 (Royal Gold Contrast)
  - primary-color: #4B2E83
  - secondary-color: #F5C518
  - primary-button-color: #3A1F66
  - secondary-button-color: #FFE8A3

- Palette 3 (Cool Teal Contrast)
  - primary-color: #4B2E83
  - secondary-color: #2CB1A6
  - primary-button-color: #3A1F66
  - secondary-button-color: #C7F5F2

- Palette 4 (Modern Pink Accent) — DEFAULT
  - primary-color: #4B2E83
  - secondary-color: #E879F9
  - primary-button-color: #3A1F66
  - secondary-button-color: #FDE7FF

Notes:
- Background stays white. Ensure AA contrast for text, buttons, and on images.
- Use Tailwind tokens and utilities for consistent spacing, typography, and elevation.

---

## Implementation Notes (Non‑binding)

- API client: centralize `axios` instance with auth token handling, retries, and error normalization.
- Auth: token storage (httpOnly cookie preferred) and silent session refresh; role isn’t typically used on storefront beyond customer.
- Caching: use React Query for product lists/details, cart, and order mutations.
- Accessibility: keyboard navigation in menus, carousels, and modals; focus management on route changes.
- Performance: image lazy‑loading, responsive sources, and code‑splitting for route groups.
- Internationalization (optional): currency and locale formatting; prepare for future i18n.


