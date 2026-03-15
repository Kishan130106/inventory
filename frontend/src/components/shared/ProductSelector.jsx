import { useState, useEffect } from 'react'
import { getProducts } from '../../api/products'
import { Search } from 'lucide-react'
export default function ProductSelector({ value, onChange, placeholder = 'Search product...' }) {
  const [products, setProducts] = useState([])
  const [search, setSearch]     = useState('')
  const [open, setOpen]         = useState(false)
  useEffect(() => {
    getProducts({ search }).then(({ data }) => setProducts(data.products || [])).catch(() => {})
  }, [search])
  const selected = products.find((p) => p.id === value)
  return (
    <div className="relative">
      <div className="input flex items-center gap-2 cursor-pointer" onClick={() => setOpen(!open)}>
        <Search size={14} className="dark:text-dark-dim light:text-light-dim shrink-0" />
        <span className={`text-sm ${selected ? 'dark:text-dark-text light:text-light-text' : 'dark:text-dark-dim light:text-light-dim'}`}>
          {selected ? `${selected.name} (${selected.sku})` : placeholder}
        </span>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-20 card shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
            <div className="p-2 border-b dark:border-dark-border light:border-light-border">
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="input text-xs py-1.5" onClick={(e) => e.stopPropagation()} />
            </div>
            {products.map((p) => (
              <button key={p.id} onClick={() => { onChange(p.id, p); setOpen(false); setSearch('') }}
                className="w-full text-left px-3 py-2.5 text-sm dark:hover:bg-dark-surface light:hover:bg-light-surface transition-colors">
                <span className="dark:text-dark-text light:text-light-text font-medium">{p.name}</span>
                <span className="dark:text-dark-dim light:text-light-dim text-xs ml-2 font-mono">{p.sku}</span>
              </button>
            ))}
            {!products.length && <p className="px-3 py-3 text-sm dark:text-dark-dim light:text-light-dim">No products found</p>}
          </div>
        </>
      )}
    </div>
  )
}
