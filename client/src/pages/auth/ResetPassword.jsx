import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'


const ResetPassword = () => {

  const { token } = useParams()

  const { resetPassword } = useAuth()

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })

  const [isLoading, setIsLoading] = useState(false)

  const [isSuccess, setIsSuccess] = useState(false)


  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (form.newPassword !== form.confirmPassword) {
        setIsLoading(false)
        return
      }
      const result = await resetPassword(token, form.newPassword)
      if (result.success) setIsSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-primary mb-2">Set a new password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter a strong password you haven’t used before on this site.</p>

        {isSuccess ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
              Your password has been reset successfully.
            </div>
            <Link className="btn-primary w-full inline-block text-center" to="/login">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={form.newPassword}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !form.newPassword || !form.confirmPassword || form.newPassword !== form.confirmPassword}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
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


export default ResetPassword


