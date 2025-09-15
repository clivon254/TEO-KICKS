import React from 'react'


const ToggleSwitch = ({ 
    isActive, 
    onToggle, 
    disabled = false, 
    label = 'Status',
    description = '',
    className = ''
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <button
                type="button"
                onClick={onToggle}
                disabled={disabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                aria-pressed={isActive}
            >
                <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transform transition-transform ${isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                <span className="sr-only">Toggle status</span>
            </button>
            <span className={`ml-3 text-sm font-medium ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
            {description && (
                <p className="mt-1 text-sm text-gray-500">
                    {description}
                </p>
            )}
        </div>
    )
}


export default ToggleSwitch 