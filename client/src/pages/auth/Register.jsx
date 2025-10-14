import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'


const Register = () => {

  const { register } = useAuth()

  const navigate = useNavigate()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' })

  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState('')


  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      }
      const result = await register(payload)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error || 'Registration failed')
      }
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-primary mb-2">Create your account</h1>
        <p className="text-sm text-gray-600 mb-6">Join TEO KICKS and start shopping your style.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input name="firstName" className="input" required value={form.firstName} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input name="lastName" className="input" required value={form.lastName} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" className="input" required value={form.email} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" className="input" required value={form.phone} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" className="input" required value={form.password} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input name="confirmPassword" type="password" className="input" required value={form.confirmPassword} onChange={handleChange} />
          </div>

          {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}

          <div className="md:col-span-2">
            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-center">
          <span>Already have an account? </span>
          <Link to="/login" className="text-primary hover:text-secondary">Sign in</Link>
        </div>
      </div>
    </div>
  )
}


export default Register


