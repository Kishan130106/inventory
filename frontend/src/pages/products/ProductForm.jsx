// pages/products/ProductForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { createProduct, updateProduct, getProductById } from '../../api/products'
import { getCategories, getLocations } from '../../api/settings'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const UNITS = ['pieces', 'kg', 'grams', 'litres', 'ml', 'pairs', 'sets', 'boxes', 'rolls']
const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Volleyball', 'Athletics', 'General']

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', sku: '', sport_type: '', category_id: '',
    unit: 'pieces', reorder_level: 5,
    initial_stock: '', location_id: '',
  })
  const [categories, setCategories] = useState([])
  const [locations, setLocations]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    Promise.all([
      getCategories().then(({ data }) => setCategories(data.categories || [])),
      getLocations().then(({ data }) => setLocations(data.locations || [])),
    ])
    if (isEdit) {
      setLoading(true)
      getProductById(id)
        .then(({ data }) => {
          const p = data.product
          setForm({ name: p.name, sku: p.sku, sport_type: p.sport_type || '',
            category_id: p.category_id || '', unit: p.unit, reorder_level: p.reorder_level,
            initial_stock: '', location_id: '' })
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await updateProduct(id, form)
        toast.success('Product updated')
        navigate(`/products/${id}`)
      } else {
        const { data } = await createProduct({
          ...form,
          category_id:   form.category_id   || undefined,
          initial_stock: form.initial_stock  ? parseInt(form.initial_stock) : undefined,
          location_id:   form.location_id    || undefined,
        })
        toast.success('Product created')
        navigate(`/products/${data.product.id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(isEdit ? `/products/${id}` : '/products')} className="btn-ghost">
          <ArrowLeft size={15} />
        </button>
        <PageHeader
          title={isEdit ? 'Edit Product' : 'New Product'}
          subtitle={isEdit ? 'Update product details' : 'Add to your catalog'}
        />
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Name + SKU */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Product Name *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Cricket Bat SH" className="input" required />
          </div>
          <div>
            <label className="input-label">SKU / Code *</label>
            <input value={form.sku} onChange={(e) => set('sku', e.target.value.toUpperCase())}
              placeholder="e.g. CB-SH-001" className="input font-mono" required />
          </div>
        </div>

        {/* Category + Sport */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Category</label>
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="input">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Sport Type</label>
            <select value={form.sport_type} onChange={(e) => set('sport_type', e.target.value)} className="input">
              <option value="">Select sport</option>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Unit + Reorder */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Unit of Measure</label>
            <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className="input">
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Reorder Level</label>
            <input type="number" min={0} value={form.reorder_level}
              onChange={(e) => set('reorder_level', parseInt(e.target.value) || 0)}
              className="input font-mono" />
          </div>
        </div>

        {/* Initial stock — create only */}
        {!isEdit && (
          <div className="p-4 rounded-lg border border-dashed dark:border-dark-muted light:border-light-muted space-y-4">
            <p className="text-xs font-semibold dark:text-dark-dim light:text-light-dim uppercase tracking-wider">
              Initial Stock (Optional)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Quantity</label>
                <input type="number" min={0} value={form.initial_stock}
                  onChange={(e) => set('initial_stock', e.target.value)}
                  placeholder="0" className="input font-mono" />
              </div>
              <div>
                <label className="input-label">Location</label>
                <select value={form.location_id} onChange={(e) => set('location_id', e.target.value)} className="input">
                  <option value="">Select location</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(isEdit ? `/products/${id}` : '/products')}
            className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner size="sm" /> : <Save size={14} />}
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
