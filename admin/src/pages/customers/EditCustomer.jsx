import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetUserById, useUpdateUserStatus } from '../../hooks/useUsers'
import { useGetRoles } from '../../hooks/useRoles'


const EditCustomer = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data, isLoading } = useGetUserById(id)
    const updateUser = useUpdateUserStatus()
    const { data: rolesData } = useGetRoles({ limit: 100 })

    const user = data?.data?.user

    const [form, setForm] = useState({
        name: '',
        email: '',
        isActive: true,
        isVerified: false,
        roles: [],
    })

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                email: user.email || '',
                isActive: !!user.isActive,
                isVerified: !!user.isVerified,
                roles: (user.roles || []).map(r => r._id || r),
            })
        }
    }, [user])

    const handleToggle = (key) => {
        setForm(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const toggleRole = (roleId) => {
        setForm(prev => {
            const has = prev.roles.includes(roleId)
            return { ...prev, roles: has ? prev.roles.filter(r => r !== roleId) : [...prev.roles, roleId] }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await updateUser.mutateAsync({ userId: id, data: { isActive: form.isActive, roles: form.roles } })
        navigate('/customers')
    }

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="min-h-[200px] flex items-center justify-center">Loading...</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="p-4">
                <div className="min-h-[200px] flex items-center justify-center text-gray-500">User not found</div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
                <h1 className="title2 mb-4">Edit Customer</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input disabled value={form.name} className="input mt-1" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input disabled value={form.email} className="input mt-1" />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={form.isActive} onChange={() => handleToggle('isActive')} />
                            <span>Active</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                        <div className="flex flex-wrap gap-2">
                            {(rolesData?.data?.roles || []).map((role) => (
                                <label key={role._id} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.roles.includes(role._id)}
                                        onChange={() => toggleRole(role._id)}
                                    />
                                    <span>{role.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="btn-primary" disabled={updateUser.isPending}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default EditCustomer 

