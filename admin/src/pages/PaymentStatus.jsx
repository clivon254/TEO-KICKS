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
  const paymentId = searchParams.get('paymentId')
  const orderId = searchParams.get('orderId')
  const provider = searchParams.get('provider') || 'mpesa'
  const checkoutRequestId = searchParams.get('checkoutRequestId')
  const invoiceId = searchParams.get('invoiceId')
  const payerPhone = searchParams.get('payerPhone')
  const payerEmail = searchParams.get('payerEmail')

  // State management
  const [paymentView, setPaymentView] = useState({ 
    status: 'PENDING', 
    title: 'Payment Processing', 
    message: 'Awaiting approval on your phone…', 
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

  const startPaymentTracking = (trackingPaymentId = paymentId) => {
    clearPaymentTimers()

    // Socket.IO subscription (real-time updates)
    try {
      // Temporary: hardcoded backend URL (replace with env variable after restart)
      const baseUrl = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000' 
      
      socketRef.current = io(baseUrl, { 
        transports: ['websocket', 'polling'], 
        withCredentials: false,
        timeout: 20000,
        forceNew: true
      })
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected, subscribing to payment:', trackingPaymentId)
        // Subscribe to payment room
        socketRef.current.emit('subscribe-to-payment', String(trackingPaymentId))
      })
      
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected')
      })
      
      socketRef.current.on('connect_error', (error) => {
        console.log('Socket connection error:', error)
      })
      
      // Listen for payment database updates (kept separate from callback.received)
      socketRef.current.on('payment.updated', (payload) => {
        console.log('Payment database updated:', payload)
        if (!payload || String(payload.paymentId) !== String(trackingPaymentId)) return
        
        // Just log the database update - UI updates are handled by callback.received
        console.log('Payment status in database:', payload.status)
      })
      
      socketRef.current.on('receipt.created', (payload) => {
        console.log('Receipt created:', payload)
        // Optional: we could also use this to mark success and show receipt link later
      })

      // Listen for M-Pesa callback received
      socketRef.current.on('callback.received', async (payload) => {
        console.log('M-Pesa Callback Received:', payload)
        
        const resultCode = payload.CODE
        const resultMessage = payload.message || 'Payment processing completed'
        
        // Handle all M-Pesa result codes
        switch (resultCode) {
          case 0: {
            // SUCCESS - Payment completed successfully
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
            // INSUFFICIENT BALANCE
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
            // USER CANCELLED
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
            // TIMEOUT - User cannot be reached
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
            // WRONG PIN / PIN BLOCKED
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
            // UNABLE TO LOCK SUBSCRIBER
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
            // TRANSACTION EXPIRED
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
            // INVALID PHONE NUMBER
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
            // SYSTEM ERROR
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
            // INTERNAL ERROR
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
            // MAX RETRIES REACHED
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
            // REQUEST PROCESSING
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
            // UNKNOWN ERROR CODE
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

    } catch (error) {
      console.error('Socket.IO setup error:', error)
    }

    // Fallback: Query M-Pesa status after 60 seconds if no callback received
    timeoutRef.current = setTimeout(async () => {
      if (provider === 'mpesa' && checkoutRequestId) {
        try {
          // Mark fallback as active and show loading
          setIsFallbackActive(true)
          setIsLoading(true)
          
          console.log('Fallback: Querying M-Pesa status from Safaricom...')
          const res = await paymentAPI.queryMpesaByCheckoutId(checkoutRequestId)
          const { resultCode, resultDesc } = res.data?.data || {}
          
          console.log('Fallback Query Result:', { resultCode, resultDesc })
          
          // Handle all M-Pesa result codes from query response
          switch (resultCode) {
            case 0: {
              // SUCCESS
              setPaymentView({ 
                status: 'SUCCESS', 
                title: 'Payment Successful! 🎉', 
                message: resultDesc || 'Payment confirmed via fallback query.', 
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
              
              toast.success('Payment confirmed!')
              break
            }

            case 1: {
              // INSUFFICIENT BALANCE
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
              // USER CANCELLED
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
              // TIMEOUT
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
              // WRONG PIN
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
              // UNABLE TO LOCK SUBSCRIBER
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
              // TRANSACTION EXPIRED
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
              // INVALID PHONE
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
              // SYSTEM ERROR
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
              // INTERNAL ERROR
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
              // MAX RETRIES
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
              // PENDING or UNKNOWN
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
      } else {
        setPaymentView({ 
          status: 'FAILED', 
          title: 'Payment Timed Out', 
          message: 'No confirmation received. You can retry the payment.', 
          provider 
        })
        toast.error('Payment request timed out')
      }
      
      clearPaymentTimers()
    }, 60 * 1000)

  }

  // Load cart and order details on mount
  useEffect(() => {
    const loadOrderData = async () => {
      console.log('🔍 PaymentStatus: Loading order data...', { orderId, invoiceId })
      
      try {
        // Try to load order details if orderId is available
        if (orderId) {
          console.log('📦 Fetching order details for orderId:', orderId)
          const orderDetail = await orderAPI.getOrderById(orderId)
          console.log('📦 Order API Response:', orderDetail)
          
          const order = orderDetail?.data?.data?.order
          console.log('📦 Extracted order:', order)
          
          if (order) {
            console.log('📦 Full order object:', order)
            
            // Set order breakdown from order.pricing
            if (order.pricing) {
              console.log('💰 Setting order breakdown:', order.pricing)
              setOrderBreakdown(order.pricing)
            } else {
              console.warn('⚠️ Order has no pricing object!')
            }
            
            // Set cart items from order
            if (order.items && order.items.length > 0) {
              console.log('🛒 Setting cart items from order:', order.items)
              console.log('🛒 First item details:', {
                title: order.items[0].title,
                unitPrice: order.items[0].unitPrice,
                productId: order.items[0].productId,
                quantity: order.items[0].quantity,
                variantOptions: order.items[0].variantOptions
              })
              setCart({ items: order.items })
            } else {
              console.warn('⚠️ Order has no items!')
            }
          } else {
            console.warn('⚠️ No order found in response')
          }
        } else {
          console.warn('⚠️ No orderId available')
        }
      } catch (error) {
        console.error('❌ Failed to load order data:', error)
        console.error('Error details:', error.response?.data)
        
        // Try to load cart as fallback
        try {
          console.log('🔄 Trying to load cart as fallback...')
          const cartRes = await cartAPI.getCart()
          console.log('🛒 Cart API Response:', cartRes)
          setCart(cartRes.data?.data)
        } catch (cartError) {
          console.error('❌ Failed to load cart:', cartError)
          console.error('Cart error details:', cartError.response?.data)
        }
      }
    }

    loadOrderData()
  }, [orderId])


  useEffect(() => {
    if (paymentId) {
      startPaymentTracking()
    }

    return () => {
      clearPaymentTimers()
    }
  }, [paymentId, checkoutRequestId])

  const handleRetryPayment = async () => {
    try {
      // Call payInvoice API to retry payment
      const res = await paymentAPI.payInvoice({ 
        invoiceId, 
        method: provider === 'mpesa' ? 'mpesa_stk' : 'paystack_card',
        payerPhone: provider === 'mpesa' ? payerPhone : undefined,
        payerEmail: provider === 'paystack' ? payerEmail : undefined
      })
      
      if (res.data?.success) {
        const newPaymentId = res.data?.data?.paymentId
        const newCheckoutRequestId = res.data?.data?.daraja?.checkoutRequestId
        const newReference = res.data?.data?.reference
        
        // Reset payment status to PENDING and restart tracking
        // NOTE: Keep orderBreakdown and cart - don't reset them
        setPaymentView({ 
          status: 'PENDING', 
          title: 'Payment Processing', 
          message: 'Awaiting approval on your phone…', 
          provider 
        })
        setIsFallbackActive(false)
        setIsLoading(false)
        
        // Clear existing timers and restart payment tracking with new payment ID
        clearPaymentTimers()
        
        // Update URL with new payment details
        const params = new URLSearchParams({
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
        
        // Restart payment tracking with new payment ID
        setTimeout(() => {
          startPaymentTracking(newPaymentId)
        }, 100)
        
        toast.success('Payment retry initiated')
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to retry payment. Please try again.'
      toast.error(errorMessage)
      console.error('Retry payment error:', error)
    }
  }

  const handleGoToOrders = () => {
    navigate('/orders')
  }

  const handleClose = () => {
    navigate('/orders')
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
              <button
                onClick={handleRetryPayment}
                className="flex-1 bg-primary hover:bg-primary-button text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Retry Payment
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </>
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