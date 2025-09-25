import { useMemo, useState, useEffect } from 'react'
import { useOverviewStats, useAnalytics } from '../hooks/useStats'
import { orderAPI } from '../utils/api'
import { FiDollarSign, FiShoppingBag, FiUsers, FiActivity, FiArrowUpRight, FiArrowDownRight, FiMail } from 'react-icons/fi'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'


const Dashboard = () => {
    const { data: overviewRes, isLoading: isLoadingOverview } = useOverviewStats()

    const { data: analyticsRes, isLoading: isLoadingAnalytics } = useAnalytics({ range: '30d' })

    const [recentOrders, setRecentOrders] = useState([])

    useEffect(() => {
        const loadRecent = async () => {
            try {
                const res = await orderAPI.getOrders({ page: 1, limit: 5 })
                setRecentOrders(res.data?.data?.orders || [])
            } catch (_) {
                setRecentOrders([])
            }
        }
        loadRecent()
    }, [])

    const stats = overviewRes?.data || {}

    const paidOrdersSeries = analyticsRes?.data?.paidOrdersSeries || []
    const revenueSeries = analyticsRes?.data?.revenueSeries || []
    const customersSeries = analyticsRes?.data?.customersSeries || []

    const calcChange = (series) => {
        if (!series || series.length === 0) return { pct: 0, dir: 'up' }
        const sum = (arr, keyA, keyB) => arr.reduce((s, p) => s + Number(p[keyA] ?? p[keyB] ?? 0), 0)
        const last7 = sum(series.slice(-7), 'count', 'amount')
        const prev7 = sum(series.slice(-14, -7), 'count', 'amount')
        if (prev7 === 0) return { pct: 100, dir: 'up' }
        const pct = ((last7 - prev7) / Math.abs(prev7)) * 100
        return { pct: Math.round(pct * 10) / 10, dir: pct >= 0 ? 'up' : 'down' }
    }

    const revenueChange = useMemo(() => calcChange(revenueSeries), [revenueSeries])
    const ordersPaidChange = useMemo(() => calcChange(paidOrdersSeries), [paidOrdersSeries])
    const customersChange = useMemo(() => calcChange(customersSeries), [customersSeries])

    const formatCurrency = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(Number(v || 0))

    const timeAgo = (isoDate) => {
        if (!isoDate) return '—'
        const d = new Date(isoDate)
        const diff = Math.floor((Date.now() - d.getTime()) / 1000)
        if (diff < 60) return `${diff}s ago`
        const m = Math.floor(diff / 60)
        if (m < 60) return `${m}m ago`
        const h = Math.floor(m / 60)
        if (h < 24) return `${h}h ago`
        const days = Math.floor(h / 24)
        if (days < 30) return `${days}d ago`
        const months = Math.floor(days / 30)
        return `${months}mo ago`
    }

    const StatCard = ({ title, value, icon: Icon, change }) => {
        const isUp = (change?.dir || 'up') === 'up'
        const pct = Math.abs(change?.pct ?? 0)
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">{title}</div>
                    <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-gray-900">{value}</div>
                <div className="mt-2 flex items-center text-sm">
                    {isUp ? (
                        <FiArrowUpRight className="text-emerald-500 mr-1" />
                    ) : (
                        <FiArrowDownRight className="text-rose-500 mr-1" />
                    )}
                    <span className={isUp ? 'text-emerald-600' : 'text-rose-600'}>
                        {pct}%
                    </span>
                    <span className="text-gray-400 ml-2">vs prev 7d</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="container py-6">
                <div className="px-4 sm:px-0">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Revenue"
                            value={isLoadingOverview ? '…' : formatCurrency(stats.totalRevenue || 0)}
                            icon={FiDollarSign}
                            change={revenueChange}
                        />
                        <StatCard
                            title="Orders Paid"
                            value={isLoadingOverview ? '…' : (stats.totalPaidOrders || 0).toLocaleString()}
                            icon={FiShoppingBag}
                            change={ordersPaidChange}
                        />
                        <StatCard
                            title="New Customers"
                            value={isLoadingOverview ? '…' : (stats.totalCustomers || 0).toLocaleString()}
                            icon={FiUsers}
                            change={customersChange}
                        />
                        <StatCard
                            title="Pending Payments"
                            value={isLoadingOverview ? '…' : (stats.totalPendingPayments || 0).toLocaleString()}
                            icon={FiActivity}
                            change={{ pct: 0, dir: 'up' }}
                        />
                    </div>
                </div>

                <div className="px-4 sm:px-0 mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm xl:col-span-2">
                        <div className="flex items-center justify-between">
                            <div className="title3 mb-0">Sales Overview</div>
                            <div className="text-sm text-gray-500">Paid orders (last 30 days)</div>
                        </div>
                        <div className="mt-4 h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={paidOrdersSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                    <defs>
                                        <linearGradient id="paidColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4B2E83" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#4B2E83" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                    <Tooltip formatter={(v) => [v, 'Paid Orders']} labelFormatter={(l) => l} />
                                    <Area type="monotone" dataKey="count" stroke="#4B2E83" fillOpacity={1} fill="url(#paidColor)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="title3 mb-0">Recent Orders</div>
                        <div className="mt-4 space-y-4">
                            {recentOrders.map((o) => (
                                <div key={o._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-primary/30 transition">
                                <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                            <FiMail className="text-gray-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{o?.customer?.name || 'Customer'}</div>
                                            <div className="text-xs text-gray-500">{o?.customer?.email || '—'} · {timeAgo(o?.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className={o.paymentStatus === 'PAID' ? 'text-emerald-600 text-sm font-semibold' : 'text-gray-500 text-sm font-semibold'}>
                                        {formatCurrency(o?.pricing?.total || 0)}
                                    </div>
                                </div>
                            ))}
                            {recentOrders.length === 0 && (
                                <div className="text-sm text-gray-500">No recent orders</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}


export default Dashboard 