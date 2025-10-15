### Admin Product Page Documentation

This document describes the Product management experience in the Admin app: list, details, creation and editing flows, key components, state and data dependencies, and interaction patterns.

---

## Routes

- `/products` — Products list and filters
- `/products/add` — Create a new product (multi‑tab form)
- `/products/:id/edit` — Edit an existing product
- `/products/:id/details` — View product details (images, variants, stock, reviews)

---

## Files

- List: `admin/src/pages/products/Products.jsx`
- Details: `admin/src/pages/products/ProductDetails.jsx`
- Add: `admin/src/pages/products/AddProduct.jsx`
- Edit: `admin/src/pages/products/EditProduct.jsx`
- Shared UI:
  - `admin/src/components/common/VariantSelector.jsx`
  - `admin/src/components/common/ReviewsSection.jsx`
  - `admin/src/components/common/StatusBadge.jsx`
  - `admin/src/components/common/Pagination.jsx`

---

## Data & Hooks

The pages use React Query–style hooks (thin wrappers over the API client) to fetch and mutate data:

- Products: `useGetProducts`, `useGetProductById`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`
- Classifications: `useGetBrands`, `useGetCategories`, `useGetCollections`, `useGetTags`
- Variants: `useGetVariants`
- Cart (used in Details demo and admin cart flows): `useAddToCart`
- Reviews (in Details): `useGetProductReviews`, `useCreateReview` (and update/delete in nested components)

Responses are normalized with memoized selectors in each page to guard against varying shapes (e.g., `data?.data?.data`).

---

## Products List (`/products`)

UI sections:

- Header: title, description
- Search: debounced 300ms; clearable
- Filters:
  - Status: all/active/draft/archived
  - Brand: select list
  - Category: select list
  - Rows per page: 5/10/20/50
  - Clear filters button (appears only when any filter is active)
- Table columns: checkbox, product (image + title), brand, price (base, compare‑at), status badge, actions
- Actions per row: view details, edit, delete (with confirmation modal)
- Bulk selection: select all/none; selection banner shows count
- Pagination: uses `Pagination` with derived totals

Behavior:

- Query params are built from search, filters, and pagination; results are memoized (`useMemo`) and rendered as a simple table.
- Delete uses a guarded confirm modal and `useDeleteProduct` mutation. On success, the table refetches via React Query.
- Images show the primary image if present, otherwise first image, otherwise a placeholder icon.

---

## Product Details (`/products/:id/details`)

Purpose: Rich read view for a single product (gallery, pricing, attributes, stock, and reviews) and a controlled “Add to Cart” demo flow.

Data:

- Product: `useGetProductById(id)`
- Lookups: brands, categories, collections, tags, variants (used to populate names and variant metadata)

Key UI blocks:

- Header: back button to `/products`, title
- Gallery: main image + up to 6 thumbnails, with controlled index
- Pricing: shows selected SKU price (if any) or `basePrice`; optional compare‑at
- Classifications: brand, categories, collections, tags (resolved to display names)
- Variants: `VariantSelector` rendered when product has variants
- Stock block:
  - If variants exist: shows stock for selected SKU and per‑option stock hints
  - If no variants: shows total available stock across SKUs
- Quantity selector: enforces max selectable quantity based on current stock context
- Add to Cart button: disabled if variants are incomplete, out of stock, or quantity exceeds available; shows spinner when pending
- Description & Features: optional sections rendered when fields exist
- Reviews: `ReviewsSection` for paginated list, rating stats, and (for authenticated users) write review

Variant & SKU resolution:

- Product may contain variant IDs or fully populated variants. Details page memo‑populates variants from `useGetVariants` when necessary.
- On mount, the page auto‑selects the first available option per variant (prefers options with stock > 0).
- Selected variants map to a single matching SKU by comparing `sku.attributes[].(variantId, optionId)`.
- Stock is computed at two levels:
  - Per selected SKU (combination): used for gating add‑to‑cart and quantity max
  - Aggregate available SKUs (no variants): sum of `sku.stock > 0`

Cart flow (admin demo):

- Uses `useAddToCart` with `{ productId, skuId, quantity, variantOptions }` and shows a `CartSuccessModal` on success.

---

## VariantSelector (`admin/src/components/common/VariantSelector.jsx`)

Props:

- `variants`: array of `{ _id, name, options: [{ _id, value }] }`
- `selectedOptions`: map `{ [variantId]: optionId }`
- `onOptionSelect(variantId, optionId)`: selection handler
- `disabled`: disables interactions
- `stockInfo`: optional map `{ [variantId]: { [optionId]: number } }` to indicate availability and show badges

Behavior:

- Renders option buttons with selection/availability styles
- If `stockInfo` is provided, shows a small badge for per‑option stock (green/yellow/red thresholds)

---

## Add Product (`/products/add`)

Multi‑tab form:

- Tabs: Basic Info, Organization, Pricing, Variants, Images, Settings, Summary
- Form state `formData` (e.g., `title`, `description`, `brand`, `categories`, `collections`, `tags`, `basePrice`, `comparePrice`, `variants`, `status`, `trackInventory`, `weight`, `features`)
- Images are managed separately via a `files` array and submitted as `FormData` under `images` field(s)

Important details:

- Arrays (`categories`, `collections`, `tags`, `variants`, `features`) are stringified before appending to `FormData`
- Image previews use `URL.createObjectURL`; URLs are revoked on cleanup
- Summary tab presents a read‑only snapshot with quick “edit” links to jump to a given tab

Submit:

- On “Create Product”, constructs a `FormData` payload and calls `useCreateProduct().mutateAsync(formData)`; navigates back to `/products` on success

---

## Edit Product (`/products/:id/edit`)

Similar structure to Add Product with pre‑filled values and corresponding update mutation (see `EditProduct.jsx`).

---

## Error & Loading States

- List and Details pages render skeletons/placeholders while loading, and user‑friendly empty/error messages when applicable.
- Add to Cart button becomes disabled when pending; delete button shows a disabled “Deleting…” label during mutation.

---

## Testing Checklist

- List
  - Search debounce updates results
  - Filters (status, brand, category) apply correctly and can be cleared
  - Pagination changes fetch results for the chosen page/size
  - Delete shows confirm modal and removes product on confirm
- Details
  - Thumbnails change the main image
  - Variant selection resolves to a valid SKU; pricing and stock reflect selection
  - Quantity cannot exceed available stock; buttons disable appropriately
  - Add to Cart succeeds with `variantOptions` and shows success modal
  - Description, Features, and Reviews render only when present
- Add/Edit
  - All tabs accept input and persist within the session
  - Features can be added/removed
  - Images accept multiple files and show previews; removing an image revokes the preview URL
  - Submit creates/updates product and navigates to the list

---

## Notes & Conventions

- Variant auto‑select prioritizes in‑stock options to reduce friction
- Display names for brand/category/collection are resolved from lookup hooks with memoized helpers
- Price rendering prefers the selected SKU price, then falls back to `basePrice`
- All pages adhere to the shared design tokens/classes defined in `admin/src/index.css`

---

## Quick Reference

- List page actions: View Details • Edit • Delete
- Details essentials: Gallery • Pricing • Classifications • Variants • Stock • Quantity • Add to Cart • Description • Features • Reviews
- Add/Edit essentials: Multi‑tab, `FormData` for images, arrays JSON‑stringified, summary review before submit


