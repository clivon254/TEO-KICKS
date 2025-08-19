/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to slug
 * @returns {string} - The generated slug
 */
export const generateSlug = (text) => {
    if (!text) return ''
    
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 * @param {string} text - The text to convert to slug
 * @param {Function} checkExists - Function to check if slug exists (should return boolean)
 * @returns {Promise<string>} - The unique slug
 */
export const generateUniqueSlug = async (text, checkExists) => {
    let slug = generateSlug(text)
    let counter = 1
    let uniqueSlug = slug
    
    while (await checkExists(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`
        counter++
    }
    
    return uniqueSlug
} 