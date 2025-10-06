# TEO KICKS - Notification System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Notification Types](#notification-types)
3. [Delivery Channels](#delivery-channels)
4. [Notification Scenarios](#notification-scenarios)
5. [Socket.IO Integration](#socketio-integration)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Real-time Flow](#real-time-flow)
11. [User Preferences](#user-preferences)
12. [Admin Management](#admin-management)

---

## Overview

The TEO KICKS notification system provides real-time, multi-channel notifications to keep customers and administrators informed about order status, payments, and system events. All notifications are delivered through Socket.IO for real-time updates and can be sent via three channels: in-app, SMS, and email.

### Key Features
- **Real-time delivery** via Socket.IO
- **Multi-channel support** (in-app, SMS, email)
- **User preference management**
- **Role-based notifications** (customer vs admin)
- **Event-driven architecture**
- **Persistent notification history**

---

## Notification Types

### 1. Order-Related Notifications
- `order_created` - New order placed
- `order_status_changed` - Order status updated
- `order_cancelled` - Order cancelled
- `order_delivered` - Order delivered successfully

### 2. Payment-Related Notifications
- `payment_success` - Payment completed successfully
- `payment_failed` - Payment failed
- `payment_pending` - Payment pending confirmation
- `refund_processed` - Refund completed

### 3. System Notifications
- `invoice_generated` - Invoice created for order
- `receipt_issued` - Receipt generated
- `low_stock_alert` - Product stock running low
- `promotion_alert` - New promotion available

### 4. Account Notifications
- `welcome_message` - Welcome message for new users
- `password_reset` - Password reset instructions
- `otp_verification` - OTP for account verification

---

## Delivery Channels

### 1. In-App Notifications
- **Primary channel** for real-time updates
- **Always enabled** for authenticated users
- **Persistent storage** in database
- **Visual indicators** (badge counts, popups)

### 2. SMS Notifications
- **Secondary channel** for critical updates
- **Africa's Talking API** integration
- **Phone number required**
- **Cost-effective** for urgent notifications

### 3. Email Notifications
- **Detailed information** channel
- **Nodemailer** integration
- **Rich formatting** support
- **Reliable delivery** with retry logic

---

## Notification Scenarios

### A. Order-Related Scenarios

#### A1. Customer Places Order
**Trigger**: Customer completes checkout
**Recipients**: 
- Customer (self)
- Admin users

**Notifications Sent**:
```javascript
// To Customer
{
  type: "order_created",
  channels: ["inapp", "sms", "email"],
  payload: {
    orderId: "ORD-123456",
    orderNumber: "ORD-2024-001",
    totalAmount: 2500,
    items: [...],
    estimatedDelivery: "2024-01-15"
  }
}

// To Admin
{
  type: "new_order_received",
  channels: ["inapp", "email"],
  payload: {
    orderId: "ORD-123456",
    customerName: "John Doe",
    customerPhone: "+254712345678",
    totalAmount: 2500,
    items: [...]
  }
}
```

#### A2. Admin Updates Order Status
**Trigger**: Admin changes order status
**Recipients**: Customer

**Notifications Sent**:
```javascript
{
  type: "order_status_changed",
  channels: ["inapp", "sms"],
  payload: {
    orderId: "ORD-123456",
    oldStatus: "confirmed",
    newStatus: "shipped",
    trackingNumber: "TRK-789",
    estimatedDelivery: "2024-01-16"
  }
}
```

#### A3. Order Delivered
**Trigger**: Admin marks order as delivered
**Recipients**: Customer

**Notifications Sent**:
```javascript
{
  type: "order_delivered",
  channels: ["inapp", "sms", "email"],
  payload: {
    orderId: "ORD-123456",
    deliveredAt: "2024-01-15T14:30:00Z",
    ratingPrompt: true,
    receiptAvailable: true
  }
}
```

### B. Payment-Related Scenarios

#### B1. Payment Success
**Trigger**: Payment completed successfully
**Recipients**: 
- Customer
- Admin

**Notifications Sent**:
```javascript
// To Customer
{
  type: "payment_success",
  channels: ["inapp", "sms"],
  payload: {
    paymentId: "PAY-123456",
    orderId: "ORD-123456",
    amount: 2500,
    method: "mpesa",
    receiptNumber: "RCP-789"
  }
}

// To Admin
{
  type: "payment_received",
  channels: ["inapp", "email"],
  payload: {
    paymentId: "PAY-123456",
    orderId: "ORD-123456",
    customerName: "John Doe",
    amount: 2500,
    method: "mpesa"
  }
}
```

#### B2. Payment Failed
**Trigger**: Payment fails or is cancelled
**Recipients**: Customer

**Notifications Sent**:
```javascript
{
  type: "payment_failed",
  channels: ["inapp", "sms"],
  payload: {
    paymentId: "PAY-123456",
    orderId: "ORD-123456",
    reason: "insufficient_funds",
    retryAvailable: true
  }
}
```

### C. System-Related Scenarios

#### C1. Low Stock Alert
**Trigger**: Product stock falls below threshold
**Recipients**: Admin users

**Notifications Sent**:
```javascript
{
  type: "low_stock_alert",
  channels: ["inapp", "email"],
  payload: {
    productId: "PROD-123",
    productName: "Nike Air Max",
    variant: "Size 10 - Black",
    currentStock: 2,
    threshold: 5
  }
}
```

#### C2. New Promotion
**Trigger**: Admin creates new promotion
**Recipients**: All customers (opt-in)

**Notifications Sent**:
```javascript
{
  type: "promotion_alert",
  channels: ["inapp", "email"],
  payload: {
    promotionId: "PROMO-123",
    title: "Black Friday Sale",
    description: "50% off all shoes",
    validUntil: "2024-01-31",
    couponCode: "BF50"
  }
}
```

---

## Socket.IO Integration

### Connection Setup
```javascript
// Frontend connection
const socket = io('ws://localhost:5000', {
  auth: {
    token: userToken
  }
})

// Backend authentication
socket.on('authenticate', (userId) => {
  socketConnections.set(userId, socket.id)
  socket.join(`user_${userId}`)
})
```

### Event Emission Patterns

#### 1. User-Specific Notifications
```javascript
// Send to specific user
io.to(`user_${userId}`).emit('notification', notificationData)
```

#### 2. Role-Based Notifications
```javascript
// Send to all admins
io.to('admin_room').emit('notification', adminNotificationData)

// Send to all customers
io.to('customer_room').emit('notification', customerNotificationData)
```

#### 3. Order-Specific Notifications
```javascript
// Send to order subscribers
io.to(`order_${orderId}`).emit('order.updated', orderData)
```

### Event Types
- `notification` - General notification
- `order.updated` - Order status change
- `payment.updated` - Payment status change
- `invoice.created` - Invoice generated
- `receipt.created` - Receipt generated

---

## Frontend Implementation

### 1. Header Notification Icon

#### Component Structure
```jsx
// Header.jsx
const Header = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo and navigation */}
        
        {/* Notification Icon */}
        <div className="notification-container">
          <button 
            className="notification-icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {isOpen && (
            <NotificationDropdown 
              notifications={notifications}
              onClose={() => setIsOpen(false)}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          )}
        </div>
      </div>
    </header>
  )
}
```

#### Notification Dropdown
```jsx
// NotificationDropdown.jsx
const NotificationDropdown = ({ 
  notifications, 
  onClose, 
  onMarkAsRead, 
  onMarkAllAsRead 
}) => {
  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button onClick={onMarkAllAsRead}>
          Mark all as read
        </button>
      </div>
      
      <div className="notification-list">
        {notifications.map(notification => (
          <NotificationItem 
            key={notification._id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>
      
      <div className="notification-footer">
        <Link to="/notifications">View All</Link>
      </div>
    </div>
  )
}
```

#### Notification Item
```jsx
// NotificationItem.jsx
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order_created': return <ShoppingBagIcon />
      case 'payment_success': return <CheckCircleIcon />
      case 'order_status_changed': return <TruckIcon />
      default: return <BellIcon />
    }
  }

  const getNotificationMessage = (notification) => {
    // Generate user-friendly message based on type and payload
  }

  return (
    <div 
      className={`notification-item ${!notification.read ? 'unread' : ''}`}
      onClick={() => onMarkAsRead(notification._id)}
    >
      <div className="notification-icon">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="notification-content">
        <p className="notification-message">
          {getNotificationMessage(notification)}
        </p>
        <span className="notification-time">
          {formatTime(notification.createdAt)}
        </span>
      </div>
      {!notification.read && <div className="unread-indicator" />}
    </div>
  )
}
```

### 2. Notification Page

#### Full Notification List
```jsx
// Notifications.jsx
const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all') // all, unread, read
  const [type, setType] = useState('all') // all, order, payment, system

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
        <div className="notification-actions">
          <button onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
          <button onClick={handleClearRead}>
            Clear Read
          </button>
        </div>
      </div>

      <div className="notification-filters">
        <FilterTabs 
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
            { value: 'read', label: 'Read' }
          ]}
        />
        
        <FilterTabs 
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'order', label: 'Orders' },
            { value: 'payment', label: 'Payments' },
            { value: 'system', label: 'System' }
          ]}
        />
      </div>

      <div className="notification-list">
        {filteredNotifications.map(notification => (
          <NotificationCard 
            key={notification._id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
```

### 3. Real-time Updates

#### Socket Connection Hook
```jsx
// useNotifications.js
const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const socket = io(API_BASE_URL, {
      auth: { token: user.token }
    })

    // Listen for new notifications
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev])
      if (!notification.read) {
        setUnreadCount(prev => prev + 1)
      }
    })

    // Listen for order updates
    socket.on('order.updated', (orderData) => {
      // Update order-related notifications
    })

    // Listen for payment updates
    socket.on('payment.updated', (paymentData) => {
      // Update payment-related notifications
    })

    return () => socket.disconnect()
  }, [user])

  return {
    notifications,
    unreadCount,
    markAsRead: (notificationId) => {
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }
}
```

---

## Backend Implementation

### 1. Notification Service

#### Core Notification Service
```javascript
// services/notificationService.js
import Notification from '../models/notificationModel.js'
import { sendSMS } from './smsService.js'
import { sendEmail } from './emailService.js'

export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData)
  await notification.save()
  return notification
}

export const sendNotification = async ({
  userId,
  type,
  payload,
  channels = ['inapp'],
  recipients = ['user']
}) => {
  const results = {
    inapp: { success: false },
    sms: { success: false },
    email: { success: false }
  }

  // Always create in-app notification
  if (channels.includes('inapp')) {
    const notification = await createNotification({
      userId,
      type,
      payload,
      read: false
    })
    results.inapp = { success: true, notificationId: notification._id }
  }

  // Send SMS if requested and user has phone
  if (channels.includes('sms')) {
    const user = await User.findById(userId)
    if (user?.phone) {
      results.sms = await sendNotificationSMS(user.phone, type, payload)
    }
  }

  // Send email if requested and user has email
  if (channels.includes('email')) {
    const user = await User.findById(userId)
    if (user?.email) {
      results.email = await sendNotificationEmail(user.email, type, payload)
    }
  }

  return results
}

export const sendBulkNotifications = async (notifications) => {
  const results = []
  
  for (const notification of notifications) {
    const result = await sendNotification(notification)
    results.push(result)
  }
  
  return results
}
```

#### Socket.IO Integration
```javascript
// utils/socketNotifications.js
export const emitNotification = (io, notification) => {
  // Emit to specific user
  io.to(`user_${notification.userId}`).emit('notification', {
    _id: notification._id,
    type: notification.type,
    payload: notification.payload,
    read: notification.read,
    createdAt: notification.createdAt
  })
}

export const emitToRole = (io, role, notification) => {
  // Emit to all users with specific role
  io.to(`${role}_room`).emit('notification', notification)
}

export const emitOrderUpdate = (io, orderId, orderData) => {
  // Emit to order subscribers
  io.to(`order_${orderId}`).emit('order.updated', orderData)
}
```

### 2. Controller Integration

#### Order Controller
```javascript
// controllers/orderController.js
export const createOrder = async (req, res, next) => {
  try {
    // Create order logic...
    const order = await Order.create(orderData)
    
    // Create invoice
    const invoice = await Invoice.create({
      orderId: order._id,
      amount: order.totalAmount
    })

    // Send notifications
    const io = req.app.get('io')
    
    // Notify customer
    const customerNotification = await sendNotification({
      userId: order.userId,
      type: 'order_created',
      payload: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        items: order.items
      },
      channels: ['inapp', 'sms', 'email']
    })
    
    // Notify admins
    const admins = await User.find({ roles: { $in: ['admin', 'manager'] } })
    for (const admin of admins) {
      await sendNotification({
        userId: admin._id,
        type: 'new_order_received',
        payload: {
          orderId: order._id,
          customerName: order.customer.name,
          totalAmount: order.totalAmount
        },
        channels: ['inapp', 'email']
      })
    }

    // Emit socket events
    io.emit('order.created', { orderId: order._id.toString() })
    io.emit('invoice.created', { 
      invoiceId: invoice._id.toString(), 
      orderId: order._id.toString() 
    })

    res.status(201).json({
      success: true,
      order,
      invoice
    })
  } catch (error) {
    next(error)
  }
}
```

#### Payment Controller
```javascript
// controllers/paymentController.js
export const handlePaymentSuccess = async (req, res, next) => {
  try {
    // Payment success logic...
    
    const io = req.app.get('io')
    
    // Notify customer
    await sendNotification({
      userId: payment.userId,
      type: 'payment_success',
      payload: {
        paymentId: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method
      },
      channels: ['inapp', 'sms']
    })
    
    // Notify admins
    const admins = await User.find({ roles: { $in: ['admin', 'manager'] } })
    for (const admin of admins) {
      await sendNotification({
        userId: admin._id,
        type: 'payment_received',
        payload: {
          paymentId: payment._id,
          customerName: payment.customer.name,
          amount: payment.amount
        },
        channels: ['inapp', 'email']
      })
    }

    // Emit socket events
    io.emit('payment.updated', { 
      paymentId: payment._id.toString(), 
      status: payment.status 
    })

    res.json({ success: true, payment })
  } catch (error) {
    next(error)
  }
}
```

---

## Database Schema

### Notification Model
```javascript
// models/notificationModel.js
const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  type: {
    type: String,
    enum: [
      "order_created",
      "order_status_changed", 
      "order_cancelled",
      "order_delivered",
      "payment_success",
      "payment_failed",
      "payment_pending",
      "invoice_generated",
      "receipt_issued",
      "low_stock_alert",
      "promotion_alert",
      "welcome_message",
      "password_reset",
      "otp_verification"
    ],
    required: true
  },
  payload: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  channels: [{
    type: String,
    enum: ['inapp', 'sms', 'email']
  }],
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
})

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ type: 1, createdAt: -1 })
notificationSchema.index({ read: 1, userId: 1 })
```

### User Model Extensions
```javascript
// Add to user model
notificationPreferences: {
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: true },
  inApp: { type: Boolean, default: true },
  orderUpdates: { type: Boolean, default: true },
  promotions: { type: Boolean, default: false },
  stockAlerts: { type: Boolean, default: false }
}
```

---

## API Endpoints

### Notification Management
```
GET    /api/notifications           - Get user notifications
GET    /api/notifications/unread    - Get unread notifications
PUT    /api/notifications/:id/read  - Mark notification as read
PUT    /api/notifications/read-all  - Mark all as read
DELETE /api/notifications/:id       - Delete notification
DELETE /api/notifications/clear-read - Clear all read notifications
```

### Notification Preferences
```
GET    /api/users/notifications/preferences - Get preferences
PUT    /api/users/notifications/preferences - Update preferences
```

### Admin Endpoints
```
GET    /api/admin/notifications           - Get all notifications (admin)
POST   /api/admin/notifications/broadcast - Send broadcast notification
GET    /api/admin/notifications/stats     - Get notification statistics
```

---

## Real-time Flow

### 1. Order Creation Flow
```
1. Customer places order
2. Backend creates order + invoice
3. Backend sends notifications:
   - Customer: order_created (inapp, sms, email)
   - Admins: new_order_received (inapp, email)
4. Socket.IO emits:
   - order.created (global)
   - invoice.created (global)
5. Frontend receives real-time updates
6. Notification icons update with badges
```

### 2. Payment Success Flow
```
1. Payment webhook received
2. Backend processes payment
3. Backend sends notifications:
   - Customer: payment_success (inapp, sms)
   - Admins: payment_received (inapp, email)
4. Socket.IO emits:
   - payment.updated (order-specific)
   - receipt.created (order-specific)
5. Payment status page updates in real-time
6. Notification dropdown shows new notifications
```

### 3. Order Status Update Flow
```
1. Admin updates order status
2. Backend updates order
3. Backend sends notifications:
   - Customer: order_status_changed (inapp, sms)
4. Socket.IO emits:
   - order.updated (order-specific)
5. Customer sees real-time status update
6. Order tracking page updates
```

---

## User Preferences

### Preference Structure
```javascript
{
  email: true,           // Receive email notifications
  sms: true,             // Receive SMS notifications  
  inApp: true,           // Receive in-app notifications
  orderUpdates: true,    // Order status changes
  promotions: false,     // Marketing promotions
  stockAlerts: false     // Low stock alerts
}
```

### Preference Management UI
```jsx
// NotificationPreferences.jsx
const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({})
  
  return (
    <div className="notification-preferences">
      <h2>Notification Preferences</h2>
      
      <div className="preference-section">
        <h3>Delivery Methods</h3>
        <ToggleSwitch
          label="Email Notifications"
          checked={preferences.email}
          onChange={(checked) => updatePreference('email', checked)}
        />
        <ToggleSwitch
          label="SMS Notifications"
          checked={preferences.sms}
          onChange={(checked) => updatePreference('sms', checked)}
        />
        <ToggleSwitch
          label="In-App Notifications"
          checked={preferences.inApp}
          onChange={(checked) => updatePreference('inApp', checked)}
        />
      </div>
      
      <div className="preference-section">
        <h3>Notification Types</h3>
        <ToggleSwitch
          label="Order Updates"
          checked={preferences.orderUpdates}
          onChange={(checked) => updatePreference('orderUpdates', checked)}
        />
        <ToggleSwitch
          label="Promotions"
          checked={preferences.promotions}
          onChange={(checked) => updatePreference('promotions', checked)}
        />
        <ToggleSwitch
          label="Stock Alerts"
          checked={preferences.stockAlerts}
          onChange={(checked) => updatePreference('stockAlerts', checked)}
        />
      </div>
    </div>
  )
}
```

---

## Admin Management

### Admin Notification Dashboard
```jsx
// AdminNotifications.jsx
const AdminNotifications = () => {
  return (
    <div className="admin-notifications">
      <div className="dashboard-header">
        <h1>Notification Management</h1>
        <button onClick={openBroadcastModal}>
          Send Broadcast
        </button>
      </div>
      
      <div className="notification-stats">
        <StatCard title="Total Sent" value={totalSent} />
        <StatCard title="Delivery Rate" value={deliveryRate} />
        <StatCard title="Unread Count" value={unreadCount} />
      </div>
      
      <div className="notification-tools">
        <BroadcastModal />
        <NotificationTemplates />
        <DeliveryLogs />
      </div>
    </div>
  )
}
```

### Broadcast Notification
```jsx
// BroadcastModal.jsx
const BroadcastModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'promotion',
    channels: ['inapp'],
    recipients: 'all', // all, customers, admins, specific
    targetUsers: []
  })
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleBroadcast}>
        <h2>Send Broadcast Notification</h2>
        
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
        
        <Textarea
          label="Message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
        
        <Select
          label="Type"
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          options={[
            { value: 'promotion', label: 'Promotion' },
            { value: 'announcement', label: 'Announcement' },
            { value: 'system', label: 'System Alert' }
          ]}
        />
        
        <CheckboxGroup
          label="Channels"
          options={[
            { value: 'inapp', label: 'In-App' },
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' }
          ]}
          selected={formData.channels}
          onChange={setChannels}
        />
        
        <Select
          label="Recipients"
          value={formData.recipients}
          onChange={(e) => setFormData({...formData, recipients: e.target.value})}
          options={[
            { value: 'all', label: 'All Users' },
            { value: 'customers', label: 'Customers Only' },
            { value: 'admins', label: 'Admins Only' },
            { value: 'specific', label: 'Specific Users' }
          ]}
        />
        
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Send Broadcast</button>
        </div>
      </form>
    </Modal>
  )
}
```

---



