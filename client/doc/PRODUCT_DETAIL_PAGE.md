### Client Product Detail Page

Implements a customer-facing product page with gallery, options, stock, quantity, and add-to-cart.

---

## Route & File

- Route: `/product/:id`
- File: `client/src/pages/ProductDetails.jsx`

---

## Data & Hooks

- Product: `useGetProductById(id)` → `productAPI.getProductById`
- Add to Cart: `useAddToCart()`

Notes:

- Handles both simple products and variant-based products (when variants are populated on the product object).
- Auto-selects first available option per variant when possible.

---

## UI & Behavior

- Gallery: main image + up to 6 thumbnails
- Pricing: selected SKU price or `basePrice`; compare-at optional
- Variants: option chips per variant; disabled when `stock === 0`
- Stock: per-SKU (when variants) or total across SKUs (simple)
- Quantity: gated by stock; +/- controls
- Add to Cart: validates selection/stock and posts `{ productId, skuId, quantity, variantOptions }`

---

## Disabled States

- Missing required options
- Out of stock or quantity above available
- Pending mutation

---

## Testing Checklist

- Change thumbnails updates the main image
- Selecting options switches SKU and updates price/stock
- Quantity cannot exceed available; buttons disable accordingly
- Add to cart succeeds and navigates to `/cart`


