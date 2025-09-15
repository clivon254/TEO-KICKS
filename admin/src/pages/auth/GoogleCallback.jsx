import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const GoogleCallback = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { handleGoogleCallback } = useAuth()
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('Google callback initiated')
                console.log('Search params:', Object.fromEntries(searchParams.entries()))

                const code = searchParams.get('code')
                const error = searchParams.get('error')
                const state = searchParams.get('state')

                console.log('OAuth callback details:', { code: !!code, error, state })

                if (error) {
                    console.error('OAuth error received:', error)
                    setError(`Authentication failed: ${error}`)
                    setIsLoading(false)
                    return
                }

                if (!code) {
                    console.error('No authorization code received')
                    setError('No authorization code received from Google')
                    setIsLoading(false)
                    return
                }

                console.log('Processing authorization code...')
                const result = await handleGoogleCallback(code)

                if (result.success) {
                    navigate('/', { replace: true })
                } else {
                    setError(result.error || 'Authentication failed')
                }
            } catch (err) {
                console.error('Google callback error:', err)
                setError('Authentication failed. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }

        handleCallback()
    }, [searchParams, handleGoogleCallback, navigate])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Completing Google authentication...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <p className="font-medium">Authentication Failed</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    return null
}

export default GoogleCallback