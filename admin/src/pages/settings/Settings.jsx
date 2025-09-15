import { Link } from 'react-router-dom'
import {
  FiUser,
  FiMapPin,
  FiLock,
  FiSettings as FiStoreSettings,
  FiArrowLeft
} from 'react-icons/fi'

const Settings = () => {
  const settingsOptions = [
    {
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      icon: FiUser,
      href: '/settings/profile',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Address',
      description: 'Manage your addresses and delivery locations',
      icon: FiMapPin,
      href: '/settings/address',
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Change Password',
      description: 'Update your account password for security',
      icon: FiLock,
      href: '/settings/change-password',
      color: 'text-red-600 bg-red-50',
    },
    {
      title: 'Store Configurations',
      description: 'Configure store settings and preferences',
      icon: FiStoreSettings,
      href: '/settings/store-configurations',
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {settingsOptions.map((option) => {
          const Icon = option.icon
          return (
            <Link
              key={option.title}
              to={option.href}
              className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-3 rounded-lg ${option.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <FiArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:transform group-hover:-translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Additional Information */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
        <p className="text-gray-600 text-sm mb-4">
          If you need assistance with any of these settings or have questions about your account,
          please contact our support team.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="btn btn-secondary text-sm">
            Contact Support
          </button>
          <button className="btn btn-outline text-sm">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings