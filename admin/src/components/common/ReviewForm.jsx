import { useState, useEffect } from 'react'
import StarRating from './StarRating'
import { FiX } from 'react-icons/fi'


const ReviewForm = ({ 
    onSubmit, 
    onCancel, 
    initialData = null, 
    isEditing = false,
    isLoading = false,
    className = ''
}) => {
    const [formData, setFormData] = useState({
        rating: 0,
        comment: ''
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                rating: initialData.rating || 0,
                comment: initialData.comment || ''
            })
        }
    }, [initialData])

    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, rating }))
    }

    const handleCommentChange = (e) => {
        setFormData(prev => ({ ...prev, comment: e.target.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (formData.rating === 0) {
            alert('Please select a rating')
            return
        }
        
        if (!formData.comment.trim()) {
            alert('Please write a comment')
            return
        }

        onSubmit(formData)
    }

    const isValid = formData.rating > 0 && formData.comment.trim().length > 0

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Edit Review' : 'Write a Review'}
                </h3>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                    </label>
                    <StarRating
                        rating={formData.rating}
                        onRatingChange={handleRatingChange}
                        size="lg"
                    />
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment *
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={handleCommentChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Share your experience with this product..."
                        maxLength={1000}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                        {formData.comment.length}/1000
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-button transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : (isEditing ? 'Update Review' : 'Submit Review')}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}


export default ReviewForm 