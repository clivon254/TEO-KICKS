import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { paymentAPI, orderAPI, cartAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { FiShoppingCart } from 'react-icons/fi'


const PaymentStatus = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get payment details from URL params
  const method = searchParams.get('method') // 'mpesa' | 'paystack' | 'cash' | 'post_to_bill'
  const paymentId = searchParams.get('paymentId')
  const orderId = searchParams.get('orderId')
  const provider = searchParams.get('provider') || method || 'mpesa'
  const checkoutRequestId = searchParams.get('checkoutRequestId')
  const invoiceId = searchParams.get('invoiceId')
  const payerPhone = searchParams.get('payerPhone')
  const payerEmail = searchParams.get('payerEmail')
  const errorParam = searchParams.get('error')

  // State management
  const [paymentView, setPaymentView] = useState({ 
    status: 'LOADING', 
    title: 'Loading...', 
    message: 'Please wait', 
    provider 
  })
  const [orderBreakdown, setOrderBreakdown] = useState(null)
  const [cart, setCart] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFallbackActive, setIsFallbackActive] = useState(false)

  // Refs for cleanup
  const timeoutRef = useRef(null)
  const socketRef = useRef(null)

  const clearPaymentTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (socketRef.current) {
      try { socketRef.current.disconnect() } catch {}
      socketRef.current = null
    }
  }

  const startPaymentTracking = (trackingPaymentId = paymentId, trackingMethod = method) => {
    clearPaymentTimers()

    // Only connect socket for M-Pesa and Paystack
    const shouldConnectSocket = ['mpesa', 'paystack'].includes(trackingMethod)
    if (!shouldConnectSocket) {
      console.log(`Skipping socket connection for method: ${trackingMethod}`)
      return
    }

    // Socket.IO subscription (real-time updates)
    try {
      const baseUrl = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000' 
      
      socketRef.current = io(baseUrl, { 
        transports: ['websocket', 'polling'], 
        withCredentials: false,
        timeout: 20000,
        forceNew: true
      })
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected, subscribing to payment:', trackingPaymentId)
        socketRef.current.emit('subscribe-to-payment', String(trackingPaymentId))
      })
      
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected')
      })
      
      socketRef.current.on('connect_error', (error) => {
        console.log('Socket connection error:', error)
      })
      
      // === M-PESA SOCKET LISTENERS ===
      if (trackingMethod === 'mpesa') {
        // Listen for M-Pesa callback received (PRIMARY for M-Pesa)
      socketRef.current.on('callback.received', async (payload) => {
        console.log('M-Pesa Callback Received:', payload)
        
        const resultCode = payload.CODE
        const resultMessage = payload.message || 'Payment processing completed'
        
        // Handle all M-Pesa result codes
        switch (resultCode) {
          case 0: {
              // SUCCESS
            clearPaymentTimers()
            
            setPaymentView({ 
              status: 'SUCCESS', 
              title: 'Payment Successful! 🎉', 
              message: resultMessage, 
              provider 
            })

            // Fetch fresh order breakdown
            if (orderId) {
              try {
                const detail = await orderAPI.getOrderById(orderId)
                const ord = detail?.data?.data?.order
                setOrderBreakdown(ord?.pricing || null)
              } catch (err) {
                console.error('Failed to fetch order breakdown:', err)
              }
            }

            toast.success(resultMessage)
            break
          }

          case 1: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Insufficient Balance', 
              message: resultMessage || 'The balance is insufficient for the transaction', 
              provider 
            })
            toast.error('Insufficient M-Pesa balance. Please top up and try again.')
            break
          }

          case 1032: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Payment Cancelled', 
              message: resultMessage || 'Request cancelled by user', 
              provider 
            })
            toast.error('You cancelled the payment request')
            break
          }

          case 1037: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Request Timeout', 
              message: resultMessage || 'DS timeout user cannot be reached', 
              provider 
            })
            toast.error('Payment timeout. Please ensure your phone is on and try again.')
            break
          }

          case 2001: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Wrong PIN Entered', 
              message: resultMessage || 'Wrong PIN entered or PIN blocked', 
              provider 
            })
            toast.error('Wrong M-Pesa PIN entered. Please try again.')
            break
          }

          case 1001: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Transaction Failed', 
              message: resultMessage || 'Unable to lock subscriber', 
              provider 
            })
            toast.error('Transaction failed. Please try again.')
            break
          }

          case 1019: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Transaction Expired', 
              message: resultMessage || 'Transaction expired', 
              provider 
            })
            toast.error('Transaction expired. Please initiate a new payment.')
            break
          }

          case 1025: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Invalid Phone Number', 
              message: resultMessage || 'Unable to initiate transaction - invalid phone', 
              provider 
            })
            toast.error('Invalid phone number. Please check and try again.')
            break
          }

          case 1026: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'System Error', 
              message: resultMessage || 'System internal error', 
              provider 
            })
            toast.error('System error occurred. Please try again later.')
            break
          }

          case 1036: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Internal Error', 
              message: resultMessage || 'Internal error occurred', 
              provider 
            })
            toast.error('An internal error occurred. Please try again.')
            break
          }

          case 1050: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Too Many Attempts', 
              message: resultMessage || 'Maximum number of retries reached', 
              provider 
            })
            toast.error('Too many payment attempts. Please try again later.')
            break
          }

          case 9999: {
            // Don't clear timers - keep waiting
            setPaymentView({ 
              status: 'PENDING', 
              title: 'Processing Payment...', 
              message: resultMessage || 'Request is being processed', 
              provider 
            })
            toast.info('Payment is still being processed...')
            break
          }

          default: {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Payment Failed', 
              message: resultMessage || `Transaction failed with code ${resultCode}`, 
              provider 
            })
            toast.error(`Payment failed: ${resultMessage}`)
            break
          }
        }
        })
        
        // Listen for payment.updated (secondary confirmation for M-Pesa)
        socketRef.current.on('payment.updated', (payload) => {
          console.log('Payment database updated:', payload)
          if (!payload || String(payload.paymentId) !== String(trackingPaymentId)) return
          console.log('Payment status in database:', payload.status)
        })
      }
      
      // === PAYSTACK SOCKET LISTENERS ===
      if (trackingMethod === 'paystack') {
        // Listen for payment.updated (PRIMARY for Paystack - webhook-driven)
        socketRef.current.on('payment.updated', (payload) => {
          console.log('Paystack Payment Updated:', payload)
          if (!payload || String(payload.paymentId) !== String(trackingPaymentId)) return
          
          if (payload.status === 'PAID') {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'SUCCESS', 
              title: 'Payment Successful! 🎉', 
              message: 'Card payment processed successfully', 
              provider 
            })
            toast.success('Payment successful!')
          } else if (payload.status === 'FAILED') {
            clearPaymentTimers()
            setPaymentView({ 
              status: 'FAILED', 
              title: 'Payment Failed', 
              message: payload.message || 'Card payment failed', 
              provider 
            })
            toast.error('Card payment failed')
          }
        })
      }
      
      // Listen for receipt.created (common for both methods)
      socketRef.current.on('receipt.created', (payload) => {
        console.log('Receipt created:', payload)
      })

    } catch (error) {
      console.error('Socket.IO setup error:', error)
    }

    // Fallback: Query M-Pesa status after 60 seconds (M-PESA ONLY)
    const shouldSetFallback = trackingMethod === 'mpesa' && checkoutRequestId
    
    if (shouldSetFallback) {
    timeoutRef.current = setTimeout(async () => {
        try {
          setIsFallbackActive(true)
          setIsLoading(true)
          
          console.log('Fallback: Querying M-Pesa status from Safaricom...')
          const res = await paymentAPI.queryMpesaByCheckoutId(checkoutRequestId)
          const { resultCode, resultDesc } = res.data?.data || {}
          
          console.log('Fallback Query Result:', { resultCode, resultDesc })
          
          // Handle all M-Pesa result codes from query response
          switch (resultCode) {
            case 0: {
              setPaymentView({ 
                status: 'SUCCESS', 
                title: 'Payment Successful! 🎉', 
                message: resultDesc || 'Payment confirmed via fallback query.', 
                provider 
              })
              
              if (orderId) {
                try {
                  const detail = await orderAPI.getOrderById(orderId)
                  const ord = detail?.data?.data?.order
                  setOrderBreakdown(ord?.pricing || null)
                } catch (err) {
                  console.error('Failed to fetch order breakdown:', err)
                }
              }
              
              toast.success('Payment confirmed!')
              break
            }

            case 1: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Insufficient Balance', 
                message: resultDesc || 'The balance is insufficient for the transaction', 
                provider 
              })
              toast.error('Insufficient M-Pesa balance')
              break
            }

            case 1032: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Payment Cancelled', 
                message: resultDesc || 'Request cancelled by user', 
                provider 
              })
              toast.error('Payment was cancelled')
              break
            }

            case 1037: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Request Timeout', 
                message: resultDesc || 'Could not reach your phone', 
                provider 
              })
              toast.error('Payment request timed out')
              break
            }

            case 2001: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Wrong PIN Entered', 
                message: resultDesc || 'Wrong PIN entered', 
                provider 
              })
              toast.error('Incorrect M-Pesa PIN')
              break
            }

            case 1001: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Transaction Failed', 
                message: resultDesc || 'Unable to complete transaction', 
                provider 
              })
              toast.error('Transaction failed')
              break
            }

            case 1019: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Transaction Expired', 
                message: resultDesc || 'Transaction has expired', 
                provider 
              })
              toast.error('Transaction expired')
              break
            }

            case 1025: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Invalid Phone Number', 
                message: resultDesc || 'Invalid phone number', 
                provider 
              })
              toast.error('Invalid phone number')
              break
            }

            case 1026: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'System Error', 
                message: resultDesc || 'M-Pesa system error', 
                provider 
              })
              toast.error('System error occurred')
              break
            }

            case 1036: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Internal Error', 
                message: resultDesc || 'Internal error occurred', 
                provider 
              })
              toast.error('Internal error')
              break
            }

            case 1050: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Too Many Attempts', 
                message: resultDesc || 'Maximum retries reached', 
                provider 
              })
              toast.error('Too many attempts')
              break
            }

            default: {
              setPaymentView({ 
                status: 'FAILED', 
                title: 'Payment Status Unknown', 
                message: resultDesc || `Query returned code ${resultCode}. Please retry.`, 
                provider 
              })
              toast.error('Payment status unclear. Please retry.')
              break
            }
          }
          
        } catch (error) {
          console.error('Fallback query error:', error)
          setPaymentView({ 
            status: 'FAILED', 
            title: 'Query Failed', 
            message: 'Could not verify payment status. You can retry the payment.', 
            provider 
          })
          toast.error('Failed to check payment status')
        } finally {
          setIsLoading(false)
      }
      
      clearPaymentTimers()
    }, 60 * 1000)
    }

  }

  // Load order data and initialize payment tracking based on method
  useEffect(() => {
    const loadOrderDataAndInitialize = async () => {
      console.log('🔍 PaymentStatus: Initializing...', { method, orderId, paymentId })
      
      // Check for error parameter (order creation failed for cash/post_to_bill)
      if (errorParam && !orderId) {
        setPaymentView({
          status: 'FAILED',
          title: method === 'cash' ? 'Order Creation Failed' : 'Failed to Post Order to Bill',
          message: errorParam,
          provider
        })
        return
      }
      
        // Try to load order details if orderId is available
      if (!orderId) {
        // Missing orderId for cash/post_to_bill means order creation failed
        if (method === 'cash' || method === 'post_to_bill') {
          setPaymentView({
            status: 'FAILED',
            title: 'Order Creation Failed',
            message: 'No order ID found - order creation may have failed',
            provider
          })
        }
        return
      }
      
      try {
          console.log('📦 Fetching order details for orderId:', orderId)
          const orderDetail = await orderAPI.getOrderById(orderId)
          const order = orderDetail?.data?.data?.order
          
          if (order) {
          console.log('📦 Order loaded successfully')
            
            // Set order breakdown from order.pricing
            if (order.pricing) {
              setOrderBreakdown(order.pricing)
            }
            
            // Set cart items from order
            if (order.items && order.items.length > 0) {
              setCart({ items: order.items })
          }
          
          // === BRANCH BY PAYMENT METHOD ===
          
          if (method === 'mpesa') {
            // M-Pesa: Connect socket + start fallback timer
            console.log('💳 Initializing M-Pesa tracking...')
            setPaymentView({
              status: 'PENDING',
              title: 'Payment Processing',
              message: 'Check your phone for M-Pesa prompt...',
              provider
            })
            
            if (paymentId) {
              startPaymentTracking(paymentId, method)
            }
            
          } else if (method === 'paystack') {
            // Paystack: Connect socket only (no fallback)
            console.log('💳 Initializing Paystack tracking...')
            setPaymentView({
              status: 'PENDING',
              title: 'Payment Processing',
              message: 'Complete payment in the Paystack window...',
              provider
            })
            
            if (paymentId) {
              startPaymentTracking(paymentId, method)
            }
            
          } else if (method === 'cash') {
            // Cash: Instant success (order created successfully)
            console.log('💵 Cash payment - Order created successfully')
            setPaymentView({
              status: 'SUCCESS',
              title: 'Order Placed Successfully!',
              message: 'Pay cash when you receive your order',
              provider
            })
            
          } else if (method === 'post_to_bill') {
            // Post-to-Bill: Instant success (order created successfully)
            console.log('📋 Post-to-Bill - Order posted successfully')
            setPaymentView({
              status: 'SUCCESS',
              title: 'Order Posted to Bill!',
              message: 'You can pay this bill later',
              provider
            })
          }
          
          } else {
            console.warn('⚠️ No order found in response')
          throw new Error('Order not found')
          }
        
      } catch (error) {
        console.error('❌ Failed to load order data:', error)
        
        // Determine error handling based on method
        if (method === 'cash' || method === 'post_to_bill') {
          // For cash/post_to_bill, order creation likely failed
          setPaymentView({
            status: 'FAILED',
            title: method === 'cash' ? 'Order Creation Failed' : 'Failed to Post Order to Bill',
            message: error.response?.data?.message || error.message || 'Failed to create order. Please try again.',
            provider
          })
        } else {
          // For mpesa/paystack, order should exist - just fetch failed
          setPaymentView({
            status: 'FAILED',
            title: 'Failed to Load Order',
            message: 'Unable to load order details. Please try again.',
            provider
          })
        }
      }
    }

    loadOrderDataAndInitialize()

    return () => {
      clearPaymentTimers()
    }
  }, [orderId, method, paymentId, errorParam])

  const handleRetry = async () => {
    // Determine what to retry based on method
    if (method === 'cash' || method === 'post_to_bill') {
      // Retry order creation
      await handleRetryOrderCreation()
    } else {
      // Retry payment (M-Pesa or Paystack)
      await handleRetryPayment()
    }
  }

  const handleRetryOrderCreation = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Retrying order creation for method:', method)
      
      // Retrieve checkout data from localStorage
      const checkoutDataStr = localStorage.getItem('checkoutData')
      
      if (!checkoutDataStr) {
        toast.error('Checkout data not found. Please go back to cart and try again.')
        navigate('/cart')
        return
      }
      
      const checkoutData = JSON.parse(checkoutDataStr)
      const orderPayload = checkoutData.payload
      
      console.log('📦 Retrying order creation with payload:', orderPayload)
      
      // Attempt to create order again
      const res = await orderAPI.createOrder(orderPayload)
      const createdOrderId = res.data?.data?.orderId
      
      console.log('✅ Order created successfully:', createdOrderId)
      
      // Fetch invoice
      const orderDetail = await orderAPI.getOrderById(createdOrderId)
      const inv = orderDetail.data?.data?.order?.invoiceId
      const createdInvoiceId = inv?._id || inv
      
      // Update URL with new order details
      const params = new URLSearchParams({
        method: method,
        orderId: createdOrderId,
        invoiceId: createdInvoiceId
      })
      navigate(`/payment-status?${params.toString()}`, { replace: true })
      
      // Reload order data and show success
      const order = orderDetail?.data?.data?.order
      if (order) {
        if (order.pricing) {
          setOrderBreakdown(order.pricing)
        }
        if (order.items && order.items.length > 0) {
          setCart({ items: order.items })
        }
      }
      
      // Set success state
      setPaymentView({
        status: 'SUCCESS',
        title: method === 'cash' ? 'Order Placed Successfully!' : 'Order Posted to Bill!',
        message: method === 'cash' ? 'Pay cash when you receive your order' : 'You can pay this bill later',
        provider
      })
      
      toast.success(method === 'cash' ? 'Order placed successfully!' : 'Order posted to bill!')
      
      // Clear checkout data from localStorage after successful retry
      localStorage.removeItem('checkoutData')
      
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to retry order creation'
      toast.error(errorMessage)
      console.error('Retry order creation error:', error)
      
      // Keep showing failed state - user can retry again
      setPaymentView({
        status: 'FAILED',
        title: method === 'cash' ? 'Order Creation Failed' : 'Failed to Post Order to Bill',
        message: errorMessage,
        provider
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryPayment = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Retrying payment for method:', method)
      
      // Call payInvoice API to retry payment
      const res = await paymentAPI.payInvoice({ 
        invoiceId, 
        method: method === 'mpesa' ? 'mpesa_stk' : 'paystack_card',
        payerPhone: method === 'mpesa' ? payerPhone : undefined,
        payerEmail: method === 'paystack' ? payerEmail : undefined
      })
      
      if (res.data?.success) {
        const newPaymentId = res.data?.data?.paymentId
        const newCheckoutRequestId = res.data?.data?.daraja?.checkoutRequestId
        const newReference = res.data?.data?.reference
        const newAuthorizationUrl = res.data?.data?.authorizationUrl
        
        // Reset payment status to PENDING and restart tracking
        setPaymentView({ 
          status: 'PENDING', 
          title: 'Payment Processing', 
          message: method === 'mpesa' ? 'Check your phone for M-Pesa prompt...' : 'Complete payment in the Paystack window...', 
          provider 
        })
        setIsFallbackActive(false)
        setIsLoading(false)
        
        // Clear existing timers
        clearPaymentTimers()
        
        // Update URL with new payment details
        const params = new URLSearchParams({
          method: method,
          paymentId: newPaymentId,
          orderId: orderId,
          provider: provider,
          checkoutRequestId: newCheckoutRequestId || '',
          reference: newReference || '',
          invoiceId: invoiceId,
          payerPhone: payerPhone || '',
          payerEmail: payerEmail || ''
        })
        navigate(`/payment-status?${params.toString()}`, { replace: true })
        
        // For Paystack, open new payment window
        if (method === 'paystack' && newAuthorizationUrl) {
          window.open(newAuthorizationUrl, '_blank')
        }
        
        // Restart payment tracking with new payment ID
        setTimeout(() => {
          startPaymentTracking(newPaymentId, method)
        }, 100)
        
        toast.success('Payment retry initiated')
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to retry payment. Please try again.'
      toast.error(errorMessage)
      console.error('Retry payment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToOrders = () => {
    navigate('/orders')
  }

  const handleClose = () => {
    navigate('/orders')
  }

  const handleBackToCart = () => {
    navigate('/cart')
  }

  // Helper function to get product image (same as Cart.jsx)
  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      // Find the primary image first
      const primaryImage = product.images.find(img => img.isPrimary === true)
      if (primaryImage) {
        return primaryImage.url
      }
      // If no primary image, use the first image
      return product.images[0].url
    }
    if (product?.primaryImage) {
      return product.primaryImage
    }
    return null // Return null to trigger placeholder
  }

  // Helper function to format variant options (same as Cart.jsx)
  const formatVariantOptions = (variantOptions) => {
    if (!variantOptions || Object.keys(variantOptions).length === 0) {
      return 'No variants'
    }

    return Object.entries(variantOptions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  }

  return (
    <div className="min-h-screen h-screen bg-white flex flex-col relative">
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex flex-col items-center justify-center px-4 py-8">
        
          {/* Status Icon */}
          {paymentView.status === 'LOADING' && (
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-400 border-t-transparent"></div>
              </div>
            </div>
          )}

          {paymentView.status === 'PENDING' && !isFallbackActive && (
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
          </div>
        )}

        {paymentView.status === 'SUCCESS' && (
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {paymentView.status === 'FAILED' && (
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
          </div>
        )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
            {paymentView.title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-base mb-8 text-center max-w-md">
            {paymentView.message}
          </p>

        {/* Loading indicator for fallback API call */}
        {isLoading && isFallbackActive && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span>Checking payment status...</span>
          </div>
        )}

          {/* Order Items and Price Breakdown - Always visible */}
          <div className="w-full max-w-md space-y-6">
            
            {/* Order Items - Cart Style */}
            {cart?.items && cart.items.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex items-start space-x-4 p-3 bg-white rounded-lg border border-gray-200">
                      
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {getProductImage(item.productId) ? (
                          <img
                            src={getProductImage(item.productId)}
                            alt={item.productId?.title || 'Product'}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"
                          style={{ display: getProductImage(item.productId) ? 'none' : 'flex' }}
                        >
                          <FiShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {item.title || item.productId?.title || 'Product Name'}
                        </h3>

                        <p className="text-sm text-gray-500 mb-2">
                          {formatVariantOptions(item.variantOptions)}
                        </p>

                        <p className="text-sm text-gray-500 mb-2">
                          Qty: {item.quantity}
                        </p>

                        <p className="text-lg font-bold text-primary">
                          KSh {(item.unitPrice || item.price || 0)?.toFixed(2)}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown - Always visible if we have order breakdown */}
            {orderBreakdown && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      KSh {Number(orderBreakdown.subtotal || 0).toFixed(2)}
                    </span>
                  </div>

                  {Number(orderBreakdown.discounts || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discounts</span>
                      <span className="font-medium">-KSh {Number(orderBreakdown.discounts).toFixed(2)}</span>
                    </div>
                  )}

                  {Number(orderBreakdown.packagingFee || 0) > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Packaging</span>
                      <span className="font-medium">KSh {Number(orderBreakdown.packagingFee).toFixed(2)}</span>
                    </div>
                  )}

                  {Number(orderBreakdown.schedulingFee || 0) > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Scheduling</span>
                      <span className="font-medium">KSh {Number(orderBreakdown.schedulingFee).toFixed(2)}</span>
                    </div>
                  )}

                  {Number(orderBreakdown.deliveryFee || 0) > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery</span>
                      <span className="font-medium">KSh {Number(orderBreakdown.deliveryFee).toFixed(2)}</span>
                    </div>
                  )}

                  {Number(orderBreakdown.tax || 0) > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span className="font-medium">KSh {Number(orderBreakdown.tax).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-300 pt-2 mt-2">
                    <span>Total</span>
                    <span>
                      KSh {Number(orderBreakdown.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment ID */}
            <div className="text-xs text-gray-400 text-center pb-4 mt-6">
              Payment ID: {paymentId}
            </div>

          </div>
        </div>
      </div>

      {/* Action Buttons - Absolutely Positioned at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-lg">
        <div className="max-w-md mx-auto flex gap-3">
          {paymentView.status === 'SUCCESS' ? (
            <button 
              onClick={handleGoToOrders} 
              className="flex-1 bg-primary hover:bg-primary-button text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go to Orders
            </button>
          ) : paymentView.status === 'FAILED' ? (
            <>
              {/* Retry button - text varies by method */}
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary-button text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Retrying...' : (
                  method === 'cash' || method === 'post_to_bill' 
                    ? 'Retry Order' 
                    : 'Retry Payment'
                )}
              </button>
              
              {/* Secondary button - varies by method */}
              <button
                onClick={method === 'cash' || method === 'post_to_bill' ? handleBackToCart : handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {method === 'cash' || method === 'post_to_bill' ? 'Back to Cart' : 'Close'}
              </button>
            </>
          ) : paymentView.status === 'LOADING' ? (
            <button 
              disabled 
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg cursor-not-allowed opacity-50"
            >
              Loading...
            </button>
          ) : (
            <button 
              onClick={handleClose} 
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Hide
            </button>
          )}
        </div>
      </div>

    </div>
  )
}


export default PaymentStatus