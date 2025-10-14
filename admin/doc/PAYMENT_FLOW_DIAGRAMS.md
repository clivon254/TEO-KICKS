# Payment Status Flow Diagrams

This document contains visual flow diagrams for all payment methods in the TEO KICKS platform.

---

## 1. Overall Payment Flow - High Level

```mermaid
graph TD
    A[User at Checkout] --> B{Select Payment Method}
    B -->|M-Pesa| C[M-Pesa Flow]
    B -->|Card| D[Paystack Flow]
    B -->|Cash| E[Cash Flow]
    B -->|Post to Bill| F[Post-to-Bill Flow]
    
    C --> G[Payment Status Page]
    D --> G
    E --> G
    F --> G
    
    G --> H{Payment Method?}
    H -->|M-Pesa| I[Socket + Fallback Tracking]
    H -->|Paystack| J[Socket Tracking Only]
    H -->|Cash| K[Instant Success/Failure]
    H -->|Post to Bill| L[Instant Success/Failure]
    
    I --> M{Result}
    J --> M
    K --> M
    L --> M
    
    M -->|Success| N[Show Success View]
    M -->|Failed| O[Show Error View]
    
    N --> P[Go to Orders]
    O --> Q{Can Retry?}
    Q -->|Yes| R[Retry Button]
    Q -->|No| S[Back to Cart]
    
    R --> B

    style C fill:#e1f5ff
    style D fill:#fff4e1
    style E fill:#e8f5e9
    style F fill:#f3e5f5
    style G fill:#fff9c4
    style N fill:#c8e6c9
    style O fill:#ffcdd2
```

---

## 2. M-Pesa Flow - Detailed

```mermaid
sequenceDiagram
    participant User
    participant Checkout
    participant Backend
    participant Daraja as M-Pesa Daraja
    participant PaymentStatus as Payment Status Page
    participant Socket as Socket.IO

    User->>Checkout: Select M-Pesa & Enter Phone
    User->>Checkout: Click "Complete Order"
    
    Checkout->>Backend: POST /orders/create
    Backend->>Backend: Create Order + Invoice
    Backend-->>Checkout: orderId, invoiceId
    
    Checkout->>Backend: POST /payments/pay-invoice (M-Pesa)
    Backend->>Daraja: STK Push Request
    Daraja-->>Backend: checkoutRequestId
    Backend->>Backend: Create Payment (PENDING)
    Backend-->>Checkout: paymentId, checkoutRequestId
    
    Checkout->>PaymentStatus: Navigate with params
    
    PaymentStatus->>Socket: Connect & Subscribe
    PaymentStatus->>Backend: GET /orders/:orderId
    Backend-->>PaymentStatus: Order Details
    
    PaymentStatus->>PaymentStatus: Show PENDING State
    PaymentStatus->>PaymentStatus: Start 60s Fallback Timer
    
    alt User Approves on Phone (Within 60s)
        Daraja->>Backend: Callback Webhook (ResultCode=0)
        Backend->>Backend: Update Payment (PAID)
        Backend->>Socket: Emit callback.received
        Socket-->>PaymentStatus: callback.received event
        PaymentStatus->>PaymentStatus: Clear Timer
        PaymentStatus->>PaymentStatus: Show SUCCESS State
        User->>PaymentStatus: Click "Go to Orders"
        PaymentStatus->>User: Navigate to /orders
    else User Cancels/Fails
        Daraja->>Backend: Callback Webhook (ResultCode!=0)
        Backend->>Backend: Update Payment (FAILED)
        Backend->>Socket: Emit callback.received
        Socket-->>PaymentStatus: callback.received event
        PaymentStatus->>PaymentStatus: Clear Timer
        PaymentStatus->>PaymentStatus: Show FAILED State
        User->>PaymentStatus: Click "Retry Payment"
        PaymentStatus->>Backend: POST /payments/pay-invoice (retry)
        Backend->>Daraja: New STK Push
        Daraja-->>Backend: New checkoutRequestId
        Backend-->>PaymentStatus: New paymentId
        PaymentStatus->>PaymentStatus: Restart Tracking
    else No Callback After 60s (Fallback)
        PaymentStatus->>Backend: GET /payments/query-mpesa/:checkoutRequestId
        Backend->>Daraja: Query Transaction Status
        Daraja-->>Backend: ResultCode + Status
        Backend-->>PaymentStatus: Payment Status
        PaymentStatus->>PaymentStatus: Update State Based on Result
    end
```

---

## 3. Paystack Flow - Detailed

```mermaid
sequenceDiagram
    participant User
    participant Checkout
    participant Backend
    participant Paystack
    participant PaymentStatus as Payment Status Page
    participant Socket as Socket.IO
    participant Webhook as Paystack Webhook

    User->>Checkout: Select Card & Enter Email
    User->>Checkout: Click "Complete Order"
    
    Checkout->>Backend: POST /orders/create
    Backend->>Backend: Create Order + Invoice
    Backend-->>Checkout: orderId, invoiceId
    
    Checkout->>Backend: POST /payments/pay-invoice (Paystack)
    Backend->>Paystack: Initialize Transaction
    Paystack-->>Backend: authorizationUrl, reference
    Backend->>Backend: Create Payment (PENDING)
    Backend-->>Checkout: paymentId, reference, authorizationUrl
    
    Checkout->>User: Open Paystack Window (authorizationUrl)
    Checkout->>PaymentStatus: Navigate with params
    
    PaymentStatus->>Socket: Connect & Subscribe
    PaymentStatus->>Backend: GET /orders/:orderId
    Backend-->>PaymentStatus: Order Details
    
    PaymentStatus->>PaymentStatus: Show PENDING State
    PaymentStatus->>PaymentStatus: NO Fallback Timer
    
    alt User Completes Payment in Paystack Window
        User->>Paystack: Enter Card & Pay
        Paystack->>Webhook: Send Webhook (success)
        Webhook->>Backend: Process Webhook
        Backend->>Backend: Update Payment (PAID)
        Backend->>Socket: Emit payment.updated
        Socket-->>PaymentStatus: payment.updated event
        PaymentStatus->>PaymentStatus: Show SUCCESS State
        User->>PaymentStatus: Click "Go to Orders"
        PaymentStatus->>User: Navigate to /orders
    else User Closes Window or Payment Fails
        User->>Paystack: Close Window / Card Declined
        Paystack->>Webhook: Send Webhook (failed)
        Webhook->>Backend: Process Webhook
        Backend->>Backend: Update Payment (FAILED)
        Backend->>Socket: Emit payment.updated
        Socket-->>PaymentStatus: payment.updated event
        PaymentStatus->>PaymentStatus: Show FAILED State
        User->>PaymentStatus: Click "Retry Payment"
        PaymentStatus->>Backend: POST /payments/pay-invoice (retry)
        Backend->>Paystack: New Transaction
        Paystack-->>Backend: New authorizationUrl
        Backend-->>PaymentStatus: New paymentId, authorizationUrl
        PaymentStatus->>User: Open New Paystack Window
        PaymentStatus->>PaymentStatus: Continue Socket Listening
    end
```

---

## 4. Cash Flow - Detailed

```mermaid
sequenceDiagram
    participant User
    participant Checkout
    participant Backend
    participant PaymentStatus as Payment Status Page

    User->>Checkout: Select Cash
    User->>Checkout: Click "Complete Order"
    
    alt Order Creation Success
        Checkout->>Backend: POST /orders/create (cash)
        Backend->>Backend: Create Order + Invoice
        Backend->>Backend: Mark Payment: UNPAID
        Backend->>Backend: Clear User Cart
        Backend-->>Checkout: orderId, invoiceId
        
        Checkout->>PaymentStatus: Navigate (?method=cash&orderId=xxx)
        
        PaymentStatus->>Backend: GET /orders/:orderId
        Backend-->>PaymentStatus: Order Details (items, pricing)
        
        PaymentStatus->>PaymentStatus: NO Socket Connection
        PaymentStatus->>PaymentStatus: NO Polling
        PaymentStatus->>PaymentStatus: Set State: SUCCESS
        
        PaymentStatus->>User: Display Success View
        Note over PaymentStatus: ✓ Order Placed Successfully!<br/>Pay cash on delivery/pickup
        
        User->>PaymentStatus: Click "Go to Orders"
        PaymentStatus->>User: Navigate to /orders
        
    else Order Creation Failed
        Checkout->>Backend: POST /orders/create (cash)
        Backend-->>Checkout: Error (400/500)
        Note over Backend: Network Error<br/>Validation Error<br/>Stock Unavailable<br/>Server Error
        
        Checkout->>PaymentStatus: Navigate (?method=cash&orderId=missing)
        
        PaymentStatus->>Backend: GET /orders/:orderId
        Backend-->>PaymentStatus: 404 Not Found
        
        PaymentStatus->>PaymentStatus: NO Socket Connection
        PaymentStatus->>PaymentStatus: NO Polling
        PaymentStatus->>PaymentStatus: Set State: FAILED
        
        PaymentStatus->>User: Display Error View
        Note over PaymentStatus: ✗ Order Creation Failed<br/>[Error Message]<br/>Cart Still Intact
        
        User->>PaymentStatus: Click "Retry Order"
        PaymentStatus->>Backend: POST /orders/create (retry)
        
        alt Retry Success
            Backend->>Backend: Create Order Successfully
            Backend-->>PaymentStatus: orderId, invoiceId
            PaymentStatus->>PaymentStatus: Set State: SUCCESS
            PaymentStatus->>User: Display Success View
        else Retry Failed
            Backend-->>PaymentStatus: Error
            PaymentStatus->>PaymentStatus: Remain in FAILED State
            Note over PaymentStatus: User can retry again<br/>or go back to cart
        end
    end
```

---

## 5. Post-to-Bill Flow - Detailed

```mermaid
sequenceDiagram
    participant User
    participant Checkout
    participant Backend
    participant PaymentStatus as Payment Status Page

    User->>Checkout: Select Post to Bill
    User->>Checkout: Click "Complete Order"
    
    alt Order Creation Success
        Checkout->>Backend: POST /orders/create (post_to_bill)
        Backend->>Backend: Create Order + Invoice
        Backend->>Backend: No Payment Record Yet
        Backend->>Backend: Clear User Cart
        Backend-->>Checkout: orderId, invoiceId
        
        Checkout->>PaymentStatus: Navigate (?method=post_to_bill&orderId=xxx)
        
        PaymentStatus->>Backend: GET /orders/:orderId
        Backend-->>PaymentStatus: Order Details (items, pricing)
        
        PaymentStatus->>PaymentStatus: NO Socket Connection
        PaymentStatus->>PaymentStatus: NO Polling
        PaymentStatus->>PaymentStatus: Set State: SUCCESS
        
        PaymentStatus->>User: Display Success View
        Note over PaymentStatus: ✓ Order Posted to Bill!<br/>You can pay later
        
        User->>PaymentStatus: Click "Go to Orders" or "View Bills"
        PaymentStatus->>User: Navigate to orders/bills
        
    else Order Creation Failed
        Checkout->>Backend: POST /orders/create (post_to_bill)
        Backend-->>Checkout: Error (400/500)
        Note over Backend: Network Error<br/>Bill Limit Exceeded<br/>Validation Error<br/>Server Error
        
        Checkout->>PaymentStatus: Navigate (?method=post_to_bill&orderId=missing)
        
        PaymentStatus->>Backend: GET /orders/:orderId
        Backend-->>PaymentStatus: 404 Not Found
        
        PaymentStatus->>PaymentStatus: NO Socket Connection
        PaymentStatus->>PaymentStatus: NO Polling
        PaymentStatus->>PaymentStatus: Set State: FAILED
        
        PaymentStatus->>User: Display Error View
        Note over PaymentStatus: ✗ Failed to Post to Bill<br/>[Error Message]<br/>Cart Still Intact
        
        User->>PaymentStatus: Click "Retry Order"
        PaymentStatus->>Backend: POST /orders/create (retry)
        
        alt Retry Success
            Backend->>Backend: Create Order Successfully
            Backend-->>PaymentStatus: orderId, invoiceId
            PaymentStatus->>PaymentStatus: Set State: SUCCESS
            PaymentStatus->>User: Display Success View
        else Retry Failed
            Backend-->>PaymentStatus: Error
            PaymentStatus->>PaymentStatus: Remain in FAILED State
            Note over PaymentStatus: User can retry again<br/>or go back to cart
        end
    end
```

---

## 6. Payment Status Page - Method Branching Logic

```mermaid
flowchart TD
    Start([Payment Status Page Mount]) --> ExtractParams[Extract URL Params:<br/>method, orderId, paymentId, etc.]
    
    ExtractParams --> LoadOrder[Load Order Data]
    
    LoadOrder --> OrderLoadCheck{Order Load<br/>Successful?}
    
    OrderLoadCheck -->|No| LoadFailed{Method Type?}
    LoadFailed -->|M-Pesa/Paystack| FailedFetch[FAILED State:<br/>'Failed to Load Order'<br/>Retry Fetch Button]
    LoadFailed -->|Cash/Post-to-Bill| FailedCreate[FAILED State:<br/>'Order Creation Failed'<br/>Retry Order Button]
    
    OrderLoadCheck -->|Yes| MethodBranch{Payment Method?}
    
    MethodBranch -->|M-Pesa| MpesaInit[Initialize M-Pesa Tracking]
    MethodBranch -->|Paystack| PaystackInit[Initialize Paystack Tracking]
    MethodBranch -->|Cash| CashInit[Instant Success View]
    MethodBranch -->|Post to Bill| BillInit[Instant Success View]
    
    MpesaInit --> MpesaSocket[Connect Socket<br/>Subscribe to Payment]
    MpesaSocket --> MpesaListeners[Listen: callback.received<br/>payment.updated<br/>receipt.created]
    MpesaListeners --> MpesaTimer[Start 60s Fallback Timer]
    MpesaTimer --> MpesaPending[Show PENDING State<br/>'Check phone for prompt']
    
    PaystackInit --> PaystackSocket[Connect Socket<br/>Subscribe to Payment]
    PaystackSocket --> PaystackListeners[Listen: payment.updated<br/>receipt.created]
    PaystackListeners --> PaystackPending[Show PENDING State<br/>'Complete in popup']
    PaystackPending --> PaystackNote[NO Fallback Timer]
    
    CashInit --> CashSuccess[Show SUCCESS State<br/>'Pay cash on delivery']
    BillInit --> BillSuccess[Show SUCCESS State<br/>'Posted to bill']
    
    MpesaPending --> MpesaWait{Callback or<br/>Fallback?}
    MpesaWait -->|Callback Received| MpesaResult{Result Code?}
    MpesaWait -->|60s Timeout| MpesaQuery[Query M-Pesa API]
    MpesaQuery --> MpesaResult
    
    MpesaResult -->|0 Success| MpesaSuccess[SUCCESS State]
    MpesaResult -->|Error Code| MpesaFailed[FAILED State<br/>Show Error Message]
    
    PaystackPending --> PaystackWait[Wait for Webhook]
    PaystackWait --> PaystackWebhook{Webhook<br/>Received?}
    PaystackWebhook -->|PAID| PaystackSuccess[SUCCESS State]
    PaystackWebhook -->|FAILED| PaystackFailed[FAILED State<br/>Show Error Message]
    
    MpesaSuccess --> ShowSuccess[Display Success View]
    PaystackSuccess --> ShowSuccess
    CashSuccess --> ShowSuccess
    BillSuccess --> ShowSuccess
    
    MpesaFailed --> ShowFailed[Display Failed View]
    PaystackFailed --> ShowFailed
    FailedFetch --> ShowFailed
    FailedCreate --> ShowFailed
    
    ShowSuccess --> UserSuccess{User Action}
    UserSuccess --> GoOrders[Navigate to Orders]
    
    ShowFailed --> UserFailed{User Action}
    UserFailed -->|Retry| RetryType{What to Retry?}
    UserFailed -->|Back| BackCart[Navigate to Cart]
    
    RetryType -->|M-Pesa/Paystack| RetryPayment[Re-initiate Payment]
    RetryType -->|Cash/Post-to-Bill| RetryOrder[Re-create Order]
    
    RetryPayment --> MpesaInit
    RetryOrder --> LoadOrder

    style MpesaPending fill:#e3f2fd
    style PaystackPending fill:#fff3e0
    style CashSuccess fill:#e8f5e9
    style BillSuccess fill:#f3e5f5
    style MpesaSuccess fill:#c8e6c9
    style PaystackSuccess fill:#c8e6c9
    style MpesaFailed fill:#ffcdd2
    style PaystackFailed fill:#ffcdd2
    style FailedFetch fill:#ffcdd2
    style FailedCreate fill:#ffcdd2
```

---

## 7. Socket Event Flow - M-Pesa vs Paystack

```mermaid
graph TD
    subgraph "M-Pesa Socket Events"
        M1[Payment Status Page] -->|emit| M2[subscribe-to-payment]
        M3[Backend/Webhook] -->|emit| M4[callback.received]
        M4 --> M5[Payment Status: Update UI]
        
        M3 -->|emit| M6[payment.updated]
        M6 --> M7[Payment Status: Log Update]
        
        M3 -->|emit| M8[receipt.created]
        M8 --> M9[Payment Status: Confirm Success]
    end
    
    subgraph "Paystack Socket Events"
        P1[Payment Status Page] -->|emit| P2[subscribe-to-payment]
        P3[Backend/Webhook] -->|emit| P4[payment.updated]
        P4 --> P5[Payment Status: Update UI]
        
        P3 -->|emit| P6[receipt.created]
        P6 --> P7[Payment Status: Confirm Success]
        
        P8[NO callback.received<br/>M-Pesa Only]
    end
    
    subgraph "Cash/Post-to-Bill"
        C1[No Socket Events<br/>No Connection Made]
    end

    style M4 fill:#ffd54f
    style M5 fill:#81c784
    style P4 fill:#ffd54f
    style P5 fill:#81c784
    style P8 fill:#ef5350
    style C1 fill:#90caf9
```

---

## 8. Retry Logic Flow

```mermaid
flowchart TD
    Start([User Clicks Retry]) --> CheckMethod{Payment Method?}
    
    CheckMethod -->|M-Pesa| MpesaRetry[Retry M-Pesa Payment]
    CheckMethod -->|Paystack| PaystackRetry[Retry Paystack Payment]
    CheckMethod -->|Cash| CashRetry[Retry Order Creation]
    CheckMethod -->|Post-to-Bill| BillRetry[Retry Order Creation]
    
    MpesaRetry --> MpesaAPI[POST /payments/pay-invoice<br/>method: mpesa_stk<br/>invoiceId: same]
    MpesaAPI --> MpesaResponse[Receive:<br/>- New paymentId<br/>- New checkoutRequestId]
    MpesaResponse --> MpesaUpdate[Update URL Params]
    MpesaUpdate --> MpesaReset[Clear Socket & Timers]
    MpesaReset --> MpesaRestart[Restart Socket + Fallback]
    MpesaRestart --> MpesaWait[Show PENDING State<br/>New STK Push Sent]
    
    PaystackRetry --> PaystackAPI[POST /payments/pay-invoice<br/>method: paystack_card<br/>invoiceId: same]
    PaystackAPI --> PaystackResponse[Receive:<br/>- New paymentId<br/>- New reference<br/>- New authorizationUrl]
    PaystackResponse --> PaystackWindow[Open New Paystack Window]
    PaystackWindow --> PaystackUpdate[Update URL Params]
    PaystackUpdate --> PaystackWait[Show PENDING State<br/>Socket Remains Active]
    
    CashRetry --> CashAPI[POST /orders/create<br/>paymentMethod: cash]
    CashAPI --> CashCheck{Order Created?}
    CashCheck -->|Yes| CashSuccess[Receive orderId, invoiceId<br/>Update URL<br/>Show SUCCESS State]
    CashCheck -->|No| CashFailed[Show Error<br/>Retry Available Again]
    
    BillRetry --> BillAPI[POST /orders/create<br/>paymentMode: post_to_bill]
    BillAPI --> BillCheck{Order Created?}
    BillCheck -->|Yes| BillSuccess[Receive orderId, invoiceId<br/>Update URL<br/>Show SUCCESS State]
    BillCheck -->|No| BillFailed[Show Error<br/>Retry Available Again]
    
    MpesaWait --> End([User Continues Journey])
    PaystackWait --> End
    CashSuccess --> End
    BillSuccess --> End
    CashFailed --> End
    BillFailed --> End

    style MpesaWait fill:#e3f2fd
    style PaystackWait fill:#fff3e0
    style CashSuccess fill:#c8e6c9
    style BillSuccess fill:#c8e6c9
    style CashFailed fill:#ffcdd2
    style BillFailed fill:#ffcdd2
```

---

## 9. State Transition Timeline

```
═══════════════════════════════════════════════════════════════════════

M-PESA TIMELINE:
─────────────────────────────────────────────────────────────────────

t=0s          t=5-60s              t=60s+           Final
  │               │                   │               │
  ▼               ▼                   ▼               ▼
LOADING ──────► PENDING ──────► (Callback) ──────► SUCCESS
                    │                                  │
                    │                                  ▼
                    └──────────► (Fallback) ──────► FAILED
                                  Query API         (Retry Available)

═══════════════════════════════════════════════════════════════════════

PAYSTACK TIMELINE:
─────────────────────────────────────────────────────────────────────

t=0s          t=Variable           No Timeout       Final
  │               │                                   │
  ▼               ▼                                   ▼
LOADING ──────► PENDING ──────► (Webhook) ──────► SUCCESS
                    │                                  │
                    │                                  ▼
                    └──────────► (Webhook) ──────► FAILED
                               or User Closes     (Retry Available)
                                  Window

═══════════════════════════════════════════════════════════════════════

CASH TIMELINE:
─────────────────────────────────────────────────────────────────────

t=0s          Immediate
  │               │
  ▼               ▼
LOADING ──────► SUCCESS  (if order created)
    │               │
    └──────────► FAILED   (if order creation failed)
                    │
                    └──────► (Retry Order) ──────► SUCCESS/FAILED

═══════════════════════════════════════════════════════════════════════

POST-TO-BILL TIMELINE:
─────────────────────────────────────────────────────────────────────

t=0s          Immediate
  │               │
  ▼               ▼
LOADING ──────► SUCCESS  (if order created)
    │               │
    └──────────► FAILED   (if order creation failed)
                    │
                    └──────► (Retry Order) ──────► SUCCESS/FAILED

═══════════════════════════════════════════════════════════════════════
```

---

## 10. Complete User Journey - All Methods

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CHECKOUT PAGE                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┬───────────────┐
                    │             │             │               │
                    ▼             ▼             ▼               ▼
            ┌──────────┐   ┌──────────┐   ┌────────┐   ┌────────────┐
            │  M-Pesa  │   │ Paystack │   │  Cash  │   │ Post-to-   │
            │          │   │          │   │        │   │    Bill    │
            └──────────┘   └──────────┘   └────────┘   └────────────┘
                    │             │             │               │
                    │             │             │               │
            Create Order    Create Order   Create Order   Create Order
            + Invoice       + Invoice      + Invoice      + Invoice
                    │             │             │               │
            Initiate STK    Init Paystack       │               │
                    │             │             │               │
                    │       Open Paystack       │               │
                    │         Window            │               │
                    │             │             │               │
                    └─────────────┴─────────────┴───────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PAYMENT STATUS PAGE                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┬───────────────┐
                    │             │             │               │
                    ▼             ▼             ▼               ▼
            ┌──────────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐
            │ Socket +     │ │ Socket    │ │ Instant  │ │ Instant    │
            │ 60s Fallback │ │ Only      │ │ Success  │ │ Success    │
            │              │ │           │ │          │ │            │
            │ PENDING      │ │ PENDING   │ │ SUCCESS  │ │ SUCCESS    │
            │   ↓          │ │   ↓       │ │          │ │            │
            │ SUCCESS/     │ │ SUCCESS/  │ │          │ │            │
            │ FAILED       │ │ FAILED    │ │          │ │            │
            └──────────────┘ └───────────┘ └──────────┘ └────────────┘
                    │             │             │               │
                    └─────────────┴─────────────┴───────────────┘
                                  │
                                  ▼
                            {Final State}
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌────────────┐  ┌────────────┐  ┌──────────────┐
            │  SUCCESS   │  │   FAILED   │  │   PENDING    │
            │            │  │            │  │  (Timeout)   │
            │ Go to      │  │ Retry      │  │              │
            │ Orders     │  │ Payment/   │  │ Manual       │
            │            │  │ Order      │  │ Check        │
            └────────────┘  └────────────┘  └──────────────┘
```

---

## 11. Error Recovery Paths

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ERROR STATES                                │
└─────────────────────────────────────────────────────────────────────┘

┌─ M-Pesa Error ──────────────────────────────────────────────────────┐
│                                                                      │
│  Order Exists ✓ → Payment Failed                                    │
│                                                                      │
│  Recovery Options:                                                   │
│  1. Retry Payment (new STK push)                                    │
│  2. Go to Orders (order saved, pay later)                           │
│  3. Contact Support                                                 │
│                                                                      │
│  Cart: Already cleared (order exists)                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─ Paystack Error ────────────────────────────────────────────────────┐
│                                                                      │
│  Order Exists ✓ → Payment Failed                                    │
│                                                                      │
│  Recovery Options:                                                   │
│  1. Retry Payment (new Paystack window)                             │
│  2. Go to Orders (order saved, pay later)                           │
│  3. Contact Support                                                 │
│                                                                      │
│  Cart: Already cleared (order exists)                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─ Cash Error ────────────────────────────────────────────────────────┐
│                                                                      │
│  Order Creation Failed ✗                                            │
│                                                                      │
│  Recovery Options:                                                   │
│  1. Retry Order Creation (same cart items)                          │
│  2. Back to Cart (modify items)                                     │
│  3. Contact Support                                                 │
│                                                                      │
│  Cart: Still intact (order never created)                           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─ Post-to-Bill Error ────────────────────────────────────────────────┐
│                                                                      │
│  Order Creation Failed ✗                                            │
│                                                                      │
│  Recovery Options:                                                   │
│  1. Retry Order Creation (same cart items)                          │
│  2. Back to Cart (modify items)                                     │
│  3. Pay Existing Bills (if limit exceeded)                          │
│  4. Contact Support                                                 │
│                                                                      │
│  Cart: Still intact (order never created)                           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 12. Socket vs No Socket Decision Tree

```mermaid
flowchart TD
    Start{Payment Method?} --> CheckMpesa{Is M-Pesa?}
    CheckMpesa -->|Yes| ConnectSocket1[Connect Socket ✓]
    CheckMpesa -->|No| CheckPaystack{Is Paystack?}
    
    CheckPaystack -->|Yes| ConnectSocket2[Connect Socket ✓]
    CheckPaystack -->|No| CheckCash{Is Cash?}
    
    CheckCash -->|Yes| NoSocket1[No Socket ✗]
    CheckCash -->|No| NoSocket2[No Socket ✗<br/>Post-to-Bill]
    
    ConnectSocket1 --> MpesaEvents[Listen:<br/>callback.received<br/>payment.updated<br/>receipt.created]
    MpesaEvents --> MpesaFallback[Set 60s Fallback ✓]
    
    ConnectSocket2 --> PaystackEvents[Listen:<br/>payment.updated<br/>receipt.created]
    PaystackEvents --> PaystackFallback[No Fallback ✗]
    
    NoSocket1 --> InstantCash[Instant SUCCESS<br/>No Tracking]
    NoSocket2 --> InstantBill[Instant SUCCESS<br/>No Tracking]

    style ConnectSocket1 fill:#c8e6c9
    style ConnectSocket2 fill:#c8e6c9
    style MpesaFallback fill:#fff9c4
    style PaystackFallback fill:#ffcdd2
    style NoSocket1 fill:#e1bee7
    style NoSocket2 fill:#e1bee7
```

---

## 13. Payment Status Page Component Structure

```
┌────────────────────────────────────────────────────────────────────┐
│                      Payment Status Page                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Status Icon & Title                       │  │
│  │  [Spinner/Checkmark/X]  +  [Title Text]                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Status Message                            │  │
│  │  Method-specific message about current state                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                Loading Indicator (Optional)                  │  │
│  │  Shown during fallback API call for M-Pesa                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Order Items Section                       │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │  [Product Image] Product Name                        │   │  │
│  │  │  Variant: Size 10                                    │   │  │
│  │  │  Qty: 2                                              │   │  │
│  │  │  KSh 1,500.00                                        │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │  (Repeat for each item)                                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Price Breakdown Section                     │  │
│  │  Subtotal:              KSh 3,000.00                        │  │
│  │  Discounts:            -KSh   300.00                        │  │
│  │  Packaging:             KSh    50.00                        │  │
│  │  Delivery:              KSh   200.00                        │  │
│  │  ────────────────────────────────────                       │  │
│  │  Total:                 KSh 2,950.00                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     Payment ID                               │  │
│  │  Payment ID: pay_xxxxxxxxxxxx (small text)                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                      Action Buttons (Fixed Bottom)                 │
│                                                                    │
│  SUCCESS:  [       Go to Orders        ]                          │
│                                                                    │
│  FAILED:   [ Retry Payment/Order ]  [ Close / Back to Cart ]     │
│                                                                    │
│  PENDING:  [         Hide          ]                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 14. Decision Matrix - Quick Reference

### Should I Connect Socket?

| Method | Connect? | Why? |
|--------|----------|------|
| M-Pesa | ✅ YES | Real-time callback updates |
| Paystack | ✅ YES | Webhook-driven updates |
| Cash | ❌ NO | No payment tracking |
| Post-to-Bill | ❌ NO | No payment tracking |

---

### Should I Set Fallback Timer?

| Method | Set Fallback? | Duration | Action |
|--------|---------------|----------|--------|
| M-Pesa | ✅ YES | 60 seconds | Query M-Pesa API |
| Paystack | ❌ NO | N/A | No query API available |
| Cash | ❌ NO | N/A | Instant determination |
| Post-to-Bill | ❌ NO | N/A | Instant determination |

---

### What Should Retry Button Do?

| Method | Retry Action | API Called | Result |
|--------|--------------|------------|--------|
| M-Pesa | Re-initiate payment | `POST /payments/pay-invoice` | New STK push |
| Paystack | Re-initiate payment | `POST /payments/pay-invoice` | New Paystack window |
| Cash | Re-create order | `POST /orders/create` | New order attempt |
| Post-to-Bill | Re-create order | `POST /orders/create` | New order attempt |

---

### When Can Order Creation Fail?

| Scenario | Affects | User Sees | Recovery |
|----------|---------|-----------|----------|
| Network error | All methods | "Network error" | Retry |
| Validation error | All methods | "Invalid data" | Back to cart, fix |
| Stock unavailable | All methods | "Stock unavailable" | Back to cart, update |
| Bill limit exceeded | Post-to-Bill only | "Bill limit exceeded" | Pay existing bills |
| Server error | All methods | "Server error" | Retry or contact support |

---

## 15. Backend Event Emissions

```mermaid
sequenceDiagram
    participant Daraja as M-Pesa/Paystack
    participant Webhook as Backend Webhook Handler
    participant DB as Database
    participant Socket as Socket.IO Server
    participant Client as Payment Status Page

    alt M-Pesa Callback
        Daraja->>Webhook: POST /webhooks/mpesa/callback
        Webhook->>DB: Update Payment Status
        Webhook->>Socket: emit('callback.received', payload)
        Webhook->>Socket: emit('payment.updated', payment)
        Socket-->>Client: Event: callback.received
        Socket-->>Client: Event: payment.updated
        
        alt Payment Successful
            Webhook->>DB: Create Receipt
            Webhook->>Socket: emit('receipt.created', receipt)
            Socket-->>Client: Event: receipt.created
        end
    end
    
    alt Paystack Webhook
        Daraja->>Webhook: POST /webhooks/paystack
        Webhook->>DB: Update Payment Status
        Webhook->>Socket: emit('payment.updated', payment)
        Socket-->>Client: Event: payment.updated
        
        alt Payment Successful
            Webhook->>DB: Create Receipt
            Webhook->>Socket: emit('receipt.created', receipt)
            Socket-->>Client: Event: receipt.created
        end
    end
```

---

## 16. Implementation Priority

### Phase 1: Foundation (Already Complete)
- ✅ M-Pesa flow with socket and fallback
- ✅ Order data loading
- ✅ Basic payment status UI

### Phase 2: Method Branching (Next)
1. Add method detection from URL params
2. Conditional socket connection
3. Conditional fallback timer (M-Pesa only)
4. Instant success for Cash/Post-to-Bill

### Phase 3: Paystack Integration
1. Add Paystack socket listeners (payment.updated only)
2. Handle Paystack retry logic
3. No fallback timer for Paystack

### Phase 4: Error Handling
1. Order load error handling (method-specific)
2. Retry button logic (payment vs order creation)
3. Cart preservation for failed Cash/Post-to-Bill

### Phase 5: Polish
1. Method-specific success messages
2. Loading states during retry
3. User guidance text
4. Testing all flows

---

**Diagram Legend:**
- 🔵 Blue: Processing/Pending states
- 🟢 Green: Success states
- 🔴 Red: Failed/Error states
- 🟡 Yellow: Critical decision points
- 🟣 Purple: User actions required

---

**Last Updated**: October 1, 2025  
**Version**: 1.0  
**For**: TEO KICKS Admin App - Payment Status Restructure
