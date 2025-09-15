import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSettings, FiGlobe, FiCreditCard, FiTruck, FiClock, FiDollarSign, FiArrowLeft, FiSave, FiRefreshCw, FiPlus, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
  useGetStoreConfig,
  useCreateStoreConfig,
  useUpdateStoreConfig,
  useDeleteStoreConfig,
  useInitStoreConfig
} from '../../hooks/useStoreConfig'

const StoreConfigurations = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState({
    // General Settings
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: {
      street: '',
      city: '',
      country: '',
      postalCode: ''
    },

    // Business Hours
    businessHours: [
      { day: 'monday', open: '09:00', close: '18:00', isOpen: true },
      { day: 'tuesday', open: '09:00', close: '18:00', isOpen: true },
      { day: 'wednesday', open: '09:00', close: '18:00', isOpen: true },
      { day: 'thursday', open: '09:00', close: '18:00', isOpen: true },
      { day: 'friday', open: '09:00', close: '18:00', isOpen: true },
      { day: 'saturday', open: '10:00', close: '16:00', isOpen: true },
      { day: 'sunday', open: '', close: '', isOpen: false }
    ],

    // Payment Settings
    paymentMethods: {
      mpesa: { enabled: true, shortcode: '' },
      card: { enabled: true, paystackKey: '' },
      cash: { enabled: true, description: 'Pay on delivery' }
    },

    // Shipping Settings
    shippingSettings: {
      freeShippingThreshold: 5000,
      baseDeliveryFee: 200,
      feePerKm: 50
    },

    // Notification Settings
    notificationSettings: {
    emailNotifications: true,
    smsNotifications: true,
      orderConfirmations: true,
      stockAlerts: true
    },

    // Store Status
    isActive: true
  })

  // API hooks
  const { data: configData, isLoading: configLoading, error: configError, refetch } = useGetStoreConfig()
  const createConfigMutation = useCreateStoreConfig()
  const updateConfigMutation = useUpdateStoreConfig()
  const deleteConfigMutation = useDeleteStoreConfig()
  const initConfigMutation = useInitStoreConfig()

  const config = configData?.data?.config
  const hasConfig = !!config

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'hours', label: 'Business Hours', icon: FiClock },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
    { id: 'notifications', label: 'Notifications', icon: FiGlobe },
  ]

  // Load configuration data into form when it arrives
  useEffect(() => {
    if (config) {
      setFormData({
        storeName: config.storeName || '',
        storeEmail: config.storeEmail || '',
        storePhone: config.storePhone || '',
        storeAddress: config.storeAddress || {
          street: '',
          city: '',
          country: '',
          postalCode: ''
        },
        businessHours: config.businessHours || [
          { day: 'monday', open: '09:00', close: '18:00', isOpen: true },
          { day: 'tuesday', open: '09:00', close: '18:00', isOpen: true },
          { day: 'wednesday', open: '09:00', close: '18:00', isOpen: true },
          { day: 'thursday', open: '09:00', close: '18:00', isOpen: true },
          { day: 'friday', open: '09:00', close: '18:00', isOpen: true },
          { day: 'saturday', open: '10:00', close: '16:00', isOpen: true },
          { day: 'sunday', open: '', close: '', isOpen: false }
        ],
        paymentMethods: config.paymentMethods || {
          mpesa: { enabled: true, shortcode: '' },
          card: { enabled: true, paystackKey: '' },
          cash: { enabled: true, description: 'Pay on delivery' }
        },
        shippingSettings: config.shippingSettings || {
          freeShippingThreshold: 5000,
          baseDeliveryFee: 200,
          feePerKm: 50
        },
        notificationSettings: config.notificationSettings || {
          emailNotifications: true,
          smsNotifications: true,
          orderConfirmations: true,
          stockAlerts: true
        },
        isActive: config.isActive ?? true
      })
    }
  }, [config])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleNestedInputChange = (category, field, value, type = 'text') => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: type === 'number' ? Number(value) : value
      }
    }))
  }

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      storeAddress: {
        ...prev.storeAddress,
        [field]: value
      }
    }))
  }

  const handleBusinessHoursChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: prev.businessHours.map((hour, i) =>
        i === index ? { ...hour, [field]: value } : hour
      )
    }))
  }

  const handlePaymentMethodToggle = (method, field, value) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: {
          ...prev.paymentMethods[method],
          [field]: value
        }
      }
    }))
  }

  const handleShippingChange = (field, value, type = 'number') => {
    setFormData(prev => ({
      ...prev,
      shippingSettings: {
        ...prev.shippingSettings,
        [field]: type === 'number' ? Number(value) : value
      }
    }))
  }

  const handleNotificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (hasConfig) {
        // Update existing configuration
        await updateConfigMutation.mutateAsync(formData)
      } else {
        // Create new configuration
        await createConfigMutation.mutateAsync(formData)
      }
    } catch (error) {
      console.error('Error saving store configuration:', error)
    }
  }

  const handleInitConfig = async () => {
    try {
      await initConfigMutation.mutateAsync()
    } catch (error) {
      console.error('Error initializing store configuration:', error)
    }
  }

  const handleDeleteConfig = async () => {
    if (window.confirm('Are you sure you want to delete the store configuration? This action cannot be undone.')) {
      try {
        await deleteConfigMutation.mutateAsync()
      } catch (error) {
        console.error('Error deleting store configuration:', error)
      }
    }
  }

  const isLoading = configLoading || createConfigMutation.isPending || updateConfigMutation.isPending || deleteConfigMutation.isPending || initConfigMutation.isPending

  // Loading and error states
  if (configLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading store configuration: {configError.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter store name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="storeEmail"
                    value={formData.storeEmail}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter contact email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="storePhone"
                    value={formData.storePhone}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter contact phone"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Address
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={formData.storeAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.storeAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={formData.storeAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                    className="input"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={formData.storeAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                    onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Store is Active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'hours':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-4">
                {formData.businessHours.map((hour, index) => (
                  <div key={hour.day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {hour.day}
                      </span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hour.isOpen}
                        onChange={(e) => handleBusinessHoursChange(index, 'isOpen', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Open</span>
                    </label>
                    {hour.isOpen && (
                      <>
                        <input
                          type="time"
                          value={hour.open}
                          onChange={(e) => handleBusinessHoursChange(index, 'open', e.target.value)}
                          className="input w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hour.close}
                          onChange={(e) => handleBusinessHoursChange(index, 'close', e.target.value)}
                          className="input w-32"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-6">
                {/* M-Pesa */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiCreditCard className="h-6 w-6 text-green-600" />
                      </div>
                    <div>
                        <h4 className="font-medium text-gray-900">M-Pesa</h4>
                        <p className="text-sm text-gray-500">Mobile money payments</p>
                    </div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                        checked={formData.paymentMethods.mpesa.enabled}
                        onChange={(e) => handlePaymentMethodToggle('mpesa', 'enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Enabled</span>
                    </label>
                  </div>
                  {formData.paymentMethods.mpesa.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shortcode *
                  </label>
                      <input
                        type="text"
                        value={formData.paymentMethods.mpesa.shortcode}
                        onChange={(e) => handlePaymentMethodToggle('mpesa', 'shortcode', e.target.value)}
                        className="input"
                        placeholder="Enter M-Pesa shortcode"
                      />
                    </div>
                  )}
                </div>

                {/* Card Payments */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                    <div>
                        <h4 className="font-medium text-gray-900">Card Payments</h4>
                        <p className="text-sm text-gray-500">Visa, Mastercard via Paystack</p>
                    </div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                        checked={formData.paymentMethods.card.enabled}
                        onChange={(e) => handlePaymentMethodToggle('card', 'enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Enabled</span>
                  </label>
                </div>
                  {formData.paymentMethods.card.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paystack Public Key *
                      </label>
                      <input
                        type="text"
                        value={formData.paymentMethods.card.paystackKey}
                        onChange={(e) => handlePaymentMethodToggle('card', 'paystackKey', e.target.value)}
                        className="input"
                        placeholder="Enter Paystack public key"
                      />
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Cash on Delivery</h4>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                        checked={formData.paymentMethods.cash.enabled}
                        onChange={(e) => handlePaymentMethodToggle('cash', 'enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Enabled</span>
                  </label>
                </div>
                  {formData.paymentMethods.cash.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <input
                      type="text"
                        value={formData.paymentMethods.cash.description}
                        onChange={(e) => handlePaymentMethodToggle('cash', 'description', e.target.value)}
                      className="input"
                        placeholder="Enter description"
                    />
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'shipping':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Shipping Threshold (KES)
                    </label>
                    <input
                    type="number"
                    value={formData.shippingSettings.freeShippingThreshold}
                    onChange={(e) => handleShippingChange('freeShippingThreshold', e.target.value)}
                      className="input"
                    placeholder="5000"
                    min="0"
                    />
                  <p className="text-xs text-gray-500 mt-1">
                    Orders above this amount get free shipping
                  </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Delivery Fee (KES)
                    </label>
                    <input
                    type="number"
                    value={formData.shippingSettings.baseDeliveryFee}
                    onChange={(e) => handleShippingChange('baseDeliveryFee', e.target.value)}
                      className="input"
                    placeholder="200"
                    min="0"
                    />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum delivery fee
                  </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Per Kilometer (KES)
                    </label>
                    <input
                    type="number"
                    value={formData.shippingSettings.feePerKm}
                    onChange={(e) => handleShippingChange('feePerKm', e.target.value)}
                      className="input"
                    placeholder="50"
                      min="0"
                    />
                  <p className="text-xs text-gray-500 mt-1">
                    Additional fee per kilometer
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive order updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notificationSettings.emailNotifications}
                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive order updates via SMS</p>
                  </div>
                    <input
                      type="checkbox"
                    checked={formData.notificationSettings.smsNotifications}
                    onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Order Confirmations</h4>
                    <p className="text-sm text-gray-500">Send confirmation when orders are placed</p>
                  </div>
                    <input
                      type="checkbox"
                    checked={formData.notificationSettings.orderConfirmations}
                    onChange={(e) => handleNotificationChange('orderConfirmations', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Stock Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
                  </div>
                    <input
                      type="checkbox"
                    checked={formData.notificationSettings.stockAlerts}
                    onChange={(e) => handleNotificationChange('stockAlerts', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Settings
          </Link>
        </div>

        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FiSettings className="h-6 w-6 text-primary" />
          </div>
          <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {hasConfig ? 'Store Configuration' : 'Create Store Configuration'}
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {hasConfig
                  ? 'Manage your store settings and preferences'
                  : 'Set up your store configuration to get started'
                }
              </p>
            </div>
          </div>

          {hasConfig && (
            <div className="flex gap-2">
              <button
                onClick={handleInitConfig}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FiRefreshCw className="h-4 w-4" />
                Reset to Default
              </button>
              <button
                onClick={handleDeleteConfig}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                <FiTrash2 className="h-4 w-4" />
                Delete Config
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {!hasConfig && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <FiSettings className="h-5 w-5 text-blue-600" />
                <div>
              <h3 className="font-medium text-blue-900">No Store Configuration Found</h3>
              <p className="text-sm text-blue-700">
                Create your store configuration to enable all store features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide px-4 md:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 md:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit}>
            {renderTabContent()}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
              <Link
                to="/settings"
                className="btn btn-outline flex items-center justify-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                <FiSave className="h-4 w-4" />
                {isLoading
                  ? 'Saving...'
                  : hasConfig
                    ? 'Update Configuration'
                    : 'Create Configuration'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StoreConfigurations