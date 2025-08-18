import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import "dotenv/config"
import path from "path"
import { createServer } from 'http'
import { Server } from 'socket.io'
import { logConfigStatus } from './utils/configCheck.js'
import swaggerConfig from './config/swagger.js'



// Import routes
import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"
import roleRoute from "./routes/roleRoute.js"
import addressRoute from "./routes/addressRoute.js"
import variantRoute from "./routes/variantRoute.js"
import productRoute from "./routes/productRoute.js"
// import orderRoute from "./routes/orderRoute.js"
// import paymentRoute from "./routes/paymentRoute.js"
// import cartRoute from "./routes/cartRoute.js"


const app = express()

const PORT = process.env.PORT || 5000

// CORS configuration
app.use(cors({

    origin: [process.env.CLIENT_BASE_URL, process.env.ADMIN_BASE_URL],

    credentials: true

}))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

// DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB CONNECTED"))
.catch((err) => console.log("DB Connection Error:", err.message))

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// API ROUTES
app.use("/api/auth", authRoute)

app.use("/api/users", userRoute)

app.use("/api/roles", roleRoute)

app.use("/api/addresses", addressRoute)
app.use("/api/variants", variantRoute)
app.use("/api/products", productRoute)
// app.use("/api/orders", orderRoute)
// app.use("/api/payments", paymentRoute)
// app.use("/api/cart", cartRoute)


// Swagger Documentation
app.use('/api/docs', swaggerConfig.swaggerUi.serve, swaggerConfig.swaggerUi.setup(swaggerConfig.specs, swaggerConfig.options))


// Socket.io setup for real-time features
// Create HTTP server that wraps the Express app
const server = createServer(app)

// Attach Socket.io to the HTTP server
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_BASE_URL, process.env.ADMIN_BASE_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
})

// Store socket connections for real-time notifications
const socketConnections = new Map()

io.on('connection', (socket) => {

  console.log('Client connected:', socket.id)
  
  // Listen for user authentication to map socket to user
  socket.on('authenticate', (userId) => {

    socketConnections.set(userId, socket.id)

    console.log(`User ${userId} connected with socket ${socket.id}`)

  })
  
  // Listen for payment status updates
  socket.on('subscribe-to-payment', (paymentId) => {

    socket.join(`payment_${paymentId}`)

    console.log(`Client subscribed to payment updates: ${paymentId}`)

  })
  
  // Listen for order updates
  socket.on('subscribe-to-order', (orderId) => {

    socket.join(`order_${orderId}`)

    console.log(`Client subscribed to order updates: ${orderId}`)

  })
  
  socket.on('disconnect', () => {

    // Remove from connections
    for (const [key, value] of socketConnections.entries()) {

      if (value === socket.id) {

        socketConnections.delete(key)

        break

      }

    }

    console.log('Client disconnected:', socket.id)

  })

})

// Make io and socketConnections available to controllers
app.set('io', io)

app.set('socketConnections', socketConnections)

// Health check endpoint
app.get('/api/health', (req, res) => {

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })

})

// Main API endpoint
app.get('/api', (req, res) => {

  res.json({
    message: 'Welcome to TEO KICKS API',
    version: '1.0.0',
    documentation: '/api/docs',
    currency: 'KES',
    features: [
      'Real-time notifications',
      'Payment processing (M-Pesa, Paystack)',
      'Inventory management',
      'Order tracking'
    ]
  })

})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  })
})

// Global error handler
app.use((err, req, res, next) => {

  console.error(err.stack)

  const statusCode = err.statusCode || 500

  const message = err.message || "Internal Server Error"
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  })

})

// Start server
// We listen on the HTTP server (which includes the Express app)
// This allows both HTTP routes AND Socket.io connections to work
server.listen(PORT, (err) => {
  if (!err) {
    console.log(`🚀 TEO KICKS Server running on http://localhost:${PORT}`)
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
    console.log(`💰 Currency: KES (Kenyan Shillings)`)
    console.log(`🔌 Socket.io enabled for real-time features`)
    console.log(`📱 Express app is accessible via the HTTP server`)
    
    // Check notification service configuration
    logConfigStatus()
  } else {
    console.error('Failed to start server:', err)
  }
})
