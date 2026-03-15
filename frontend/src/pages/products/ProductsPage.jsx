// pages/products/ProductsPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { getProducts } from '../../api/products'
import { getCategories } from '../../api/settings'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/layout/PageHeader'
import { formatQty } from '../../utils/formatNumber'

export default function ProductsPage() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [categoryId, setCategoryId] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.categories || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    getProducts({ search, category_id: categoryId || undefined })
      .then(({ data }) => setProducts(data.products || []))
      .finally(() => setLoading(false))
  }, [search, categoryId])

  const columns = [
    { key: 'name', label: 'Product', render: (v, row) => (
      <div>
        <p className="font-semibold dark:text-white light:text-light-text">{v}</p>
        <p className="text-xs font-mono dark:text-dark-dim light:text-light-dim mt-0.5">{row.sku}</p>
      </div>
    )},
    { key: 'category_name', label: 'Category', render: (v) => v || '—' },
    { key: 'sport_type',    label: 'Sport',    render: (v) => v || '—' },
    { key: 'unit',          label: 'Unit' },
    { key: 'total_stock',   label: 'Stock', render: (v, row) => (
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold">{formatQty(v)}</span>
        <Badge status={v <= 0 ? 'out_of_stock' : v <= row.reorder_level ? 'low_stock' : 'in_stock'} />
      </div>
    )},
    { key: 'reorder_level', label: 'Reorder At', render: (v) => <span className="font-mono">{v}</span> },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="Products" subtitle="Sports equipment catalog"
        action={
          <button onClick={() => navigate('/products/new')} className="btn-primary">
            <Plus size={15} /> Add Product
          </button>
        }
      />
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-dark-dim light:text-light-dim" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or SKU..." className="input pl-9" />
        </div>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input w-44">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden">
        <Table columns={columns} data={products} loading={loading}
          emptyTitle="No products found" emptyMessage="Add your first product to get started."
          onRowClick={(row) => navigate(`/products/${row.id}`)} />
      </div>
    </div>
  )
}
