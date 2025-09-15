import React from 'react'
import { FiType } from 'react-icons/fi'


const RichTextEditor = ({ 
    content = '', 
    onChange, 
    placeholder = 'Start typing...',
    className = '',
    disabled = false,
    minHeight = '150px',
    maxLength = 1000
}) => {
    const handleChange = (e) => {
        const value = e.target.value
        onChange(value)
    }


    const characterCount = content.length
    const isNearLimit = characterCount > maxLength * 0.8
    const isOverLimit = characterCount > maxLength


    return (
        <div className={`rich-text-editor ${className}`}>
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                    <FiType className="h-4 w-4 mr-2" />
                    <span>Description</span>
                </div>
                
                <div className={`text-xs ${
                    isOverLimit ? 'text-red-500' : 
                    isNearLimit ? 'text-yellow-600' : 
                    'text-gray-500'
                }`}>
                    {characterCount}/{maxLength} characters
                </div>
            </div>


            <textarea
                value={content}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                className={`
                    w-full px-3 py-2 border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    resize-y
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    ${isOverLimit ? 'border-red-300 focus:ring-red-500' : ''}
                `}
                style={{ minHeight }}
                rows={6}
            />
        </div>
    )
}


export default RichTextEditor