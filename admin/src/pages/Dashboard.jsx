import { useMemo, useState, useEffect, useCallback } from 'react'
import { useOverviewStats, useAnalytics } from '../hooks/useStats'
import { orderAPI } from '../utils/api'
import { FiDollarSign, FiShoppingBag, FiUsers, FiActivity, FiArrowUpRight, FiArrowDownRight, FiMail, FiChevronDown } from 'react-icons/fi'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'


const Dashboard = () => {
    const [selectedRange, setSelectedRange] = useState('30d')
    
    const { data: overviewRes, isLoading: isLoadingOverview } = useOverviewStats()

    const { data: analyticsRes, isLoading: isLoadingAnalytics } = useAnalytics({ range: selectedRange })

    const [recentOrders, setRecentOrders] = useState([])

    // Memoized recent orders loading function
    const loadRecentOrders = useCallback(async () => {
        try {
            const res = await orderAPI.getOrders({ page: 1, limit: 5 })
            setRecentOrders(res.data?.data?.orders || [])
        } catch (_) {
            setRecentOrders([])
        }
    }, [])

    useEffect(() => {
        loadRecentOrders()
    }, [loadRecentOrders])

    // Memoized stats data
    const stats = useMemo(() => overviewRes?.data || {}, [overviewRes?.data])

    // Memoized analytics series
    const paidOrdersSeries = useMemo(() => analyticsRes?.data?.paidOrdersSeries || [], [analyticsRes?.data?.paidOrdersSeries])
    const revenueSeries = useMemo(() => analyticsRes?.data?.revenueSeries || [], [analyticsRes?.data?.revenueSeries])
    const customersSeries = useMemo(() => analyticsRes?.data?.customersSeries || [], [analyticsRes?.data?.customersSeries])

    // Memoized calculation function
    const calcChange = useCallback((series, range) => {
        if (!series || series.length === 0) return { pct: 0, dir: 'neutral' }
        const sum = (arr, keyA, keyB) => arr.reduce((s, p) => s + Number(p[keyA] ?? p[keyB] ?? 0), 0)
        
        // Calculate period length based on selected range
        const getPeriodLength = (range) => {
            switch (range) {
                case '7d': return 3
                case '14d': return 7
                case '30d': return 7
                case '90d': return 15
                case '120d': return 20
                case '6m': return 30
                case '12m': return 60
                default: return 7
            }
        }
        
        const periodLength = getPeriodLength(range)
        const currentPeriod = sum(series.slice(-periodLength), 'count', 'amount')
        const previousPeriod = sum(series.slice(-periodLength * 2, -periodLength), 'count', 'amount')
        
        if (previousPeriod === 0) return { pct: 100, dir: 'up' }
        const pct = ((currentPeriod - previousPeriod) / Math.abs(previousPeriod)) * 100
        const roundedPct = Math.round(pct * 10) / 10
        
        if (roundedPct === 0) return { pct: 0, dir: 'neutral' }
        return { pct: roundedPct, dir: roundedPct > 0 ? 'up' : 'down' }
    }, [])

    // Memoized change calculations
    const revenueChange = useMemo(() => calcChange(revenueSeries, selectedRange), [calcChange, revenueSeries, selectedRange])
    const ordersPaidChange = useMemo(() => calcChange(paidOrdersSeries, selectedRange), [calcChange, paidOrdersSeries, selectedRange])
    const customersChange = useMemo(() => calcChange(customersSeries, selectedRange), [calcChange, customersSeries, selectedRange])

    // Memoized utility functions
    const formatCurrency = useCallback((v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(Number(v || 0)), [])

    const timeAgo = useCallback((isoDate) => {
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
    }, [])

    // Memoized comparison text function
    const getComparisonText = useCallback((range) => {
        const rangeMap = {
            '7d': 'compared to last 7 days',
            '14d': 'compared to last 14 days',
            '30d': 'compared to last 30 days',
            '90d': 'compared to last 90 days',
            '120d': 'compared to last 120 days',
            '6m': 'compared to last 6 months',
            '12m': 'compared to last 12 months'
        }
        return rangeMap[range] || 'compared to last 7 days'
    }, [])

    // Memoized StatCard component
    const StatCard = useCallback(({ title, value, icon: Icon, change }) => {
        const pct = Math.abs(change?.pct ?? 0)
        const dir = change?.dir || 'neutral'
        
        const renderIndicator = () => {
            if (dir === 'neutral' || pct === 0) {
                return (
                    <>
                        <span className="text-blue-500 mr-1">—</span>
                        <span className="text-blue-600">0%</span>
                    </>
                )
            }
            
            if (dir === 'up') {
                return (
                    <>
                        <FiArrowUpRight className="text-emerald-500 mr-1" />
                        <span className="text-emerald-600">{pct}%</span>
                    </>
                )
            }
            
            return (
                <>
                    <FiArrowDownRight className="text-rose-500 mr-1" />
                    <span className="text-rose-600">{pct}%</span>
                </>
            )
        }

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
                    {renderIndicator()}
                    <span className="text-gray-400 ml-2">{getComparisonText(selectedRange)}</span>
                </div>
            </div>
        )
    }, [getComparisonText, selectedRange])

    // Memoized time range options
    const timeRangeOptions = useMemo(() => [
        { value: '7d', label: 'Last 7 days' },
        { value: '14d', label: 'Last 14 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '120d', label: 'Last 120 days' },
        { value: '6m', label: 'Last 6 months' },
        { value: '12m', label: 'Last 12 months' }
    ], [])

    // Memoized range change handler
    const handleRangeChange = useCallback((e) => {
        setSelectedRange(e.target.value)
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="container py-6">
                {/* Time Range Selector */}
                <div className="px-4 sm:px-0 mb-6">
                    <div className="flex flex-col md:flex-row  md:justify-between gap-y-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-sm text-gray-500">Overview of your store performance</p>
                                    </div>
                        <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700">Time Range:</label>
                            <div className="relative">
                                <select
                                    value={selectedRange}
                                    onChange={handleRangeChange}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                >
                                    {timeRangeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

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
                            <div className="text-sm text-gray-500">Paid orders ({timeRangeOptions.find(opt => opt.value === selectedRange)?.label.toLowerCase()})</div>
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