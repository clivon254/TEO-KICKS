import React from 'react'
import { FiDollarSign, FiClock, FiCheckCircle, FiRotateCcw } from 'react-icons/fi'



const PaymentStatusBadge = ({ status }) => {
    const statusKey = (status || '').toUpperCase()

    const config = {
        UNPAID: { text: 'Unpaid', classes: 'bg-violet-100 text-violet-800', Icon: FiDollarSign },
        PENDING: { text: 'Pending', classes: 'bg-yellow-100 text-yellow-800', Icon: FiClock },
        PAID: { text: 'Paid', classes: 'bg-green-100 text-green-800', Icon: FiCheckCircle },
        PARTIALLY_REFUNDED: { text: 'Partially Refunded', classes: 'bg-orange-100 text-orange-800', Icon: FiRotateCcw },
        REFUNDED: { text: 'Refunded', classes: 'bg-red-100 text-red-800', Icon: FiRotateCcw },
    }

    const { text, classes, Icon } = config[statusKey] || { text: statusKey || 'Unknown', classes: 'bg-slate-100 text-slate-800', Icon: FiDollarSign }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
            <Icon className="h-3.5 w-3.5" />
            {text}
        </span>
    )
}



export default PaymentStatusBadge

