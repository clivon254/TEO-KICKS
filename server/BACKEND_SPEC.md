### Backend Specification (Node.js / Express / MongoDB)

This document describes the backend architecture, environment, models, controllers, routes, and APIs that power the store.

---

## Tech & Structure

- **Stack**: Node.js, Express, MongoDB (Mongoose)
- **Patterns**: MVC + services; REST APIs; webhooks for payments; background jobs for notifications
- **Recommended folders**
  - `src/`
    - `config/` (env, db)
    - `models/`
    - `controllers/`
    - `routes/`
    - `services/` (business logic: payments, notifications, search, inventory)
    - `middlewares/` (auth, rbac, validators, rate‑limit)
    - `utils/` (helpers, error handling)
    - `jobs/` and `queues/` (BullMQ + Redis)
    - `webhooks/` (M‑Pesa, Paystack)
    - `uploads/` (if storing locally; prefer S3/Cloudinary)
    - `docs/` (OpenAPI/Swagger)

---

## Environment Variables (.env)

- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `OTP_EXP_MINUTES`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `SMS_PROVIDER` (e.g., "twilio" or "africastalking")
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`
- `AT_API_KEY`, `AT_USERNAME` (if using Africa's Talking)
- `DARaja_CONSUMER_KEY`, `DARaja_CONSUMER_SECRET`, `DARaja_PASSKEY`, `DARaja_SHORTCODE`, `DARaja_ENV` (sandbox|production)
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
- `CLIENT_BASE_URL`, `ADMIN_BASE_URL`
- `REDIS_URL`
- `CLOUDINARY_URL` (or S3 creds if used)
-- OAuth providers
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`
- `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`, `INSTAGRAM_REDIRECT_URI`

---

## Packages

- Core: `express`, `mongoose`, `cors`, `helmet`, `morgan`
- Auth: `jsonwebtoken`, `bcryptjs`
- Validation: `zod` (or `joi`), custom middlewares
- Security: `express-rate-limit`, `hpp`, `xss-clean`, `express-mongo-sanitize`
- File uploads: `multer` (+ `cloudinary` or AWS SDK if needed)
- Payments: M‑Pesa (Daraja via REST), `paystack-sdk` or direct REST
- Emails/SMS: `nodemailer`, `twilio` or `africastalking`
- Queues: `bullmq`, `ioredis`
- Logging: `pino` (or `winston`), `pino-pretty`
- Docs: `swagger-ui-express`, `swagger-jsdoc`
- Testing: `jest`, `supertest`
- OAuth & SSO: `passport`, `passport-google-oauth20`, `passport-apple`, `passport-instagram` (or use direct OAuth 2.0 libs like `simple-oauth2` / `apple-signin-auth`)
- PDF/Receipts: `pdfkit` or `puppeteer` (HTML → PDF) — Generate order receipts as PDFs.

---

## Data Models (Mongoose)

- **User**
  - Profile: name, email, phone, password hash, avatar
  - Auth: OTP code/hash & expiry, isVerified, roles ["customer", "staff", "admin", ...]
  - OAuth: linked providers [{ provider: "google"|"apple"|"instagram", providerUserId, email, linkedAt }]
  - Addresses: list (label, street, city, region, country, postal, isDefault)
  - Preferences: notification settings

- **Variant (Attribute) & Options**
  - Example attributes: Size, Color, Material; options: [S, M, L], [Red, Blue], etc.
  - Flexible schema so any product can use any variants.

- **Product**
  - Basic: title, slug, description, brand, images, categories, collections, tags
  - Pricing: basePrice, compareAtPrice, tax class
  - Variants: list of attributes used (e.g., Size, Color)
  - SKUs: concrete combinations with SKU, price (override), stock, barcode, image, weight
  - Status: active, draft, archived

- **Inventory**
  - Tracks stock per SKU (variant combination), reserves on order placement, deducts on payment.

- **Wishlist**
  - User ↔ Product references, createdAt

- **Compare**
  - User ↔ Products up to N items

- **Cart**
  - User (or guest token), items [{ productId, skuId, qty, priceSnapshot, customization }], coupon, totals

- **Coupon**
  - Code, type (percent/amount/free‑shipping), rules (min spend, usage limit, start/end), status

- **Campaign**
  - Name, audience/segments, schedule (start/end), message, channels (email/sms/in‑app), performance stats

- **Order**
  - User, items (productId, skuId, name, image, qty, price), address snapshot, shipping method
  - Status: Placed → Confirmed → Packed → Shipped → OutForDelivery → Delivered → (Cancelled/Refunded)
  - Payments: list (provider, ref, amount, currency, result, timestamps)
  - Totals: subtotal, discounts, shipping, tax, grandTotal
  - Timeline: events with actor (system/staff)
  - Receipt: receiptNumber, receiptUrl (or storage key), receiptGeneratedAt

- **Payment**
  - Provider: mpesa|paystack|cash, amount, currency, status, externalRef, metadata, webhook logs

- **Notification**
  - Type: in‑app | email | sms; template, payload, user(s), read status

Supporting taxonomies often used: Category, Collection, Brand (optional but recommended for filtering).

- **Review**
  - product, user, orderId?, orderItemId?
  - rating (1..5), title, body, images []
  - isVerifiedPurchase (bool), isApproved (bool)
  - createdAt, updatedAt

- **StoreSettings**
  - Identity: storeName, contactEmail, contactPhone
  - Location: address { street, city, region, country, postal }, timezone
  - Hours: weekly schedule [{ day: 0-6, open: "09:00", close: "18:00", closed: boolean }]
  - Days off / Holidays: dates [], notes
  - Visibility flags: showContactOnSite, showHoursOnSite

---

## Controllers (Responsibilities)

- Auth: register, login, OTP send/verify, refresh token, logout, social OAuth (init/callback), forgot password (request), reset password (confirm)
- Users: profile CRUD, addresses CRUD, notification prefs, list (admin)
- Products: CRUD, variant builder, SKU generation, images upload
- Inventory: adjust, reserve, release; low‑stock alerts
- Wishlist: add/remove/list
- Compare: add/remove/list
- Cart: add/update/remove/merge, apply/remove coupon, totals
- Coupons: CRUD, validate/apply
- Campaigns: CRUD, schedule, stats
- Orders: create (customer/admin), detail, list/filter, status transitions, timeline notes
- Payments: create intents, M‑Pesa STK push, Paystack init, confirm, webhooks
- Receipts: generate on successful payment, attach/store URL, email to customer, resend on demand
- Notifications: send/broadcast (email/sms/in‑app), mark read
- Store settings: get/update settings (admin only), compute current open/closed status
- Reviews: create (verified purchasers only), update/delete own review, admin approve/reject, list & aggregate ratings per product

---

## Routes (High‑Level)

- `/api/auth` — register, login, otp, refresh, logout, forgot‑password, reset‑password
- `/api/auth/oauth/:provider` — start OAuth (google|apple|instagram)
- `/api/auth/oauth/:provider/callback` — OAuth callback
- `/api/users` — me, profile, addresses, notifications
- `/api/products` — list, detail, filters, variants, admin CRUD
- `/api/products/:productId/reviews` — list reviews, create review (if verified buyer)
- `/api/products/:productId/reviews/:reviewId` — update/delete (owner or admin), approve (admin)
- `/api/wishlist` — list/add/remove
- `/api/compare` — list/add/remove
- `/api/cart` — get/set/update/apply‑coupon
- `/api/coupons` — validate, admin CRUD
- `/api/campaigns` — admin CRUD, stats
- `/api/orders` — create, list, detail, status updates
- `/api/orders/:id/receipt` — get/download receipt (owner or admin)
- `/api/orders/:id/receipt/resend` — resend receipt email to customer (admin)
- `/api/payments` — init, confirm, webhooks (mpesa/paystack), admin collect
- `/api/notifications` — list, mark‑read, broadcast (admin)
- `/api/store-settings` — get public settings
- `/api/admin/store-settings` — get/update (admin only)

---

## API Sketch (Examples)

- Auth
  - POST `/api/auth/register` { name, email/phone, password } → sends OTP
  - POST `/api/auth/verify-otp` { email/phone, otp } → activates account
  - POST `/api/auth/login` { email/phone, password }
  - POST `/api/auth/forgot-password` { email } → sends reset link/token
  - POST `/api/auth/reset-password` { token, newPassword }
  - GET `/api/auth/oauth/google` → redirect to Google consent
  - GET `/api/auth/oauth/google/callback` → exchange code, sign in/up
  - GET `/api/auth/oauth/apple` and `/callback`
  - GET `/api/auth/oauth/instagram` and `/callback`

- Products
  - GET `/api/products` ?q=&category=&collection=&variants[Size]=M&variants[Color]=Red&price[min]=&price[max]=&sort=
  - GET `/api/products/:slug` — includes variant matrix and SKU stock
  - POST `/api/products` (admin)
  - GET `/api/products/:id/reviews` — list with pagination and aggregates (avg, counts per star)
  - POST `/api/products/:id/reviews` { rating, title, body, images } — requires Delivered order containing product; one per user
  - PATCH `/api/products/:id/reviews/:reviewId` — author can edit within policy window
  - DELETE `/api/products/:id/reviews/:reviewId` — author or admin
  - POST `/api/products/:id/reviews/:reviewId/approve` — admin approval

- Wishlist / Compare
  - POST `/api/wishlist` { productId }
  - DELETE `/api/wishlist/:productId`
  - POST `/api/compare` { productId }
  - DELETE `/api/compare/:productId`

- Cart & Coupons
  - GET `/api/cart`
  - POST `/api/cart/items` { productId, skuId, qty, customization }
  - PATCH `/api/cart/items/:itemId` { qty, skuId }
  - DELETE `/api/cart/items/:itemId`
  - POST `/api/cart/coupon` { code }

- Orders
  - POST `/api/orders` { addressId, shippingMethod, paymentMethod } → creates order (reserves stock)
  - GET `/api/orders/:id` — details + tracking timeline
  - PATCH `/api/orders/:id/status` { status } (admin)

- Payments
  - POST `/api/payments/mpesa/initiate` { orderId, phone } → STK Push to customer phone
  - POST `/api/payments/paystack/initiate` { orderId } → returns authorization URL
  - POST `/api/webhooks/mpesa` — receive M‑Pesa callbacks
  - POST `/api/webhooks/paystack` — receive Paystack events
  - POST `/api/payments/admin/collect` { orderId, method, phone? } — admin prompts customer (e.g., STK)
  - On success: generate receipt (PDF), persist receiptUrl, notify customer (email with attachment/link)

- Notifications & Broadcasts
  - GET `/api/notifications`
  - POST `/api/notifications/broadcast` (admin) { channel, audience, templateId, params }
  
- Store Settings
  - GET `/api/store-settings` → public info (name, contact, location visibility, hours)
  - GET `/api/admin/store-settings` (admin) → full editable settings
  - PUT `/api/admin/store-settings` (admin) { storeName, contactEmail, ..., hours, daysOff }

---

## Auth, OTP & RBAC

- OTP on register and (optionally) on sensitive actions.
- JWT access + refresh tokens; short‑lived access tokens.
- RBAC middleware checks roles/permissions per route (e.g., `admin`, `staff`, `customer`).
- Social login supported (Google, Apple ID, Instagram). Accounts can be linked to an existing user via email match or explicit link.

---

## Payments (M‑Pesa Daraja, Paystack, Cash)

- M‑Pesa: STK Push from server using Consumer Key/Secret and Passkey; verify result via callback and/or query; update order/payment status.
- Paystack: Initialize transaction (server), redirect/authorize (client), verify via webhook; update order/payment status.
- Cash: Mark as collected by staff/delivery with audit trail.

---

## Notifications

- In‑app notifications stored in DB, delivered via API and websockets (optional).
- Email via Nodemailer/SMTP provider; SMS via Twilio/Africa’s Talking.
- Background jobs handle OTP, order updates, campaigns, low‑stock alerts.

---

## Inventory & Stock

- Reserve stock on order creation; release on timeout/cancel; deduct on payment success.
- Track per‑SKU (variant) quantities and thresholds for alerts.

---

## Validation, Security & Observability

- Input validation (Zod/Joi), rate limits, CORS, Helmet, mongo sanitize, XSS clean, HPP.
- Centralized error handler with problem details.
- Structured logs (Pino) with request tracing; health checks.
- Rate limit review creation/edits; profanity filter; anti‑spam; audit log for moderation actions.

---

## Testing & Docs

- Unit tests (Jest), API tests (Supertest), factories/fixtures.
- Swagger/OpenAPI docs served at `/api/docs` (disabled in production or protected).

This backend spec supports the required flows: flexible variants per product, robust filters, coupons, wishlist/compare, order lifecycle, OTP verification, notifications, and payments via M‑Pesa, Paystack, and Cash, including admin‑initiated orders with customer prompts.

