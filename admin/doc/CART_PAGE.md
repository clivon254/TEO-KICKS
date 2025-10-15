### Cart Page (Admin)

This page displays the user’s cart with quantity controls, coupon application, price breakdown, and navigation to checkout.

---

## Route & File

- Route: `/cart`
- File: `admin/src/pages/Cart.jsx`

---

## Data & Mutations

- Cart: `useGetCart`
- Mutations: `useUpdateCartItem`, `useRemoveFromCart`, `useClearCart`
- Coupons: `useValidateCoupon`, `useApplyCoupon` (validation + apply pattern)

Memoized helpers compute subtotal, discount, and final total. Coupon state is persisted in `localStorage` under `appliedCoupon`.

---

## UI Structure

- Header: back to products, title, item count
- Items list: image (primary or first), title, variant summary, unit price
- Quantity controls (desktop and mobile layouts)
- Remove item; Clear All button (with confirm modal)
- Summary card:
  - Coupon section (apply/remove)
  - Subtotal, discount (type/value), total
  - Proceed to Checkout and Continue Shopping buttons

---

## Coupon Flow

- User enters code (uppercased); Enter key applies
- Validate call sends `{ code, orderAmount: subtotal }`
- On success, `appliedCoupon` saves `{ code, discountAmount, name, discountType, discountValue }` in state and localStorage
- Revalidation on subtotal changes adjusts discount; removes coupon if invalid

---

## Quantity & Removal

- Quantity must be ≥ 1
- `useUpdateCartItem` updates by `skuId` and new quantity
- `useRemoveFromCart` removes by `skuId`
- `useClearCart` clears all; confirmation modal warns about coupon removal

---

## Price Calculations

- Subtotal: sum of `item.price * item.quantity`
- Discount: from `appliedCoupon.discountAmount`
- Final Total: `subtotal - discount` (must be > 0 to proceed)

---

## Edge Cases & States

- Loading: skeleton for header and items
- Error: retry button reloads page
- Empty cart: friendly prompt and button to go back to products

---

## Testing Checklist

- Update quantity reflects immediately and respects min constraints
- Remove and Clear All behave correctly; clear modal disables during pending
- Applying coupon persists to localStorage and revalidates on subtotal changes
- Final total gating blocks checkout when ≤ 0
- Proceed to checkout navigates to `/checkout`


