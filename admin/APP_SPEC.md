### Admin App Spec (Dashboard)

This document defines the staff/admin React app: flow, pages, functionalities, routes, packages (roles), and environment variables. Do not install packages yet; for now, install only `react-router-dom`.

---

## Flow (Admin Journey)

1) Staff login (role‑based; email/password or SSO via Google, Apple ID, Instagram) → dashboard overview. Forgot/Reset Password available.
2) Manage products, variants/SKUs, categories/collections/attributes.
3) Track and adjust inventory at variant level.
4) Review and process orders; move through statuses; handle refunds/returns.
5) Create orders for customers and prompt for payment (M‑Pesa STK/Paystack link/Cash).
6) Manage customers, staff, roles, and permissions.
7) Create coupons, campaigns, offers; broadcast messages (email/sms/in‑app).
8) Monitor analytics and reports; configure settings.

---

## Pages and Functionalities

- Auth
  - Login `/login` (supports Google, Apple ID, Instagram)
  - (Optional) Verify OTP `/verify-otp`
  - Forgot/Reset Password `/forgot-password`, `/reset-password`

- Dashboard
  - Overview `/`
    - KPIs (revenue, orders, AOV), charts, recent orders, low stock list.

- Catalog
  - Products `/products`
    - List/search/filter; bulk actions.
    - Bulk upload (CSV/XLSX) and bulk delete.
  - New Product `/products/new`
    - Details, images, pricing, status.
  - Edit Product `/products/:id/edit`
    - Variant builder (attributes, options) and SKU matrix (price, stock, barcode, image).
    - Reviews tab: view product reviews, approve/reject, reply (optional), and see verified badges.
    - Packaging options: manage multiple packaging choices with fees.
  - Categories `/categories`
  - Collections `/collections`
  - Attributes `/attributes`

- Inventory
  - Variant/SKU stock `/inventory`
    - Real‑time updates; prevent overselling; adjust, reserve, release; low‑stock thresholds; pre‑order toggle per SKU/product.

- Orders
  - Orders list `/orders`
  - Order detail `/orders/:id`
    - Timeline, payments, status transitions (Placed → Confirmed → Packed → Shipped → OutForDelivery → Delivered; Cancelled/Refunded), notes.
    - View/download/print receipt (PDF) and resend to customer.
  - Create order `/orders/new` (admin‑initiated) and prompt customer to pay.
  - Fulfilment: Now or Scheduled (with scheduling fee setting). In‑shop vs Away rules enforced.
  - Delivery management: distance‑based delivery fee per km; assign rider; riders see and claim available orders.

- Customers
  - List `/customers`
  - Detail `/customers/:id`

- Inbox / Contacts
  - Messages `/inbox` (or `/contacts`)
    - View customer reach‑outs; filters (status: open/resolved, channel), search.
    - Message detail: conversation thread, customer context.
    - Reply via email, SMS, or in‑app; send templates; keep history; set status.

- Staff & Roles
  - Staff `/staff`
  - Roles `/roles`

- Marketing
  - Coupons `/coupons`
  - Campaigns `/campaigns`
  - Offers `/offers`
  - Broadcasts `/broadcasts`

- Analytics & Reports
  - `/analytics`
  - Review analytics: avg rating, volume, verified ratio (optional)

- Content
  - Banners & blocks `/content`

- Settings
  - `/settings`
    - Payments `/settings/payments`
    - Shipping `/settings/shipping`
    - Taxes `/settings/taxes`
    - Notifications `/settings/notifications`
    - Integrations `/settings/integrations`
    - Store Details `/settings/store` (name, email/phone, location/address, timezone)
    - Hours & Days Off `/settings/hours` (open hours per weekday, holidays/closures)
    - Fulfilment `/settings/fulfilment` (enable scheduling + fee, in‑shop vs away rules, post‑to‑bill settings)
    - Delivery `/settings/delivery` (fee per km, rider role permissions)
    - Branding & legal `/settings/branding`, `/settings/legal`

- Audit
  - Audit logs `/audit`

---

## Routes (Browser Routes)

- `/login`, `/verify-otp`
- `/auth/callback` (OAuth redirect handler if needed)
- `/` (dashboard)
- `/products`, `/products/new`, `/products/:id/edit`
- `/categories`, `/collections`, `/attributes`
- `/inventory`
- `/orders`, `/orders/new`, `/orders/:id`
- `/orders/:id/receipt` (optional direct link)
- `/customers`, `/customers/:id`
- `/inbox` (or `/contacts`)
- `/staff`, `/roles`
- `/coupons`, `/campaigns`, `/offers`, `/broadcasts`
- `/analytics`
- `/content`
- `/settings`, `/settings/payments`, `/settings/shipping`, `/settings/taxes`, `/settings/notifications`, `/settings/integrations`, `/settings/branding`, `/settings/legal`
- `/audit`

Protect all routes except `/login` (and `/verify-otp` if used) with role‑based guards.

---

## Packages & Libraries (Roles)

Install now:
- `react-router-dom` — Routing, nested routes, and protected route guards.

Planned (do not install yet):
- `axios` — HTTP client with auth interceptors for admin APIs.
- `@tanstack/react-query` — Server state (tables, details) with caching and mutations.
- `@reduxjs/toolkit` — UI state for filters, drawers, multi‑selects.
- `@tanstack/react-table` (or AG Grid/MUI Data Grid) — Large data tables with sorting/filtering/pagination.
- `recharts` (or `chart.js`) — KPIs and charts on dashboard and analytics.
- `react-hook-form` + `zod` — Complex product forms, variant matrix, validations.
- `tailwindcss` + `@headlessui/react` + `@radix-ui/react-*` — Admin UI, dialogs, menus.
- `react-dropzone` — Asset uploads for product images.
- `tiptap` or `react-quill` — Rich product descriptions.
- `papaparse`, `xlsx` — CSV/XLSX import/export for catalog.
- `dayjs` — Dates in tables and reports.
- `react-pdf` (or open receipt URL) — Optional in‑app PDF viewing/printing of receipts.
- OAuth & social sign‑in SDKs (e.g., `@react-oauth/google`; Apple/Instagram via backend) — Social login buttons and token flow.

---

## Environment Variables (Vite)

- `VITE_API_BASE_URL` — Backend base URL for admin endpoints.
- `VITE_ADMIN_APP_NAME` — Dashboard display name.
- `VITE_PAYSTACK_PUBLIC_KEY` — For initializing Paystack (if admin triggers a link).
- `VITE_MPESA_ENV` — `sandbox` or `production` to reflect environment badges.
- `VITE_DASHBOARD_ANALYTICS_ID` — Analytics for admin usage (optional).
- `VITE_SENTRY_DSN` — Error tracking (optional).
- `VITE_GOOGLE_CLIENT_ID` — OAuth client ID for Google sign‑in.
- `VITE_APPLE_CLIENT_ID` — OAuth client ID/service ID for Apple sign‑in.
- `VITE_INSTAGRAM_CLIENT_ID` — OAuth client ID for Instagram sign‑in.
- `VITE_OAUTH_REDIRECT_URL` — Frontend URL to handle OAuth redirects (e.g., `/auth/callback`).

Usage note: Only `VITE_`‑prefixed variables are exposed to the admin app at build time.

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

Note: Background stays white. Ensure AA contrast for text on buttons and table headers.

