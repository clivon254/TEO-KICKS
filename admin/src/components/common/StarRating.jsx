import { FiStar } from 'react-icons/fi'


const StarRating = ({ 
    rating = 0, 
    onRatingChange, 
    size = 'md', 
    readonly = false,
    className = ''
}) => {
    const stars = [1, 2, 3, 4, 5]

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'w-4 h-4'
            case 'lg':
                return 'w-6 h-6'
            default:
                return 'w-5 h-5'
        }
    }

    const handleStarClick = (starValue) => {
        if (!readonly && onRatingChange) {
            onRatingChange(starValue)
        }
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    disabled={readonly}
                    className={`transition-colors duration-200 ${
                        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                    }`}
                >
                    <FiStar
                        className={`${getSizeClasses()} ${
                            star <= rating
                                ? 'fill-orange-400 text-orange-400'
                                : 'text-gray-300'
                        }`}
                    />
                </button>
            ))}
        </div>
    )
}


export default StarRating 