import { useState, useEffect } from 'react'
import { getLocations } from '../../api/settings'
import { MapPin, ChevronDown } from 'lucide-react'
export default function LocationSelector({ value, onChange, placeholder = 'Select location...' }) {
  const [locations, setLocations] = useState([])
  const [open, setOpen]           = useState(false)
  useEffect(() => {
    getLocations().then(({ data }) => setLocations(data.locations || [])).catch(() => {})
  }, [])
  const selected = locations.find((l) => l.id === value)
  return (
    <div className="relative">
      <div className="input flex items-center gap-2 cursor-pointer justify-between" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="dark:text-dark-dim light:text-light-dim shrink-0" />
          <span className={`text-sm ${selected ? 'dark:text-dark-text light:text-light-text' : 'dark:text-dark-dim light:text-light-dim'}`}>
            {selected ? selected.name : placeholder}
          </span>
        </div>
        <ChevronDown size={13} className="dark:text-dark-dim light:text-light-dim" />
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-20 card shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
            {locations.map((l) => (
              <button key={l.id} onClick={() => { onChange(l.id, l); setOpen(false) }}
                className="w-full text-left px-3 py-2.5 text-sm dark:hover:bg-dark-surface light:hover:bg-light-surface transition-colors">
                <span className="dark:text-dark-text light:text-light-text font-medium">{l.name}</span>
                <span className="dark:text-dark-dim light:text-light-dim text-xs ml-2 capitalize">{l.type}</span>
              </button>
            ))}
            {!locations.length && <p className="px-3 py-3 text-sm dark:text-dark-dim light:text-light-dim">No locations found</p>}
          </div>
        </>
      )}
    </div>
  )
}
