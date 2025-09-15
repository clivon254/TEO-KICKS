import React from 'react'



const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const statusLower = (status || '').toLowerCase()
        
        switch (statusLower) {
            case 'active':
                return { text: 'Active', classes: 'bg-green-100 text-green-800' }
            case 'inactive':
                return { text: 'Inactive', classes: 'bg-gray-100 text-gray-800' }
            case 'expired':
                return { text: 'Expired', classes: 'bg-red-100 text-red-800' }
            case 'limit-reached':
                return { text: 'Limit Reached', classes: 'bg-orange-100 text-orange-800' }
            default:
                return { text: 'Unknown', classes: 'bg-gray-100 text-gray-800' }
        }
    }

    const { text, classes } = getStatusConfig(status)

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
            {text}
        </span>
    )
}



export default StatusBadge

