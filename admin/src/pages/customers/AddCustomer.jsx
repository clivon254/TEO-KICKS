import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../../utils/api'


const AddCustomer = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', phone: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((p) => ({ ...p, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.phone) return
        setIsSubmitting(true)
        try {
            await userAPI.adminCreateCustomer({ name: form.name, email: form.email, phone: form.phone })
            navigate('/customers')
        } catch (err) {
            // errors are handled by interceptor/toasts upstream if any
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex  justify-center p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow border border-gray-200">
                <h1 className="title2 mb-4">Add Customer</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="input"
                            placeholder="Customer name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="input"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g. +2547XXXXXXXX"
                            required
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Customer'}
                        </button>
                        <button type="button" onClick={() => navigate('/customers')} className="btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default AddCustomer 

