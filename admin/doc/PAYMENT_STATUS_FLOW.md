# Payment Status Flow Documentation

## Overview

This document outlines the unified payment status flow for all payment methods in the TEO KICKS e-commerce platform. All payment methods redirect to the `/payment-status` page, but with different tracking strategies based on each method's characteristics.

---

## Table of Contents

1. [Payment Method Categories](#1-payment-method-categories)
2. [M-Pesa Flow](#2-mpesa-flow-category-a)
3. [Paystack Flow](#3-paystack-flow-category-a)
4. [Cash Flow](#4-cash-flow-category-b)
5. [Post-to-Bill Flow](#5-post-to-bill-flow-category-b)
6. [Payment Status State Machine](#6-payment-status-state-machine)
7. [Error Handling Matrix](#7-error-handling-matrix)
8. [Payment Status Page Logic](#8-payment-status-page-logic-flow)
9. [Retry Button Behavior](#9-retry-button-behavior)
10. [State Transitions by Method](#10-state-transitions-by-method)
11. [Display Components by State](#11-display-components-by-state)
12. [Socket Usage Summary](#12-socket-usage-summary)
13. [Fallback Query Summary](#13-fallback-query-summary)
14. [Order Data Loading Strategy](#14-order-data-loading-strategy)
15. [URL Parameters by Method](#15-url-parameters-by-method)
16. [Backend Integration Points](#16-backend-integration-points-read-only)
17. [Implementation Checklist](#17-implementation-checklist)
18. [User Experience Summary](#18-user-experience-summary)

---

## 1. Payment Method Categories

### Category A: Real-time Payment Tracking (M-Pesa, Paystack)
- **Characteristics**: Requires socket subscription for live updates
- **Tracking**: Polling/fallback mechanisms for status verification
- **Duration**: Payment can be PENDING for extended periods (5-120 seconds)
- **Order Creation**: Happens BEFORE payment initiation

### Category B: Deferred Payment Methods (Cash, Post-to-Bill)
- **Characteristics**: No payment tracking needed (payment happens later)
- **Tracking**: None (instant success/failure based on order creation)
- **Duration**: Immediate determination after order creation attempt
- **Order Creation**: Success/failure determines payment status page state

---

## 2. M-Pesa Flow (Category A)

### Checkout Process

1. User selects **"Pay Now"** → **"M-Pesa"**
2. Enters phone number (format: 254XXXXXXXXX)
3. Clicks **"Complete Order"**
4. **Backend Actions**:
   - Creates order + invoice
   - Initiates M-Pesa STK push via Daraja API
   - Returns: `paymentId`, `checkoutRequestId`, `orderId`, `invoiceId`
5. **Frontend Navigation**:
   ```
   /payment-status?method=mpesa&paymentId=xxx&orderId=xxx&checkoutRequestId=xxx&provider=mpesa&invoiceId=xxx&payerPhone=254XXXXXXXXX
   ```

### Payment Status Page Behavior

1. **Load Order Data**:
   - Fetch order by `orderId` from URL params
   - Extract: `order.items`, `order.pricing`, `order.status`
   - Display items and breakdown immediately

2. **Socket Connection**:
   - Connect to Socket.IO server
   - Subscribe to payment room: `socket.emit('subscribe-to-payment', paymentId)`

3. **Real-time Event Listeners**:
   - **`callback.received`**: Primary event for M-Pesa callback results
     - Contains `CODE` (result code) and `message`
     - Handles all M-Pesa result codes (0, 1, 1032, 1037, 2001, etc.)
     - Updates UI state immediately
   - **`payment.updated`**: Database update confirmation
     - Logs payment status changes
   - **`receipt.created`**: Final confirmation of successful payment
     - Optional success indicator

4. **Fallback Timer (60 seconds)**:
   - If no `callback.received` event within 60s
   - Query M-Pesa status directly via `queryMpesaByCheckoutId` API
   - Parse result code and update UI
   - **Critical**: Only runs for M-Pesa (not other methods)

5. **States & Transitions**:
   - Initial: **PENDING** ("Awaiting approval on your phone...")
   - Success: **SUCCESS** ("Payment Successful! 🎉")
   - Failure: **FAILED** (Error message based on result code)

6. **Retry Logic**:
   - On failure, user clicks "Retry Payment"
   - Calls `/payments/pay-invoice` with same `invoiceId`
   - Receives new `paymentId` and `checkoutRequestId`
   - Updates URL params
   - Restarts socket subscription and fallback timer
   - New STK push sent to user's phone

### Why This Works

- M-Pesa payments are **asynchronous** (user must approve on phone)
- Callback typically arrives in 5-60 seconds
- Direct query API available as fallback
- Real-time updates provide excellent UX
- Backend handles all M-Pesa result codes

---

## 3. Paystack Flow (Category A)

### Checkout Process

1. User selects **"Pay Now"** → **"Card"**
2. Enters email address
3. Clicks **"Complete Order"**
4. **Backend Actions**:
   - Creates order + invoice
   - Initializes Paystack transaction
   - Returns: `authorizationUrl`, `paymentId`, `reference`, `orderId`, `invoiceId`
5. **Open Paystack Window**:
   - `window.open(authorizationUrl, '_blank')` - Opens payment page in new window
6. **Frontend Navigation**:
   ```
   /payment-status?method=paystack&paymentId=xxx&orderId=xxx&reference=xxx&provider=paystack&invoiceId=xxx&payerEmail=user@example.com
   ```

### Payment Status Page Behavior

1. **Load Order Data**:
   - Fetch order by `orderId` from URL params
   - Extract: `order.items`, `order.pricing`, `order.status`
   - Display items and breakdown immediately

2. **Socket Connection**:
   - Connect to Socket.IO server
   - Subscribe to payment room: `socket.emit('subscribe-to-payment', paymentId)`

3. **Real-time Event Listeners**:
   - **`payment.updated`**: Primary event for webhook-driven updates
     - Triggered when Paystack webhook updates payment status in database
     - Contains payment status: `PAID`, `FAILED`, `PENDING`
     - Updates UI state immediately
   - **`receipt.created`**: Confirmation of successful payment
     - Marks payment as complete
   - **NO `callback.received`** (M-Pesa specific - don't listen)

4. **NO Fallback Timer**:
   - Paystack has **no status query API** like M-Pesa
   - Rely entirely on webhook → database → socket updates
   - If webhook delayed, user can retry (generates new authorization URL)

5. **States & Transitions**:
   - Initial: **PENDING** ("Complete payment in the popup window...")
   - Success: **SUCCESS** ("Card payment processed successfully!")
   - Failure: **FAILED** ("Card declined" or specific error)

6. **User Guidance**:
   - Show message: "Complete payment in the Paystack window"
   - If user closes window without completing: remains PENDING
   - User can retry to open new Paystack window

7. **Retry Logic**:
   - On failure (or if user didn't complete), clicks "Retry Payment"
   - Calls `/payments/pay-invoice` with same `invoiceId`
   - Receives new `authorizationUrl`, `paymentId`, `reference`
   - Opens new Paystack window
   - Updates URL params
   - Keeps socket subscription active (doesn't restart)

### Why No Fallback

- Paystack payments happen in **external window** (outside our control)
- **No status query API** available (unlike M-Pesa)
- Rely 100% on **webhook → socket updates**
- If webhook delayed/failed, user retries (new transaction)
- Backend webhook handler is reliable for production use

---

## 4. Cash Flow (Category B)

### Checkout Process

1. User selects **"Pay Now"** → **"Cash"**
2. Clicks **"Complete Order"**
3. **Backend Actions**:
   - Attempts to create order + invoice
   - **Success**: Returns `orderId`, `invoiceId`, payment marked as `UNPAID`
   - **Failure**: Returns error (network, validation, stock, server error)
4. **Frontend Navigation**:
   ```
   /payment-status?method=cash&orderId=xxx&invoiceId=xxx
   ```
   **Note**: If order creation fails, `orderId`/`invoiceId` may be missing

### Payment Status Page Behavior

#### Scenario 1: Order Creation Success

1. **Load Order Data**:
   - Successfully fetch order by `orderId`
   - Extract: `order.items`, `order.pricing`, `order.status`

2. **NO Socket Connection** (skip entirely)

3. **NO Polling/Tracking** (skip entirely)

4. **Immediate State**: **SUCCESS**
   - No waiting, no spinner
   - Jump directly to success view

5. **Display**:
   - Icon: Green checkmark ✓
   - Title: **"Order Placed Successfully!"**
   - Message: **"Pay cash when you receive your order"**
   - Show: Order items, full pricing breakdown, order number
   - Additional info: "Collect from store" or "Pay on delivery"

6. **Actions**:
   - Primary: **"Go to Orders"** button → Navigate to `/orders`
   - No retry button needed

#### Scenario 2: Order Creation Failed

1. **Load Order Data**:
   - Fetch fails (400/404/500 error)
   - Possible causes:
     - Network error
     - Validation error (missing address, invalid data)
     - Stock unavailable
     - Server error

2. **NO Socket Connection** (skip entirely)

3. **NO Polling/Tracking** (skip entirely)

4. **Immediate State**: **FAILED**
   - Show error view immediately

5. **Display**:
   - Icon: Red X ✗
   - Title: **"Order Creation Failed"**
   - Message: Specific error from backend
     - "Network error - please try again"
     - "Stock unavailable for selected items"
     - "Invalid order data"
     - "Server error - please retry"
   - Show: May not have order items (order doesn't exist yet)

6. **Actions**:
   - Primary: **"Retry Order"** button → Re-attempts order creation
   - Secondary: **"Back to Cart"** button → Navigate to `/cart`

### Retry Logic (Order Creation Failed)

- **Retry Order** button calls `/orders/create` API again
- **Cart should still be intact** (backend doesn't clear cart until order succeeds)
- On success:
  - New `orderId` and `invoiceId` received
  - Update URL params
  - Update state to **SUCCESS**
  - Show success view
- On failure:
  - Show error message again
  - Retry button remains available

### Why This Approach

- **Order creation can fail** for various reasons (network, validation, stock, server)
- User needs **immediate feedback** (no waiting required)
- **No payment tracking needed** (cash collected later by admin/rider)
- **Backend marks payment as UNPAID** or creates no payment record initially
- Order status: **PLACED**, Payment status: **UNPAID**

---

## 5. Post-to-Bill Flow (Category B)

### Checkout Process

1. User selects **"Post to Bill"**
2. Clicks **"Complete Order"**
3. **Backend Actions**:
   - Attempts to create order + invoice
   - **Success**: Returns `orderId`, `invoiceId`, no payment record yet
   - **Failure**: Returns error (network, validation, bill limit exceeded, server error)
4. **Frontend Navigation**:
   ```
   /payment-status?method=post_to_bill&orderId=xxx&invoiceId=xxx
   ```
   **Note**: If order creation fails, `orderId`/`invoiceId` may be missing

### Payment Status Page Behavior

#### Scenario 1: Order Creation Success

1. **Load Order Data**:
   - Successfully fetch order by `orderId`
   - Extract: `order.items`, `order.pricing`, `order.status`
   - Optionally fetch cumulative bill amount

2. **NO Socket Connection** (skip entirely)

3. **NO Polling/Tracking** (skip entirely)

4. **Immediate State**: **SUCCESS**
   - No waiting, no spinner
   - Jump directly to success view

5. **Display**:
   - Icon: Green checkmark ✓
   - Title: **"Order Posted to Bill!"**
   - Message: **"You can pay this bill later"**
   - Show: Order items, full pricing breakdown, order number
   - Additional info (optional): Cumulative bill amount across all unpaid orders

6. **Actions**:
   - Primary: **"Go to Orders"** button → Navigate to `/orders`
   - Secondary (optional): **"View My Bills"** button → Navigate to bills page
   - No retry button needed

#### Scenario 2: Order Creation Failed

1. **Load Order Data**:
   - Fetch fails (400/404/500 error)
   - Possible causes:
     - Network error
     - Validation error
     - Bill limit exceeded (store policy)
     - Server error

2. **NO Socket Connection** (skip entirely)

3. **NO Polling/Tracking** (skip entirely)

4. **Immediate State**: **FAILED**
   - Show error view immediately

5. **Display**:
   - Icon: Red X ✗
   - Title: **"Failed to Post Order to Bill"**
   - Message: Specific error from backend
     - "Network error - please try again"
     - "Bill limit exceeded - please pay existing bills first"
     - "Invalid order data"
     - "Server error - please retry"
   - Show: May not have order items (order doesn't exist yet)

6. **Actions**:
   - Primary: **"Retry Order"** button → Re-attempts order creation
   - Secondary: **"Back to Cart"** button → Navigate to `/cart`

### Retry Logic (Order Creation Failed)

- **Retry Order** button calls `/orders/create` API again
- **Cart should still be intact** (backend doesn't clear cart until order succeeds)
- On success:
  - New `orderId` and `invoiceId` received
  - Update URL params
  - Update state to **SUCCESS**
  - Show success view
- On failure:
  - Show error message again
  - Retry button remains available

### Why This Approach

- **Order creation can fail** for various reasons
- User needs **immediate feedback** (no waiting required)
- **No payment tracking needed** (payment happens later when user pays all bills)
- **Backend creates invoice without payment record** (created when bills paid later)
- Order status: **PLACED**, No payment record initially

---

## 6. Payment Status State Machine

### Overall State Flow

```
INITIAL (Page Mount)
    ↓
LOADING (Fetching order data)
    ↓
┌─────────────────────────────────┐
│  Order Data Load Successful?     │
└─────────────────────────────────┘
    ↓                    ↓
   YES                  NO
    ↓                    ↓
[Branch by Method]    FAILED State
    ↓                (Show error + retry)
    ↓
    ├──→ M-Pesa: PENDING → SUCCESS/FAILED
    ├──→ Paystack: PENDING → SUCCESS/FAILED
    ├──→ Cash: Immediate SUCCESS
    └──→ Post-to-Bill: Immediate SUCCESS
```

### State Definitions

- **INITIAL**: Page just mounted, extracting URL params
- **LOADING**: Fetching order data from backend
- **PENDING**: Payment in progress (M-Pesa/Paystack only)
- **SUCCESS**: Order created successfully (all methods) OR payment completed (M-Pesa/Paystack)
- **FAILED**: Order creation failed OR payment failed

---

## 7. Error Handling Matrix

### M-Pesa Errors

| Error Type | M-Pesa Code | When Occurs | State | User Action |
|------------|-------------|-------------|-------|-------------|
| Order creation fails | N/A | During checkout | FAILED | Navigate back to cart/checkout |
| STK push initiation fails | N/A | After order creation | FAILED | Retry payment |
| User cancelled | 1032 | During STK prompt | FAILED | Retry payment |
| Insufficient balance | 1 | During STK prompt | FAILED | Retry payment (top up first) |
| Request timeout | 1037 | No user response | FAILED | Retry payment |
| Wrong PIN entered | 2001 | During STK prompt | FAILED | Retry payment |
| Unable to lock subscriber | 1001 | M-Pesa system | FAILED | Retry payment |
| Transaction expired | 1019 | Took too long | FAILED | Retry payment |
| Invalid phone number | 1025 | Bad phone format | FAILED | Back to checkout, fix phone |
| System error | 1026 | M-Pesa system | FAILED | Retry payment later |
| Internal error | 1036 | Backend/M-Pesa | FAILED | Retry payment |
| Max retries reached | 1050 | Too many attempts | FAILED | Retry payment later |
| Request processing | 9999 | Still processing | PENDING | Keep waiting |
| Payment successful | 0 | Approved & paid | SUCCESS | Go to orders |

### Paystack Errors

| Error Type | When Occurs | State | User Action |
|------------|-------------|-------|-------------|
| Order creation fails | During checkout | FAILED | Navigate back to cart/checkout |
| Paystack init fails | After order creation | FAILED | Retry payment |
| User abandons payment | Closes Paystack window | PENDING | Retry payment (new window) |
| Card declined | In Paystack window | FAILED | Retry payment |
| Insufficient funds | In Paystack window | FAILED | Retry payment (different card) |
| Webhook not received | After payment attempt | PENDING (indefinite) | Retry payment or contact support |
| Payment successful | Webhook confirms | SUCCESS | Go to orders |

### Cash Errors

| Error Type | When Occurs | State | User Action |
|------------|-------------|-------|-------------|
| Order creation success | Backend creates order | SUCCESS | Go to orders |
| Network error | During order creation | FAILED | Retry order creation |
| Validation error | Invalid order data | FAILED | Back to cart, fix issues |
| Stock unavailable | Item out of stock | FAILED | Back to cart, update items |
| Server error | Backend failure | FAILED | Retry order creation |

### Post-to-Bill Errors

| Error Type | When Occurs | State | User Action |
|------------|-------------|-------|-------------|
| Order creation success | Backend creates order | SUCCESS | Go to orders |
| Network error | During order creation | FAILED | Retry order creation |
| Validation error | Invalid order data | FAILED | Back to cart, fix issues |
| Bill limit exceeded | Store policy limit | FAILED | Pay existing bills first |
| Server error | Backend failure | FAILED | Retry order creation |

---

## 8. Payment Status Page Logic Flow

### On Page Mount

```javascript
// 1. Extract URL Parameters
const method = searchParams.get('method') // 'mpesa' | 'paystack' | 'cash' | 'post_to_bill'
const orderId = searchParams.get('orderId')
const paymentId = searchParams.get('paymentId')
const checkoutRequestId = searchParams.get('checkoutRequestId') // M-Pesa only
const reference = searchParams.get('reference') // Paystack only
const invoiceId = searchParams.get('invoiceId')
const payerPhone = searchParams.get('payerPhone') // M-Pesa
const payerEmail = searchParams.get('payerEmail') // Paystack

// 2. Set Initial State
setPaymentView({ status: 'LOADING', title: 'Loading...', message: 'Please wait' })

// 3. Load Order Data (for all methods)
try {
  const orderResponse = await orderAPI.getOrderById(orderId)
  const order = orderResponse.data.data.order
  
  // Set cart items and pricing breakdown
  setCart({ items: order.items })
  setOrderBreakdown(order.pricing)
  
  // Order loaded successfully - proceed to method branching
  
} catch (error) {
  // Order load failed - determine action based on method
  if (method === 'cash' || method === 'post_to_bill') {
    // Order creation might have failed - show retry order creation
    setPaymentView({
      status: 'FAILED',
      title: 'Order Creation Failed',
      message: error.response?.data?.message || 'Failed to create order',
    })
    // User can retry order creation
    
  } else if (method === 'mpesa' || method === 'paystack') {
    // Order should exist for these methods - show retry order fetch
    setPaymentView({
      status: 'FAILED',
      title: 'Failed to Load Order',
      message: 'Unable to load order details. Please try again.',
    })
    // User can retry fetching order data
  }
  
  return // Don't proceed to payment tracking
}

// 4. Branch by Payment Method
if (method === 'mpesa') {
  // === M-PESA FLOW ===
  
  // Connect socket
  socketRef.current = io(baseUrl, { 
    transports: ['websocket', 'polling'],
    withCredentials: false 
  })
  
  // Subscribe to payment room
  socketRef.current.on('connect', () => {
    socketRef.current.emit('subscribe-to-payment', paymentId)
  })
  
  // Listen for callback.received (PRIMARY for M-Pesa)
  socketRef.current.on('callback.received', (payload) => {
    const resultCode = payload.CODE
    const resultMessage = payload.message
    
    // Handle all M-Pesa result codes
    switch (resultCode) {
      case 0:
        setPaymentView({ status: 'SUCCESS', title: 'Payment Successful! 🎉', message: resultMessage })
        clearPaymentTimers()
        break
      case 1:
        setPaymentView({ status: 'FAILED', title: 'Insufficient Balance', message: resultMessage })
        clearPaymentTimers()
        break
      case 1032:
        setPaymentView({ status: 'FAILED', title: 'Payment Cancelled', message: resultMessage })
        clearPaymentTimers()
        break
      // ... handle all other codes
    }
  })
  
  // Listen for payment.updated (secondary confirmation)
  socketRef.current.on('payment.updated', (payload) => {
    console.log('Payment database updated:', payload)
  })
  
  // Listen for receipt.created (success confirmation)
  socketRef.current.on('receipt.created', (payload) => {
    console.log('Receipt created:', payload)
  })
  
  // Set fallback timer (60 seconds)
  timeoutRef.current = setTimeout(async () => {
    if (checkoutRequestId) {
      setIsFallbackActive(true)
      setIsLoading(true)
      
      const res = await paymentAPI.queryMpesaByCheckoutId(checkoutRequestId)
      const { resultCode, resultDesc } = res.data.data
      
      // Handle result code same as callback.received
      // Update state, clear timers
      
      setIsLoading(false)
    }
  }, 60 * 1000)
  
  // Set initial PENDING state
  setPaymentView({
    status: 'PENDING',
    title: 'Payment Processing',
    message: 'Check your phone for M-Pesa prompt...',
  })
  
} else if (method === 'paystack') {
  // === PAYSTACK FLOW ===
  
  // Connect socket
  socketRef.current = io(baseUrl, { 
    transports: ['websocket', 'polling'],
    withCredentials: false 
  })
  
  // Subscribe to payment room
  socketRef.current.on('connect', () => {
    socketRef.current.emit('subscribe-to-payment', paymentId)
  })
  
  // Listen for payment.updated (PRIMARY for Paystack - webhook-driven)
  socketRef.current.on('payment.updated', (payload) => {
    if (payload.status === 'PAID') {
      setPaymentView({ status: 'SUCCESS', title: 'Payment Successful! 🎉', message: 'Card payment processed' })
      clearPaymentTimers()
    } else if (payload.status === 'FAILED') {
      setPaymentView({ status: 'FAILED', title: 'Payment Failed', message: payload.message || 'Card declined' })
      clearPaymentTimers()
    }
  })
  
  // Listen for receipt.created (success confirmation)
  socketRef.current.on('receipt.created', (payload) => {
    console.log('Receipt created:', payload)
  })
  
  // NO FALLBACK TIMER (Paystack has no query API)
  
  // Set initial PENDING state
  setPaymentView({
    status: 'PENDING',
    title: 'Payment Processing',
    message: 'Complete payment in the Paystack window...',
  })
  
} else if (method === 'cash') {
  // === CASH FLOW ===
  
  // NO socket connection
  // NO polling/tracking
  // NO fallback timer
  
  // Immediate SUCCESS (order already loaded successfully above)
  setPaymentView({
    status: 'SUCCESS',
    title: 'Order Placed Successfully!',
    message: 'Pay cash when you receive your order',
  })
  
} else if (method === 'post_to_bill') {
  // === POST-TO-BILL FLOW ===
  
  // NO socket connection
  // NO polling/tracking
  // NO fallback timer
  
  // Immediate SUCCESS (order already loaded successfully above)
  setPaymentView({
    status: 'SUCCESS',
    title: 'Order Posted to Bill!',
    message: 'You can pay this bill later',
  })
}
```

### Cleanup on Unmount

```javascript
useEffect(() => {
  return () => {
    // Clear timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }
}, [])
```

---

## 9. Retry Button Behavior

### M-Pesa Retry

**Trigger**: User clicks "Retry Payment" after failure

**What Happens**:
1. Call `POST /payments/pay-invoice` with same `invoiceId`
   ```javascript
   const res = await paymentAPI.payInvoice({ 
     invoiceId, 
     method: 'mpesa_stk', 
     payerPhone 
   })
   ```
2. Receive new payment details:
   - New `paymentId`
   - New `checkoutRequestId`
   - New STK push initiated
3. Update URL parameters:
   ```javascript
   const params = new URLSearchParams({
     paymentId: newPaymentId,
     orderId: orderId,
     method: 'mpesa',
     checkoutRequestId: newCheckoutRequestId,
     invoiceId: invoiceId,
     payerPhone: payerPhone
   })
   navigate(`/payment-status?${params}`, { replace: true })
   ```
4. Reset state to PENDING
5. Clear existing socket and timers
6. Restart socket subscription with new `paymentId`
7. Restart 60s fallback timer

**User Sees**: "Retrying payment... Check your phone for new M-Pesa prompt"

---

### Paystack Retry

**Trigger**: User clicks "Retry Payment" after failure or timeout

**What Happens**:
1. Call `POST /payments/pay-invoice` with same `invoiceId`
   ```javascript
   const res = await paymentAPI.payInvoice({ 
     invoiceId, 
     method: 'paystack_card', 
     payerEmail 
   })
   ```
2. Receive new payment details:
   - New `paymentId`
   - New `reference`
   - New `authorizationUrl`
3. Open new Paystack window:
   ```javascript
   window.open(authorizationUrl, '_blank')
   ```
4. Update URL parameters:
   ```javascript
   const params = new URLSearchParams({
     paymentId: newPaymentId,
     orderId: orderId,
     method: 'paystack',
     reference: newReference,
     invoiceId: invoiceId,
     payerEmail: payerEmail
   })
   navigate(`/payment-status?${params}`, { replace: true })
   ```
5. Reset state to PENDING
6. **Keep socket connection active** (don't restart)
7. Continue listening for webhook updates

**User Sees**: "Retrying payment... New Paystack window opened. Complete payment there."

---

### Cash Retry (Order Creation Failed)

**Trigger**: User clicks "Retry Order" after order creation failure

**What Happens**:
1. Call `POST /orders/create` with order data from cart
   ```javascript
   const res = await orderAPI.createOrder({
     location,
     type: orderType,
     timing,
     addressId,
     paymentPreference: { mode: 'pay_now', method: 'cash' },
     packagingOptionId,
     couponCode,
   })
   ```
2. **If successful**:
   - Receive `orderId`, `invoiceId`
   - Update URL parameters
   - Set state to SUCCESS
   - Show "Order placed! Pay cash on delivery"
   - **Cart cleared by backend**
3. **If failed again**:
   - Show error message
   - Retry button remains available
   - **Cart still intact** (backend only clears on success)

**User Sees**: 
- Success: "Order placed successfully! Pay cash when you receive your order"
- Failure: Error message + retry button remains

---

### Post-to-Bill Retry (Order Creation Failed)

**Trigger**: User clicks "Retry Order" after order creation failure

**What Happens**:
1. Call `POST /orders/create` with order data from cart
   ```javascript
   const res = await orderAPI.createOrder({
     location,
     type: orderType,
     timing,
     addressId,
     paymentPreference: { mode: 'post_to_bill' },
     packagingOptionId,
     couponCode,
   })
   ```
2. **If successful**:
   - Receive `orderId`, `invoiceId`
   - Update URL parameters
   - Set state to SUCCESS
   - Show "Order posted to bill!"
   - **Cart cleared by backend**
3. **If failed again**:
   - Show error message
   - Retry button remains available
   - **Cart still intact**

**User Sees**:
- Success: "Order posted to bill! You can pay later"
- Failure: Error message + retry button remains

---

## 10. State Transitions by Method

### M-Pesa

```
LOADING → PENDING → (Socket: callback.received) → SUCCESS/FAILED
                 → (Fallback: 60s timeout) → SUCCESS/FAILED

FAILED → (Retry Payment) → PENDING → SUCCESS/FAILED
```

**Timeline**: 0s → 5-60s → Final State

---

### Paystack

```
LOADING → PENDING → (Socket: payment.updated from webhook) → SUCCESS/FAILED

FAILED → (Retry Payment) → PENDING → SUCCESS/FAILED
```

**Timeline**: 0s → Variable (no timeout) → Final State

**Note**: No automatic timeout - relies on webhook

---

### Cash

```
LOADING → (Order Load Success) → SUCCESS
       → (Order Load Failed) → FAILED → (Retry Order) → SUCCESS/FAILED
```

**Timeline**: 0s → Immediate Success/Failure

**Note**: No PENDING state - payment not tracked

---

### Post-to-Bill

```
LOADING → (Order Load Success) → SUCCESS
       → (Order Load Failed) → FAILED → (Retry Order) → SUCCESS/FAILED
```

**Timeline**: 0s → Immediate Success/Failure

**Note**: No PENDING state - payment not tracked

---

## 11. Display Components by State

### LOADING (All Methods)

```
┌─────────────────────────────────┐
│                                 │
│        [Spinner Icon]           │
│                                 │
│   Loading Order Details...      │
│                                 │
│      Please wait                │
│                                 │
└─────────────────────────────────┘

Actions: None (or skeleton loader)
```

---

### PENDING (M-Pesa, Paystack Only)

```
┌─────────────────────────────────┐
│                                 │
│   [Animated Blue Spinner] 🔵    │
│                                 │
│   Processing Payment...         │
│                                 │
│   M-Pesa: Check your phone for  │
│           M-Pesa prompt         │
│                                 │
│   Paystack: Complete payment in │
│             the popup window    │
│                                 │
├─────────────────────────────────┤
│  [Order Items + Breakdown]      │
│  (displayed while waiting)      │
├─────────────────────────────────┤
│                                 │
│  Payment ID: xxx...xxx          │
│                                 │
│      [Hide Button]              │
│                                 │
└─────────────────────────────────┘

Actions: "Hide" button (minimizes, doesn't close)
```

---

### SUCCESS (All Methods)

```
┌─────────────────────────────────┐
│                                 │
│       [Green Checkmark] ✓       │
│                                 │
│   M-Pesa: Payment Successful!   │
│   Paystack: Payment Successful! │
│   Cash: Order Placed!           │
│   Post-to-Bill: Posted to Bill! │
│                                 │
│   M-Pesa: Your payment was      │
│           received              │
│   Paystack: Card payment        │
│             processed           │
│   Cash: Pay cash when you       │
│         receive order           │
│   Post-to-Bill: Pay later       │
│                                 │
├─────────────────────────────────┤
│  [Order Items + Full Breakdown] │
│  Order #: ORD-2025-123456       │
├─────────────────────────────────┤
│                                 │
│   [Go to Orders Button]         │
│                                 │
│   (Post-to-Bill also shows:)    │
│   [View My Bills Button]        │
│                                 │
└─────────────────────────────────┘

Actions: Navigate to orders or bills
```

---

### FAILED (All Methods)

```
┌─────────────────────────────────┐
│                                 │
│         [Red X Icon] ✗          │
│                                 │
│   M-Pesa/Paystack:              │
│     Payment Failed              │
│                                 │
│   Cash/Post-to-Bill:            │
│     Order Creation Failed       │
│                                 │
│   [Specific Error Message]      │
│   - Insufficient balance        │
│   - User cancelled              │
│   - Network error               │
│   - Stock unavailable           │
│   - etc.                        │
│                                 │
├─────────────────────────────────┤
│  [Order Items + Breakdown]      │
│  (if order exists)              │
├─────────────────────────────────┤
│                                 │
│   M-Pesa/Paystack:              │
│   [Retry Payment] [Close]       │
│                                 │
│   Cash/Post-to-Bill:            │
│   [Retry Order] [Back to Cart]  │
│                                 │
└─────────────────────────────────┘

Actions: Retry payment/order or go back
```

---

## 12. Socket Usage Summary

| Method | Socket Connected? | Events Listened | Purpose |
|--------|-------------------|-----------------|---------|
| **M-Pesa** | ✅ Yes | `callback.received` (primary)<br>`payment.updated`<br>`receipt.created` | Real-time M-Pesa callback updates |
| **Paystack** | ✅ Yes | `payment.updated` (primary)<br>`receipt.created` | Webhook-driven status updates |
| **Cash** | ❌ No | None | No payment tracking needed |
| **Post-to-Bill** | ❌ No | None | No payment tracking needed |

---

## 13. Fallback Query Summary

| Method | Has Fallback? | When Triggered | What API Called | Why |
|--------|---------------|----------------|-----------------|-----|
| **M-Pesa** | ✅ Yes | After 60s if no callback | `GET /payments/query-mpesa/:checkoutRequestId` | M-Pesa provides status query API |
| **Paystack** | ❌ No | Never | N/A | No query API available |
| **Cash** | ❌ No | Never | N/A | Order result already determined |
| **Post-to-Bill** | ❌ No | Never | N/A | Order result already determined |

**Critical**: Only M-Pesa should trigger fallback query. Do not add for other methods.

---

## 14. Order Data Loading Strategy

### For All Methods

```javascript
// On page mount
const loadOrderData = async () => {
  const orderId = searchParams.get('orderId')
  
  if (!orderId) {
    // Handle case where orderId is missing
    if (method === 'cash' || method === 'post_to_bill') {
      setPaymentView({
        status: 'FAILED',
        title: 'Order Creation Failed',
        message: 'No order ID found - order creation may have failed',
      })
    }
    return
  }
  
  try {
    const response = await orderAPI.getOrderById(orderId)
    const order = response.data.data.order
    
    // Set order data
    setCart({ items: order.items })
    setOrderBreakdown(order.pricing)
    
    // Proceed to payment tracking (method-specific)
    
  } catch (error) {
    // Fetch failed - determine action based on method
    handleOrderLoadError(error)
  }
}
```

### Critical Differences by Method

#### M-Pesa/Paystack (Order MUST Exist)
- Order is created **before** payment initiation
- If fetch fails → **Retry fetching only** (don't retry order creation)
- Order already exists in database
- Error likely: Network issue, temporary backend issue

#### Cash/Post-to-Bill (Order Might NOT Exist)
- Order creation happens at checkout
- If fetch fails → **Order creation likely failed**
- Need to **retry order creation**, not just fetching
- Error likely: Validation, stock, bill limit, server error

---

## 15. URL Parameters by Method

### M-Pesa
```
/payment-status?method=mpesa
                &paymentId=<paymentId>
                &orderId=<orderId>
                &checkoutRequestId=<checkoutRequestId>
                &provider=mpesa
                &invoiceId=<invoiceId>
                &payerPhone=254XXXXXXXXX
```

**Required**: `method`, `paymentId`, `orderId`, `checkoutRequestId`

---

### Paystack
```
/payment-status?method=paystack
                &paymentId=<paymentId>
                &orderId=<orderId>
                &reference=<reference>
                &provider=paystack
                &invoiceId=<invoiceId>
                &payerEmail=user@example.com
```

**Required**: `method`, `paymentId`, `orderId`, `reference`

---

### Cash
```
/payment-status?method=cash
                &orderId=<orderId>
                &invoiceId=<invoiceId>
```

**Required**: `method`

**Note**: `orderId`/`invoiceId` may be missing if order creation failed

---

### Post-to-Bill
```
/payment-status?method=post_to_bill
                &orderId=<orderId>
                &invoiceId=<invoiceId>
```

**Required**: `method`

**Note**: `orderId`/`invoiceId` may be missing if order creation failed

---

## 16. Backend Integration Points (Read-Only)

### M-Pesa Backend Behavior

- Order created ✓
- Invoice created ✓
- Payment record created with status: `PENDING` ✓
- STK push initiated via Daraja API ✓
- **Socket Events Emitted**:
  - `callback.received`: When M-Pesa callback webhook received
  - `payment.updated`: When payment status updated in database
  - `receipt.created`: When receipt generated after successful payment

---

### Paystack Backend Behavior

- Order created ✓
- Invoice created ✓
- Payment record created with status: `PENDING` ✓
- Paystack transaction initialized ✓
- Returns `authorizationUrl` for user to complete payment ✓
- **Socket Events Emitted**:
  - `payment.updated`: When Paystack webhook received and payment status updated
  - `receipt.created`: When receipt generated after successful payment

---

### Cash Backend Behavior

- **If order creation succeeds**:
  - Order created ✓
  - Invoice created ✓
  - Payment record created with status: `UNPAID` (or no payment record yet)
  - No socket events
  - Cart cleared ✓

- **If order creation fails**:
  - No order created
  - No invoice created
  - No payment record
  - Cart remains intact (for retry)

---

### Post-to-Bill Backend Behavior

- **If order creation succeeds**:
  - Order created ✓
  - Invoice created ✓
  - No payment record initially (created when user pays all bills later)
  - No socket events
  - Cart cleared ✓

- **If order creation fails**:
  - No order created
  - No invoice created
  - No payment record
  - Cart remains intact (for retry)

---

## 17. Implementation Checklist

### Checkout.jsx Changes

- [ ] **M-Pesa Handler** (Already working - no changes)
  - Create order → Initiate STK → Navigate to payment status

- [ ] **Paystack Handler** (New)
  - Create order → Initialize Paystack → Open authorization URL → Navigate to payment status

- [ ] **Cash Handler** (New)
  - Attempt order creation
  - If success: Navigate to payment status with orderId
  - If failure: Navigate to payment status without orderId (or with error param)

- [ ] **Post-to-Bill Handler** (New)
  - Attempt order creation
  - If success: Navigate to payment status with orderId
  - If failure: Navigate to payment status without orderId (or with error param)

---

### PaymentStatus.jsx Changes

- [ ] **Method Branching in useEffect**
  - Extract `method` from URL params
  - Branch logic based on method value

- [ ] **Conditional Socket Connection**
  ```javascript
  const shouldConnectSocket = ['mpesa', 'paystack'].includes(method)
  
  if (shouldConnectSocket) {
    // Initialize socket connection
  }
  ```

- [ ] **Conditional Fallback Timer**
  ```javascript
  const shouldSetFallback = method === 'mpesa' && checkoutRequestId
  
  if (shouldSetFallback) {
    // Set 60s timeout to query M-Pesa status
  }
  ```

- [ ] **Method-Specific Socket Listeners**
  - M-Pesa: Listen to `callback.received`, `payment.updated`, `receipt.created`
  - Paystack: Listen to `payment.updated`, `receipt.created` only
  - Cash/Post-to-Bill: No socket listeners

- [ ] **Instant Success for Cash/Post-to-Bill**
  ```javascript
  if (method === 'cash' || method === 'post_to_bill') {
    // Skip socket, skip polling
    // Immediately set SUCCESS state after order loads
  }
  ```

- [ ] **Order Load Error Handling**
  ```javascript
  const handleOrderLoadError = (error) => {
    if (['cash', 'post_to_bill'].includes(method)) {
      // Order creation likely failed
      setPaymentView({
        status: 'FAILED',
        title: 'Order Creation Failed',
        message: error.message,
        retryType: 'order' // Retry order creation
      })
    } else {
      // Order should exist for mpesa/paystack
      setPaymentView({
        status: 'FAILED',
        title: 'Failed to Load Order',
        message: 'Please retry',
        retryType: 'fetch' // Retry fetching order
      })
    }
  }
  ```

- [ ] **Retry Button Logic**
  ```javascript
  const handleRetry = async () => {
    if (['mpesa', 'paystack'].includes(method)) {
      await retryPayment() // Re-initiate payment
    } else if (['cash', 'post_to_bill'].includes(method)) {
      await retryOrderCreation() // Re-create order
    }
  }
  ```

---

## 18. User Experience Summary

### Payment Method Comparison

| Method | Initial Wait | Max Wait Time | Can Fail After Navigate? | Retry Strategy | User Must Do |
|--------|--------------|---------------|-------------------------|----------------|--------------|
| **M-Pesa** | 5-60s | 60s (then fallback) | No (order exists, payment tracked) | Re-initiate STK push | Approve on phone |
| **Paystack** | Variable | No limit (webhook) | No (order exists, payment tracked) | New Paystack window | Complete in window |
| **Cash** | 0s (instant) | 0s | Yes (if order creation fails) | Retry order creation | None initially |
| **Post-to-Bill** | 0s (instant) | 0s | Yes (if order creation fails) | Retry order creation | None initially |

---

### Cart Behavior After Navigation

#### M-Pesa/Paystack:
- Backend clears cart **after order creation succeeds** (before payment)
- When user navigates to `/payment-status`, cart is already empty
- Retry payment doesn't affect cart (order already exists with saved items)
- User cannot modify order items during payment

#### Cash/Post-to-Bill:
- Backend clears cart **only after order creation succeeds**
- If order creation fails, cart remains intact
- User can retry order creation with same cart items
- If order succeeds on retry, cart is cleared
- User can go back to cart to modify items if needed

---

## Success Criteria

✅ **Unified Interface**: All payment methods use same `/payment-status` page

✅ **Method-Aware Logic**: Conditional socket connection, polling, and fallback based on method

✅ **Graceful Failures**: All methods handle failures and provide clear retry options

✅ **Real-time Updates**: M-Pesa and Paystack show live payment progress

✅ **Instant Feedback**: Cash and Post-to-Bill provide immediate success/failure

✅ **Backend Unchanged**: All changes are frontend routing and state management

✅ **User-Friendly**: Clear messages, appropriate actions, consistent experience

---

## Key Architectural Principles

1. **Single Responsibility**: Payment Status page handles ONE thing - showing payment/order status
2. **Method Polymorphism**: Same UI, different behaviors based on method type
3. **Fail-Safe Design**: Every error state has a recovery path
4. **Progressive Enhancement**: Socket updates enhance UX, fallback ensures reliability
5. **State Clarity**: Users always know what's happening and what to do next

---

## Notes for Developers

- M-Pesa fallback timer is **exclusive to M-Pesa** - do not add for other methods
- Paystack has no query API - rely on webhooks only
- Cash and Post-to-Bill can fail during **order creation** - handle this gracefully
- Socket connections should be cleaned up on unmount to prevent memory leaks
- URL params should be updated on retry to reflect new payment/order IDs
- Backend behavior remains unchanged - this is purely frontend restructuring

---

**Last Updated**: October 1, 2025  
**Version**: 1.0  
**Author**: TEO KICKS Development Team
