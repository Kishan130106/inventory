// pages/transfers/TransferForm.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, ArrowRight } from 'lucide-react'
import { createTransfer } from '../../api/transfers'
import PageHeader from '../../components/layout/PageHeader'
import ProductSelector from '../../components/shared/ProductSelector'
import LocationSelector from '../../components/shared/LocationSelector'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function TransferForm() {
  const navigate = useNavigate()
  const [srcLoc, setSrc]    = useState(null)
  const [dstLoc, setDst]    = useState(null)
  const [notes, setNotes]   = useState('')
  const [items, setItems]   = useState([{ product_id: null, quantity: 1 }])
  const [saving, setSaving] = useState(false)

  const updateItem = (i, key, val) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validItems = items.filter((i) => i.product_id && i.quantity > 0)
    if (!validItems.length) return toast.error('Add at least one product')
    if (!srcLoc) return toast.error('Select a source location')
    if (!dstLoc) return toast.error('Select a destination location')
    if (srcLoc === dstLoc) return toast.error('Source and destination cannot be the same')
    setSaving(true)
    try {
      const { data } = await createTransfer({ source_location: srcLoc, destination_location: dstLoc, notes, items: validItems })
      toast.success('Transfer created')
      navigate(`/transfers/${data.transfer.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create transfer')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/transfers')} className="btn-ghost"><ArrowLeft size={15} /></button>
        <PageHeader title="New Transfer" subtitle="Move stock between locations" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-5 space-y-4">
          <h3 className="font-display font-bold text-sm dark:text-white light:text-light-text tracking-wide">Route</h3>
          <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
            <div>
              <label className="input-label">From *</label>
              <LocationSelector value={srcLoc} onChange={setSrc} placeholder="Source location" />
            </div>
            <div className="mb-2.5"><ArrowRight size={18} className="text-gold-500" /></div>
            <div>
              <label className="input-label">To *</label>
              <LocationSelector value={dstLoc} onChange={setDst} placeholder="Destination location" />
            </div>
          </div>
          <div>
            <label className="input-label">Notes (Optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for transfer..." className="input" />
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm dark:text-white light:text-light-text tracking-wide">Products</h3>
            <button type="button" onClick={() => setItems((p) => [...p, { product_id: null, quantity: 1 }])} className="btn-ghost text-xs">
              <Plus size={13} /> Add Line
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex items-end gap-2 p-3 rounded-lg dark:bg-dark-surface light:bg-light-surface border dark:border-dark-border light:border-light-border">
              <div className="flex-1">
                <label className="input-label">Product</label>
                <ProductSelector value={item.product_id} onChange={(id) => updateItem(i, 'product_id', id)} placeholder="Search product..." />
              </div>
              <div className="w-24">
                <label className="input-label">Qty</label>
                <input type="number" min={1} value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                  className="input font-mono text-center" />
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mb-0.5">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/transfers')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner size="sm" /> : <Save size={14} />}
            {saving ? 'Creating...' : 'Create Transfer'}
          </button>
        </div>
      </form>
    </div>
  )
}
