import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'


const ForgotPassword = () => {

  const { forgotPassword } = useAuth()

  const [email, setEmail] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [isSubmitted, setIsSubmitted] = useState(false)


  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await forgotPassword(email)
      if (result.success) setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-primary mb-2">Reset your password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your email address and we’ll send you a link to reset your password.</p>

        {isSubmitted ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
            Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>
        )}

        <div className="mt-4 text-sm">
          <Link to="/login" className="text-primary hover:text-secondary">Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}


export default ForgotPassword


