### Product Detail Page (Admin)

This page provides a rich read view of a single product and a controlled add-to-cart demo flow for admin testing.

---

## Route & File

- Route: `/products/:id/details`
- File: `admin/src/pages/products/ProductDetails.jsx`

---

## Data Sources

- Product: `useGetProductById(id)`
- Lookups: `useGetBrands`, `useGetCategories`, `useGetCollections`, `useGetTags`, `useGetVariants`
- Cart (demo): `useAddToCart`
- Reviews: `ReviewsSection` uses `useGetProductReviews`, `useCreateReview`

All responses are memoized to handle varying structures safely.

---

## UI Structure

- Header: back to products, product title
- Gallery: main image + up to 6 thumbnails; controlled `currentImageIndex`
- Pricing: selected SKU price if present; fallback to `basePrice`; optional compare‑at
- Classifications: brand, categories, collections, tags (names resolved from lookups)
- Variants: `VariantSelector` with stock badges when available
- Stock: shows selected SKU stock (variants) or total stock (no variants)
- Quantity: gated by current stock; dynamic label includes chosen options
- Add to Cart: disabled unless selection and stock are valid; pending spinner on mutate
- Description & Features: rendered only if present
- Reviews: `ReviewsSection` with stats, pagination, and write form (authenticated users)

---

## Variant and SKU Logic

- Product may carry variant IDs or populated variants
- The page resolves variants via `useGetVariants` when needed
- On mount, selects the first in‑stock option per variant
- Selected options map to a single SKU via `sku.attributes[].(variantId, optionId)`
- Stock calculations:
  - With variants: uses selected SKU’s `stock`
  - Without variants: sums `stock` over SKUs with stock > 0

---

## Add to Cart (Admin Demo)

- Mutation: `useAddToCart`
- Payload: `{ productId, skuId, quantity, variantOptions }`
- Shows `CartSuccessModal` with continue shopping / go to cart actions

Disabled states:

- Not all variants selected (when variants exist)
- Out of stock or quantity > available
- Mutation pending

---

## Components

- `VariantSelector` — shows variant options, selection state, and optional stock chips
- `ReviewsSection` — stats, list, pagination; write review for authenticated users

---

## Testing Checklist

- Thumbnails correctly update main image
- Variant selection resolves to a SKU; price and stock update accordingly
- Quantity capped by stock; add button enables/disables correctly
- Add to cart sends correct payload and shows success modal
- Description, features, and reviews render only when present


