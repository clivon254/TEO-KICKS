import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'


const AddRole = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', description: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((p) => ({ ...p, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return
        setIsSubmitting(true)
        try {
            await api.post('/roles', { name: form.name, description: form.description })
            navigate('/roles')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow border border-gray-200">
                <h1 className="title2 mb-4">Add Role</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. manager" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" rows={3} placeholder="What can this role do?" />
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Role'}</button>
                        <button type="button" onClick={() => navigate('/roles')} className="btn-outline">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default AddRole 

