import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import api from '../../utils/api'


const AddressAutocomplete = ({ userId, onSaved }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSuggestions = async (value) => {
    setQuery(value)
    if ((value || '').trim().length < 3) return
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${import.meta.env.VITE_LOCATIONIQ_TOKEN}&q=${encodeURIComponent(value)}&limit=5&countrycodes=ke`
      )
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const transformLocationIQ = (place) => ({
    name: place.address?.name || place.display_name,
    coordinates: {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    },
    regions: {
      country: place.address?.country || 'Kenya',
      locality: place.address?.city || place.address?.town || place.address?.village || null,
      plus_code: place.address?.postcode || null,
      political: place.address?.country || null,
      sublocality: place.address?.suburb || null,
      sublocality_level_1: place.address?.suburb || null,
      administrative_area_level_1: place.address?.county || null,
    },
    address: place.display_name,
    details: null,
    isDefault: false,
  })

  const handleSelectPlace = async (place) => {
    try {
      const payload = transformLocationIQ(place)
      const res = await api.post('/addresses', payload)
      const created = res?.data?.data?.address || res?.data
      // Clear local state BEFORE notifying parent (parent may unmount this component)
      setQuery('')
      setResults([])
      if (onSaved) onSaved(created)
    } catch (e) {
      // Keep silent fail-safe; parent handles toasts on onSaved success
      // Optionally, you could add error handling here if desired
      // console.error('Failed to save address from autocomplete:', e)
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search address..."
        value={query}
        onChange={(e) => fetchSuggestions(e.target.value)}
        className="input"
      />
      {loading && <div className="text-sm text-gray-500">Searching...</div>}
      {Array.isArray(results) && results.length > 0 ? (
        <ul className="border rounded-md divide-y">
          {results.map((place) => (
            <li
              key={place.place_id}
              className="p-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelectPlace(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      ) : (
        query.trim().length >= 3 && !loading && (
          <div className="border rounded-md p-6 flex items-center justify-center min-h-40">
            <div className="text-center">
              <div className="mx-auto mb-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600">
                <FiSearch className="w-5 h-5" />
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-gray-500">No results for</span> <span className="font-semibold">“{query}”</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Try a different spelling or another nearby place</div>
            </div>
          </div>
        )
      )}
    </div>
  )
}


export default AddressAutocomplete

