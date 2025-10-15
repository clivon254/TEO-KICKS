### Client Checkout Page

Customer-facing multi-step checkout with order creation and payment initiation.

---

## Route & File

- Route: `/checkout`
- File: `client/src/pages/Checkout.jsx`

---

## Steps & State

Steps: Location → Order Type → Timing → Address → Payment → Summary

State:

- `location`: in_shop | away
- `orderType`: pickup | delivery (address step hidden for pickup)
- `timing`: now or scheduled datetime
- `addressId`: simple input placeholder
- `paymentMode`: post_to_bill | pay_now
- `paymentMethod`: cash | mpesa_stk | paystack_card
- `payerPhone`/`payerEmail`: prefilled from `user`
- `coupon`: from `localStorage.appliedCoupon`

Totals: `subtotal`, `discount`, `total` (discount capped to subtotal)

---

## Flows

- Post-to-Bill & Cash:
  - Create order → fetch invoice → clear coupon → navigate `/payment-status?method=post_to_bill|cash&orderId=...&invoiceId=...`
  - On error: navigate with `error` param

- M‑Pesa STK:
  - Ensure order+invoice → POST pay-invoice (mpesa_stk) → navigate with `method=mpesa` and parameters

- Paystack:
  - Ensure order+invoice → POST pay-invoice (paystack_card) → navigate with `method=paystack` and parameters → open `authorizationUrl`

Cart protection: Redirect to `/cart` if cart empty.

---

## Testing Checklist

- Step navigation and jump edits
- Address hidden for pickup
- Discount included in totals
- Cash/Post-to-Bill immediate navigation to status
- M‑Pesa/Paystack navigate with correct params; Paystack opens new tab


