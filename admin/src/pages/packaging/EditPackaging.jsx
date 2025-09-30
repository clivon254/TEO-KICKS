import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetPackagingById, useUpdatePackaging } from '../../hooks/usePackaging'


const EditPackaging = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading } = useGetPackagingById(id)
  const updateMutation = useUpdatePackaging()

  const record = data?.data?.data?.packaging || data?.data?.packaging

  const [name, setName] = useState('')
  const [price, setPrice] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    if (record) {
      setName(record.name || '')
      setPrice(String(record.price ?? '0'))
      setIsActive(Boolean(record.isActive))
      setIsDefault(Boolean(record.isDefault))
    }
  }, [record])

  const isValid = name.trim().length > 0 && Number(price) >= 0

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    await updateMutation.mutateAsync({ id, data: { name, price: Number(price), isActive, isDefault } })
    navigate('/packaging')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Packaging</h1>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-6 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input" />
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>Active</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} disabled={!isActive} />
            <span>Make standard</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={!isValid || updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/packaging')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  )
}


export default EditPackaging


