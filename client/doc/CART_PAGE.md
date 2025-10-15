### Client Cart Page

Displays cart items, quantity controls, coupon application, totals, and checkout navigation.

---

## Route & File

- Route: `/cart`
- File: `client/src/pages/Cart.jsx`

---

## Data & Mutations

- Cart: `useGetCart`
- Mutations: `useUpdateCartItem`, `useRemoveFromCart`, `useClearCart`
- Coupon APIs: `couponAPI.validateCoupon(code, subtotal)`

Coupon persistence in `localStorage.appliedCoupon`; revalidated on subtotal changes.

---

## UI

- Items: image, title, variant summary, unit price, quantity (+/−), remove
- Summary: coupon apply/remove, subtotal, discount, total, proceed button
- Empty state: continue shopping button

---

## Validation

- Quantity ≥ 1
- Total must be > 0 to proceed

---

## Testing Checklist

- Quantity updates and persists
- Remove and clear all work; modal blocks during pending
- Coupon persists and revalidates; discount adjusts with subtotal
- Proceed navigates to `/checkout`


