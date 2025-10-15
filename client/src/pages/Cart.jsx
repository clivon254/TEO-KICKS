import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../hooks/useCart'
import { couponAPI } from '../utils/api'
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiX, FiTag, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'


const Cart = () => {
  const navigate = useNavigate()
  const { data: cartData, isLoading, error } = useGetCart()
  const updateCartItem = useUpdateCartItem()
  const removeFromCart = useRemoveFromCart()
  const clearCart = useClearCart()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [showClearModal, setShowClearModal] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const cart = useMemo(() => cartData?.data?.data, [cartData])
  const cartItems = useMemo(() => cart?.items || [], [cart])

  const getProductImage = useCallback((product) => {
    if (product?.images?.length) {
      const primary = product.images.find((i) => i.isPrimary)
      return (primary?.url || product.images[0]?.url) || null
    }
    return null
  }, [])

  const formatVariantOptions = useCallback((variantOptions) => {
    if (!variantOptions || Object.keys(variantOptions).length === 0) return 'No variants'
    return Object.entries(variantOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
  }, [])

  const subtotal = useMemo(() => cartItems.reduce((t, it) => t + (Number(it.price || 0) * Number(it.quantity || 0)), 0), [cartItems])
  const discountAmount = useMemo(() => Number(appliedCoupon?.discountAmount || 0), [appliedCoupon])
  const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount])
  const canProceed = useMemo(() => total > 0, [total])

  const handleQuantity = useCallback(async (skuId, nextQty) => {
    if (nextQty < 1) return toast.error('Quantity must be at least 1')
    try { await updateCartItem.mutateAsync({ skuId, quantity: nextQty }) } catch {}
  }, [updateCartItem])

  const handleRemove = useCallback(async (skuId) => {
    try { await removeFromCart.mutateAsync(skuId) } catch {}
  }, [removeFromCart])

  const handleClear = useCallback(() => setShowClearModal(true), [])
  const confirmClear = useCallback(async () => {
    try { await clearCart.mutateAsync(); setShowClearModal(false); setAppliedCoupon(null); setCouponCode('') } catch {}
  }, [clearCart])
  const cancelClear = useCallback(() => setShowClearModal(false), [])

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return toast.error('Enter a coupon code')
    setIsApplying(true)
    try {
      const res = await couponAPI.validateCoupon(couponCode.toUpperCase(), subtotal)
      if (res?.data?.success) {
        const c = res.data.data
        const applied = {
          code: c.coupon.code,
          discountAmount: c.discountAmount,
          name: c.coupon.name,
          discountType: c.coupon.discountType,
          discountValue: c.coupon.discountValue,
        }
        setAppliedCoupon(applied)
        try { localStorage.setItem('appliedCoupon', JSON.stringify(applied)) } catch {}
        toast.success(`Coupon "${c.coupon.name}" applied`)
        setCouponCode('')
      } else {
        toast.error(res?.data?.message || 'Invalid coupon')
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to apply coupon')
    } finally {
      setIsApplying(false)
    }
  }, [couponCode, subtotal])

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null)
    try { localStorage.removeItem('appliedCoupon') } catch {}
    toast.success('Coupon removed')
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('appliedCoupon')
      if (raw) setAppliedCoupon(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    const revalidate = async () => {
      if (!appliedCoupon?.code) return
      try {
        const res = await couponAPI.validateCoupon(appliedCoupon.code, subtotal)
        if (res?.data?.success) {
          setAppliedCoupon((prev) => prev ? { ...prev, discountAmount: res.data.data.discountAmount } : prev)
        } else {
          setAppliedCoupon(null)
        }
      } catch {}
    }
    revalidate()
  }, [subtotal])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 mb-4">Error loading cart</div>
          <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
          <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center space-x-2">
            <FiArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getProductImage(item.productId) ? (
                      <img src={getProductImage(item.productId)} alt={item.productId?.title || 'Product'} className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <FiShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{item.productId?.title || 'Product'}</h3>
                    <p className="text-sm text-gray-500 mb-2">{formatVariantOptions(item.variantOptions)}</p>
                    <p className="text-lg font-bold text-primary">KSh {Number(item.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <button onClick={() => handleQuantity(item.skuId, item.quantity - 1)} disabled={item.quantity <= 1 || updateCartItem.isPending} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-light hover:bg-gray-100 disabled:opacity-50">
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => handleQuantity(item.skuId, item.quantity + 1)} disabled={updateCartItem.isPending} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-light hover:bg-gray-100">
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => handleRemove(item.skuId)} disabled={removeFromCart.isPending} className="hidden sm:block text-red-600 hover:text-red-700 p-2" title="Remove item">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="sm:hidden mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 ml-24">
                    <button onClick={() => handleQuantity(item.skuId, item.quantity - 1)} disabled={item.quantity <= 1 || updateCartItem.isPending} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-light hover:bg-gray-100 disabled:opacity-50">
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => handleQuantity(item.skuId, item.quantity + 1)} disabled={updateCartItem.isPending} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-light hover:bg-gray-100">
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => handleRemove(item.skuId)} disabled={removeFromCart.isPending} className="text-red-600 hover:text-red-700 p-2">
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <button onClick={handleClear} className="text-red-600 hover:text-red-700 flex items-center gap-2" disabled={clearCart.isPending}>
                <FiTrash2 className="w-4 h-4" />
                Clear All Items
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FiTag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Have a coupon?</span>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" onKeyDown={(e) => e.key === 'Enter' && applyCoupon()} />
                      <button onClick={applyCoupon} disabled={isApplying || !couponCode.trim()} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50">{isApplying ? 'Applying...' : 'Apply'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiCheck className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">{appliedCoupon.name}</p>
                          <p className="text-xs text-green-600">Code: {appliedCoupon.code}</p>
                        </div>
                      </div>
                      <button onClick={removeCoupon} className="text-red-600 hover:text-red-700" title="Remove coupon">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">KSh {subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon ? (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-KSh {discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span className="text-green-600">KSh {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>KSh {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                {!canProceed && <p className="text-sm text-red-600 mt-1">Total should be above zero</p>}
              </div>

              <button onClick={() => navigate('/checkout')} className="w-full btn-primary py-3" disabled={!canProceed}>Proceed to Checkout</button>
              <button onClick={() => navigate('/')} className="w-full btn-outline mt-3 py-3">Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>

      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Cart</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to remove all items from your cart?</p>
              <div className="flex gap-3">
                <button onClick={cancelClear} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50" disabled={clearCart.isPending}>Cancel</button>
                <button onClick={confirmClear} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50" disabled={clearCart.isPending}>{clearCart.isPending ? 'Clearing...' : 'Clear Cart'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default Cart


