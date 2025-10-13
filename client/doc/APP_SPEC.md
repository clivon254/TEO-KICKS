### Client App Spec (Storefront)

This document defines the customer‑facing React app: user flow, pages, functionalities, routes, packages (roles), and environment variables. Do not install packages yet; for now, install only `react-router-dom`.

---

## Flow (Customer Journey)

1) Browse as guest → search, filter, view products/collections/categories.
2) Register/Login (Google, Apple ID, Instagram supported) → verify OTP → activate account; Forgot/Reset Password available.
3) Manage profile and addresses; set notification preferences.
4) Wishlist and product compare; select variants and customization.
5) Add to cart; adjust quantities and variants; apply coupon.
6) Checkout → address → shipping → payment (M‑Pesa, Paystack, Cash).
7) Order created → receive notifications → track order status. A receipt is generated; the customer receives a copy (email/in‑app) and can view/download it from Order Detail.

---

## Pages and Functionalities

- Public
  - Home `/`
    - Highlights collections, featured products, banners.
  - Collections `/collections`, `/collections/:slug`
    - Browse curated groups.
  - Categories `/c/:slug`
    - Clothes, shoes, caps & hats, every head gear, glasses.
  - Search `/search`
    - Query bar, facets, results, sort.
  - Contact `/contact`
    - Show store contact info, location map, hours and days off; inquiry form.
    - Form fields: email, message (content). Optional: name/phone.
    - Validation and spam protection (rate limit / CAPTCHA). Show success confirmation after submit.
  - Product Listing `/products`
    - Filters (category, collection, price, rating, attributes), sorting.
  - Product Details `/product/:slug`
    - Variant selection (size/color/etc.), images, specs, stock per SKU, customization, related products.
    - Reviews: list with average rating; only users who purchased and received the product can write/edit one review (verified purchase badge).
    - Packaging options: choose from available packaging (with fees) before adding to cart.
  - Compare `/compare`
    - Side‑by‑side spec and price comparison.

- Auth & Account
  - Login `/login` (supports Google, Apple ID, Instagram)
  - Register `/register`
  - Verify OTP `/verify-otp`
  - Forgot/Reset Password `/forgot-password`, `/reset-password`
  - Account `/account`
    - Profile `/account/profile`
    - Addresses `/account/addresses`
    - Notifications `/account/notifications`
    - Orders `/account/orders`
    - Order Detail `/account/orders/:id`
      - View/download receipt (PDF)

- Shopping
  - Wishlist `/wishlist`
    - Add/remove items; login required.
  - Compare `/compare`
    - Add/remove products to comparison; login required.
  - Cart `/cart`
    - Add items and edit quantities/variants/packaging; login required. Prevent adding out‑of‑stock variants unless pre‑order is enabled.
  - Checkout `/checkout`
    - Steps: Address → Shipping/Pick‑up → Payment → Review.
    - Fulfilment: “Now” or “Scheduled” (show scheduling fee if applicable).
    - In‑shop vs Away rules: if Away, require payment at checkout; if In‑shop, allow pay now or post to bill.

---

## Routes (Browser Routes)

- `/`
- `/collections`, `/collections/:slug`
- `/c/:slug`
- `/search`
- `/products`
- `/product/:slug`
- `/product/:slug/review` (optional dedicated page/modal for writing/editing a review if eligible)
- `/compare`
- `/contact`
- `/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`
- `/auth/callback` (OAuth redirect handler if needed)
- `/wishlist` (auth‑required)
- `/cart` (auth‑required)
- `/checkout`
  - `/checkout/schedule` (optional)
- `/account`, `/account/profile`, `/account/addresses`, `/account/notifications`, `/account/orders`, `/account/orders/:id`
- `/account/orders/:id/receipt` (optional direct link)

Protected route guards should enforce authentication for wishlist persistence, checkout, and all `/account` routes.
Additionally enforce authentication for add‑to‑cart and compare actions.

---

## Packages & Libraries (Roles)

Install now:
- `react-router-dom` — Client‑side routing and route guards.

Planned (do not install yet):
- `axios` — HTTP client with interceptors for auth tokens and error handling.
- `@tanstack/react-query` — Server state caching, retries, and optimistic updates.
- `@reduxjs/toolkit` or `zustand` — Client state (cart UI, modals, small UI state).
- `react-hook-form` + `zod` — Forms and schema validation.
- OAuth & social sign‑in SDKs (e.g., `@react-oauth/google`, Apple Sign In JS; Instagram via backend redirect) — Social login buttons and token flow.
- `tailwindcss` + `@headlessui/react` + `@heroicons/react` — Styling and accessible components.
- `react-hot-toast` or `sonner` — User notifications.
- `dayjs` — Date/time utilities.
- `framer-motion` — Micro‑interactions and transitions.
- `react-helmet-async` — SEO tags per route.
- `react-pdf` (or open receipt URL) — Optional in‑app PDF viewing/printing of receipts.
- (Optional later) CAPTCHA library/integration — Protect contact form from spam.

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

Note: Background stays white. Ensure AA contrast for text on buttons.

---

## Environment Variables (Vite)

- `VITE_API_BASE_URL` — Backend base URL for API requests.
- `VITE_APP_NAME` — App display name.
- `VITE_PAYSTACK_PUBLIC_KEY` — For Paystack initialization (client side; optional until payments are wired).
- `VITE_MPESA_ENV` — `sandbox` or `production` for conditional UI messaging.
- `VITE_ANALYTICS_ID` — Analytics key (optional).
- `VITE_NOTIFICATIONS_WS_URL` — WebSocket endpoint for real‑time notifications (optional).
- `VITE_GOOGLE_CLIENT_ID` — OAuth client ID for Google sign‑in.
- `VITE_APPLE_CLIENT_ID` — OAuth client ID/service ID for Apple sign‑in.
- `VITE_INSTAGRAM_CLIENT_ID` — OAuth client ID for Instagram sign‑in.
- `VITE_OAUTH_REDIRECT_URL` — Frontend URL to handle OAuth redirects (e.g., `/auth/callback`).

Usage note: Vite exposes only `VITE_`‑prefixed variables to the browser.

---

## Install (only routing for now)

```sh
npm i react-router-dom
```

