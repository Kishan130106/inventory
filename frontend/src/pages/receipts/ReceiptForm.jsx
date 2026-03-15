// pages/receipts/ReceiptForm.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { createReceipt } from '../../api/receipts'
import PageHeader from '../../components/layout/PageHeader'
import ProductSelector from '../../components/shared/ProductSelector'
import LocationSelector from '../../components/shared/LocationSelector'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const emptyItem = () => ({ product_id: null, product_name: '', quantity: 1 })

export default function ReceiptForm() {
  const navigate = useNavigate()
  const [supplier, setSupplier]             = useState('')
  const [destinationLocation, setDest]      = useState(null)
  const [items, setItems]                   = useState([emptyItem()])
  const [saving, setSaving]                 = useState(false)

  const updateItem = (i, key, val) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const addItem    = () => setItems((p) => [...p, emptyItem()])
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validItems = items.filter((i) => i.product_id && i.quantity > 0)
    if (!validItems.length) return toast.error('Add at least one product')
    if (!destinationLocation) return toast.error('Select a destination location')

    setSaving(true)
    try {
      const { data } = await createReceipt({
        supplier, destination_location: destinationLocation, items: validItems,
      })
      toast.success('Receipt created')
      navigate(`/receipts/${data.receipt.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create receipt')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/receipts')} className="btn-ghost"><ArrowLeft size={15} /></button>
        <PageHeader title="New Receipt" subtitle="Record incoming stock from supplier" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-5 space-y-4">
          <h3 className="font-display font-bold text-sm dark:text-white light:text-light-text tracking-wide">
            Receipt Details
          </h3>
          <div>
            <label className="input-label">Supplier Name</label>
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. MRF Sports, SS Cricket" className="input" />
          </div>
          <div>
            <label className="input-label">Destination Location *</label>
            <LocationSelector value={destinationLocation} onChange={setDest} placeholder="Where is stock arriving?" />
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm dark:text-white light:text-light-text tracking-wide">
              Products
            </h3>
            <button type="button" onClick={addItem} className="btn-ghost text-xs">
              <Plus size={13} /> Add Line
            </button>
          </div>

          {items.map((item, i) => (
            <div key={i} className="flex items-end gap-2 p-3 rounded-lg dark:bg-dark-surface light:bg-light-surface border dark:border-dark-border light:border-light-border">
              <div className="flex-1">
                <label className="input-label">Product</label>
                <ProductSelector
                  value={item.product_id}
                  onChange={(id, p) => { updateItem(i, 'product_id', id); updateItem(i, 'product_name', p?.name || '') }}
                  placeholder="Search product..."
                />
              </div>
              <div className="w-24">
                <label className="input-label">Qty</label>
                <input type="number" min={1} value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                  className="input font-mono text-center" />
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mb-0.5">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/receipts')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner size="sm" /> : <Save size={14} />}
            {saving ? 'Creating...' : 'Create Receipt'}
          </button>
        </div>
      </form>
    </div>
  )
}
