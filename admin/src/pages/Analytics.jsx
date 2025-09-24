import { useState } from 'react'
import { useAnalytics } from '../hooks/useStats'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'


const ranges = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 90 days' },
    { key: '12m', label: 'Last 12 months' },
]


const Analytics = () => {
    const [range, setRange] = useState('30d')
    const { data, isLoading } = useAnalytics({ range })

    const analytics = data?.data || {}

    const ordersSeries = analytics.ordersSeries || []
    const revenueSeries = analytics.revenueSeries || []
    const customersSeries = analytics.customersSeries || []
    const topProducts = analytics.topProducts || []

    const ordersData = ordersSeries.map(p => ({ date: p._id, value: p.count }))
    const revenueData = revenueSeries.map(p => ({ date: p._id, value: p.amount }))
    const customersData = customersSeries.map(p => ({ date: p._id, value: p.count }))
    const topProductsData = topProducts.map(p => ({ name: p.title || 'Unknown', qty: p.qty }))

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="container py-6">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="title3">Analytics</h2>
                                <select
                                    className="input2 w-auto"
                                    value={range}
                                    onChange={(e) => setRange(e.target.value)}
                                >
                                    {ranges.map(r => (
                                        <option key={r.key} value={r.key}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="title3 mb-2">Orders over time</div>
                                    {isLoading ? (
                                        <div className="h-64 bg-gray-200 animate-pulse rounded" />
                                    ) : (
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={ordersData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="value" name="Orders" stroke="#4B2E83" strokeWidth={2} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="title3 mb-2">Revenue over time (KES)</div>
                                    {isLoading ? (
                                        <div className="h-64 bg-gray-200 animate-pulse rounded" />
                                    ) : (
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="revColor" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#E879F9" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#E879F9" stopOpacity={0.1} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                                    <YAxis tickFormatter={(v) => `KES ${Number(v).toLocaleString()}`} tick={{ fontSize: 11 }} />
                                                    <Tooltip formatter={(v) => [`KES ${Number(v).toLocaleString()}`, 'Revenue']} />
                                                    <Legend />
                                                    <Area type="monotone" dataKey="value" name="Revenue" stroke="#E879F9" fillOpacity={1} fill="url(#revColor)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="title3 mb-2">New customers over time</div>
                                    {isLoading ? (
                                        <div className="h-64 bg-gray-200 animate-pulse rounded" />
                                    ) : (
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={customersData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="value" name="Customers" fill="#4B2E83" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="title3 mb-2">Top products (by quantity)</div>
                                {isLoading ? (
                                    <div className="h-72 bg-gray-200 animate-pulse rounded" />
                                ) : (
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topProductsData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" allowDecimals={false} />
                                                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="qty" name="Qty" fill="#3A1F66" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}


export default Analytics

