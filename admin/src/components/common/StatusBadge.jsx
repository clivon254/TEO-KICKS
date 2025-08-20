import React from 'react'



const StatusBadge = ({ status }) => {
    const isActive = (status || '').toLowerCase() === 'active'
    const classes = isActive
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    )
}



export default StatusBadge

