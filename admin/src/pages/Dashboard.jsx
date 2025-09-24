import { useAuth } from '../contexts/AuthContext'
import { FiUser, FiMail, FiCalendar } from 'react-icons/fi'
import { useOverviewStats } from '../hooks/useStats'

const Dashboard = () => {
    const { user } = useAuth()
    const { data, isLoading } = useOverviewStats()

    const stats = data?.data || {}

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <main className="container py-6">
                {/* Welcome Section */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FiUser className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h2 className="title3">
                                        Welcome back, {user?.name}!
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        You're successfully logged into the TEO KICKS admin panel.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Info Cards */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Email Card */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FiMail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Email Address
                                            </dt>
                                            <dd className="text-sm font-medium text-primary">
                                                {user?.email}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FiUser className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Phone Number
                                            </dt>
                                            <dd className="text-sm font-medium text-primary">
                                                {user?.phone || 'Not provided'}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Join Date Card */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FiCalendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Member Since
                                            </dt>
                                            <dd className="text-sm font-medium text-primary">
                                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="title3 mb-4">
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <button className="btn-primary">
                                    Manage Products
                                </button>
                                <button className="btn-secondary">
                                    Manage Categories
                                </button>
                                <button className="btn-outline">
                                    Manage Brands
                                </button>
                                <button className="btn-outline">
                                    View Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="title3 mb-4">
                                Statistics
                            </h3>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{isLoading ? '…' : stats.totalProducts || 0}</div>
                                    <div className="text-sm text-gray-500">Total Products</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{isLoading ? '…' : stats.totalCategories || 0}</div>
                                    <div className="text-sm text-gray-500">Total Categories</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{isLoading ? '…' : stats.totalBrands || 0}</div>
                                    <div className="text-sm text-gray-500">Total Brands</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{isLoading ? '…' : stats.totalOrders || 0}</div>
                                    <div className="text-sm text-gray-500">Total Orders</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{isLoading ? '…' : (stats.totalRevenue || 0).toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">Total Revenue (KES)</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{isLoading ? '…' : stats.totalCustomers || 0}</div>
                                    <div className="text-sm text-gray-500">Total Customers</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{isLoading ? '…' : stats.recentOrders || 0}</div>
                                    <div className="text-sm text-gray-500">Orders (last 7 days)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard 