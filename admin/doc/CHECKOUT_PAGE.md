### Checkout Page (Admin)

A multi-step flow collecting fulfillment preferences and initiating order creation and payment according to the selected mode.

---

## Route & File

- Route: `/checkout`
- File: `admin/src/pages/Checkout.jsx`

---

## Steps & State

Steps: Location → Order Type → Packaging → Timing → Address → Payment → Summary

State:

- Location: `in_shop` | `away`
- Order Type: `pickup` | `delivery` (address step hidden for pickup)
- Packaging: optional; fetched via `useGetActivePackagingPublic`; auto-select default
- Timing: order now or `isScheduled` + `scheduledAt` (datetime)
- Address: simple input stub (controlled by order type)
- Payment Mode: `post_to_bill` or `pay_now`
- Payment Method (when `pay_now`): `cash` | `mpesa_stk` | `paystack_card`
- Payer info: `payerPhone` (M‑Pesa), `payerEmail` (Paystack); prefilled from `user`
- Coupon: read from `localStorage.appliedCoupon`; cleared after order creation

Derived totals: `subtotal`, `packagingFee`, `discount`, `total` (discount capped to subtotal; all memoized)

---

## Navigation

- Progress bar and checkmarks row visualize progress
- Back goes to previous step, or `/cart` on step 0
- Summary shows editable shortcuts (jump to specific steps)

---

## Order Creation & Payments

APIs used: `cartAPI`, `orderAPI`, `paymentAPI`

Create Order payload:

```
{
  location,
  type: orderType,
  timing,
  addressId: canShowAddress ? addressId : null,
  paymentPreference: { mode: paymentMode, method: paymentMode === 'pay_now' ? paymentMethod : null },
  packagingOptionId: canShowPackaging ? selectedPackagingId : null,
  couponCode: coupon?.code || null,
  cartId: null,
  metadata: {}
}
```

Flows:

- Post to Bill (pay later) and Cash (pay now):
  - Save `checkoutData` in localStorage for retry
  - Create order, fetch invoice, refresh cart, clear coupon
  - Navigate to `/payment-status?method=post_to_bill|cash&orderId=...&invoiceId=...`
  - On failure, navigate to `/payment-status?method=...&error=...`

- M‑Pesa STK (pay now):
  - Ensure order+invoice exist (create if needed)
  - Call `paymentAPI.payInvoice({ method: 'mpesa_stk', payerPhone })`
  - Navigate to `/payment-status?method=mpesa&paymentId=...&orderId=...&checkoutRequestId=...&invoiceId=...&payerPhone=...`

- Paystack Card (pay now):
  - Ensure order+invoice exist (create if needed)
  - Call `paymentAPI.payInvoice({ method: 'paystack_card', payerEmail })`
  - Navigate to `/payment-status?method=paystack&paymentId=...&orderId=...&reference=...&invoiceId=...&payerEmail=...`
  - Open returned `authorizationUrl` in a new tab

Cart protection: redirect to `/cart` if loaded cart has zero items.

---

## Validation & Defaults

- Phone formatting for M‑Pesa: converts to `2547XXXXXXXX` pattern
- Packaging default: selects first default or first option
- Coupon: if cart becomes empty, coupon is cleared from localStorage

---

## Testing Checklist

- Step gating and jump edits behave correctly
- Packaging toggles change totals
- Timing scheduling restricts datetime to now or later
- Address step hidden for pickup
- Post-to-Bill/Cash navigate to payment status immediately after order creation
- M‑Pesa initiates STK and navigates with correct params
- Paystack opens authorization and navigates with correct params
- Cart refresh and coupon clearing after order creation


