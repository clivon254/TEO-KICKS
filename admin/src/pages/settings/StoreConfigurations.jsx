import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSettings, FiGlobe, FiCreditCard, FiTruck, FiClock, FiDollarSign, FiArrowLeft, FiSave, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'

const StoreConfigurations = () => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState({
    // General Settings
    storeName: 'TEO KICKS',
    storeDescription: 'Your premier destination for quality footwear',
    contactEmail: 'info@teokicks.com',
    contactPhone: '+254 700 000 000',
    timezone: 'Africa/Nairobi',

    // Business Hours
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    },

    // Payment Settings
    paymentMethods: {
      mpesa: true,
      card: true,
      cash: false,
    },
    mpesaConfig: {
      shortcode: '',
      passkey: '',
      consumerKey: '',
      consumerSecret: '',
    },

    // Delivery Settings
    deliveryFeePerKm: 50,
    freeDeliveryThreshold: 5000,
    maxDeliveryDistance: 50,

    // Currency Settings
    currency: 'KES',
    currencySymbol: 'KSh',

    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    orderNotifications: true,
  })

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'hours', label: 'Business Hours', icon: FiClock },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'delivery', label: 'Delivery', icon: FiTruck },
    { id: 'notifications', label: 'Notifications', icon: FiGlobe },
  ]

  useEffect(() => {
    // Simulate loading store configuration
    const loadStoreConfig = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        // In a real app, you'd fetch this from an API
      } catch (error) {
        console.error('Error loading store configuration:', error)
      }
    }

    loadStoreConfig()
  }, [])

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

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }))
  }

  const handlePaymentMethodToggle = (method, checked) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: checked
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call to save store configuration
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Store configuration saved successfully!')
    } catch (error) {
      console.error('Error saving store configuration:', error)
      toast.error('Failed to save store configuration')
    } finally {
      setLoading(false)
    }
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
                    Store Name
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                    <option value="Africa/Johannesburg">South Africa Standard Time (SAST)</option>
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="input"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    name="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="KSh"
                  />
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
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <span className="font-medium text-gray-900 capitalize">{day}</span>
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Open</span>
                    </label>

                    {!hours.closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                          className="input text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                    )}

                    {hours.closed && (
                      <span className="text-sm text-gray-500 italic">Closed</span>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiDollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">M-Pesa</p>
                      <p className="text-sm text-gray-600">Mobile money payments</p>
                    </div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.mpesa}
                      onChange={(e) => handlePaymentMethodToggle('mpesa', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Credit/Debit Cards</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
                    </div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.card}
                      onChange={(e) => handlePaymentMethodToggle('card', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiDollarSign className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive</p>
                    </div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.cash}
                      onChange={(e) => handlePaymentMethodToggle('cash', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>
            </div>

            {formData.paymentMethods.mpesa && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">M-Pesa Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shortcode
                    </label>
                    <input
                      type="text"
                      value={formData.mpesaConfig.shortcode}
                      onChange={(e) => handleNestedInputChange('mpesaConfig', 'shortcode', e.target.value)}
                      className="input"
                      placeholder="174379"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consumer Key
                    </label>
                    <input
                      type="text"
                      value={formData.mpesaConfig.consumerKey}
                      onChange={(e) => handleNestedInputChange('mpesaConfig', 'consumerKey', e.target.value)}
                      className="input"
                      placeholder="Your consumer key"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consumer Secret
                    </label>
                    <input
                      type="password"
                      value={formData.mpesaConfig.consumerSecret}
                      onChange={(e) => handleNestedInputChange('mpesaConfig', 'consumerSecret', e.target.value)}
                      className="input"
                      placeholder="Your consumer secret"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passkey
                    </label>
                    <input
                      type="password"
                      value={formData.mpesaConfig.passkey}
                      onChange={(e) => handleNestedInputChange('mpesaConfig', 'passkey', e.target.value)}
                      className="input"
                      placeholder="Your passkey"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'delivery':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Fee per KM
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={formData.deliveryFeePerKm}
                      onChange={(e) => handleNestedInputChange('', 'deliveryFeePerKm', e.target.value, 'number')}
                      className="input pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Delivery Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={formData.freeDeliveryThreshold}
                      onChange={(e) => handleNestedInputChange('', 'freeDeliveryThreshold', e.target.value, 'number')}
                      className="input pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Delivery Distance (KM)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDeliveryDistance}
                    onChange={(e) => handleNestedInputChange('', 'maxDeliveryDistance', e.target.value, 'number')}
                    className="input"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Send email notifications for orders and updates</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Send SMS notifications for orders and updates</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={formData.smsNotifications}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Order Notifications</p>
                    <p className="text-sm text-gray-600">Notify customers about order status changes</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="orderNotifications"
                      checked={formData.orderNotifications}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Settings
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
            <FiSettings className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Configurations</h1>
            <p className="text-gray-600">Configure your store settings and preferences</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {renderTabContent()}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                className="btn btn-outline flex items-center gap-2"
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
                disabled={loading}
              >
                <FiSave className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StoreConfigurations