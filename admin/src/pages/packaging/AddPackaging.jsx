import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePackaging } from '../../hooks/usePackaging'


const AddPackaging = () => {
  const navigate = useNavigate()
  const createMutation = useCreatePackaging()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [isDefault, setIsDefault] = useState(false)

  const isValid = name.trim().length > 0 && Number(price) >= 0

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    await createMutation.mutateAsync({ name, price: Number(price), isActive, isDefault })
    navigate('/packaging')
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Add Packaging</h1>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-6 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Standard, Gift, Premium" />
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
          <button type="submit" disabled={!isValid || createMutation.isPending} className="btn-primary">
            {createMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/packaging')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  )
}


export default AddPackaging


