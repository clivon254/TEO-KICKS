import React from 'react'
import { FiClock, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiRotateCcw } from 'react-icons/fi'



const OrderStatusBadge = ({ status }) => {
    const statusKey = (status || '').toUpperCase()

    const config = {
        PLACED: { text: 'Placed', classes: 'bg-sky-100 text-sky-800', Icon: FiClock },
        CONFIRMED: { text: 'Confirmed', classes: 'bg-blue-100 text-blue-800', Icon: FiCheckCircle },
        PACKED: { text: 'Packed', classes: 'bg-indigo-100 text-indigo-800', Icon: FiPackage },
        SHIPPED: { text: 'Shipped', classes: 'bg-purple-100 text-purple-800', Icon: FiTruck },
        OUT_FOR_DELIVERY: { text: 'Out for delivery', classes: 'bg-amber-100 text-amber-800', Icon: FiTruck },
        DELIVERED: { text: 'Delivered', classes: 'bg-green-100 text-green-800', Icon: FiCheckCircle },
        CANCELLED: { text: 'Cancelled', classes: 'bg-red-100 text-red-800', Icon: FiXCircle },
        REFUNDED: { text: 'Refunded', classes: 'bg-rose-100 text-rose-800', Icon: FiRotateCcw },
    }

    const { text, classes, Icon } = config[statusKey] || { text: statusKey || 'Unknown', classes: 'bg-slate-100 text-slate-800', Icon: FiClock }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
            <Icon className="h-3.5 w-3.5" />
            {text}
        </span>
    )
}



export default OrderStatusBadge

