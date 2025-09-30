import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { paymentAPI, orderAPI } from '../utils/api'
import toast from 'react-hot-toast'


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
        setPaymentView({ 
          status: 'PENDING', 
          title: 'Payment Processing', 
          message: 'Awaiting approval on your phone…', 
          provider 
        })
        setOrderBreakdown(null)
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {paymentView.title}
          </h1>
          <p className="text-gray-600">
            {paymentView.message}
          </p>
        </div>

        {/* Status Indicator */}
        {paymentView.status === 'PENDING' && !isFallbackActive && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Processing...</span>
          </div>
        )}

        {paymentView.status === 'SUCCESS' && (
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {paymentView.status === 'FAILED' && (
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )}

        {/* Loading indicator for fallback API call */}
        {isLoading && isFallbackActive && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Checking payment status...</span>
          </div>
        )}

        {/* Order Breakdown (Success only) */}
        {paymentView.status === 'SUCCESS' && orderBreakdown && (
          <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-700 mb-6">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KSh {Number(orderBreakdown.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(orderBreakdown.discounts || 0) > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discounts</span>
                  <span>-KSh {Number(orderBreakdown.discounts).toFixed(2)}</span>
                </div>
              )}
              {Number(orderBreakdown.packagingFee || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Packaging</span>
                  <span>KSh {Number(orderBreakdown.packagingFee).toFixed(2)}</span>
                </div>
              )}
              {Number(orderBreakdown.schedulingFee || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Scheduling</span>
                  <span>KSh {Number(orderBreakdown.schedulingFee).toFixed(2)}</span>
                </div>
              )}
              {Number(orderBreakdown.deliveryFee || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>KSh {Number(orderBreakdown.deliveryFee).toFixed(2)}</span>
                </div>
              )}
              {Number(orderBreakdown.tax || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>KSh {Number(orderBreakdown.tax).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total</span>
                <span>KSh {Number(orderBreakdown.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {paymentView.status === 'SUCCESS' ? (
            <button 
              onClick={handleGoToOrders} 
              className="flex-1 btn-primary"
            >
              Go to Orders
            </button>
          ) : paymentView.status === 'FAILED' ? (
            <>
              <button
                onClick={handleRetryPayment}
                className="flex-1 btn-primary"
              >
                Retry Payment
              </button>
              <button
                onClick={handleClose}
                className="flex-1 btn-outline"
              >
                Close
              </button>
            </>
          ) : (
            <button 
              onClick={handleClose} 
              className="flex-1 btn-outline"
            >
              Hide
            </button>
          )}
        </div>

        {/* Payment Info */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Payment ID: {paymentId}
        </div>
      </div>
    </div>
  )
}


export default PaymentStatus