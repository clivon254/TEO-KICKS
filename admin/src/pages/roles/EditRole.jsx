import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'


const EditRole = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', description: '', isActive: true })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await api.get(`/roles/${id}`)
                const role = res.data?.data?.role
                setForm({ name: role?.name || '', description: role?.description || '', isActive: !!role?.isActive })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put(`/roles/${id}`, { name: form.name, description: form.description, isActive: form.isActive })
            navigate('/roles')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-4">
                <div className="min-h-[200px] flex items-center justify-center">Loading...</div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
                <h1 className="title2 mb-4">Edit Role</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input name="name" value={form.name} onChange={handleChange} className="input mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" rows={3} />
                    </div>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                        <span>Active</span>
                    </label>
                    <div className="pt-2">
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default EditRole 

