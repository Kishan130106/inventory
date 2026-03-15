// pages/adjustments/AdjustmentForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import { createAdjustment } from '../../api/adjustments'
import PageHeader from '../../components/layout/PageHeader'
import ProductSelector from '../../components/shared/ProductSelector'
import LocationSelector from '../../components/shared/LocationSelector'
import Spinner from '../../components/ui/Spinner'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdjustmentForm() {
  const navigate = useNavigate()
  const [productId, setProductId]   = useState(null)
  const [locationId, setLocationId] = useState(null)
  const [counted, setCounted]       = useState('')
  const [reason, setReason]         = useState('')
  const [systemQty, setSystemQty]   = useState(null)
  const [loadingQty, setLoadingQty] = useState(false)
  const [saving, setSaving]         = useState(false)

  // Fetch current system quantity whenever product + location both selected
  useEffect(() => {
    if (!productId || !locationId) { setSystemQty(null); return }
    setLoadingQty(true)
    api.get(`/products/${productId}`)
      .then(({ data }) => {
        const s = data.stock?.find((s) => s.location_id === locationId)
        setSystemQty(s?.quantity ?? 0)
      })
      .catch(() => setSystemQty(0))
      .finally(() => setLoadingQty(false))
  }, [productId, locationId])

  const difference = systemQty !== null && counted !== '' ? parseInt(counted) - systemQty : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!productId)   return toast.error('Select a product')
    if (!locationId)  return toast.error('Select a location')
    if (counted === '') return toast.error('Enter counted quantity')
    setSaving(true)
    try {
      await createAdjustment({ product_id: productId, location_id: locationId, counted_quantity: parseInt(counted), reason })
      toast.success(`Adjustment saved. Difference: ${difference >= 0 ? '+' : ''}${difference}`)
      navigate('/adjustments')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save adjustment')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/adjustments')} className="btn-ghost"><ArrowLeft size={15} /></button>
        <PageHeader title="New Adjustment" subtitle="Reconcile physical count with system" />
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="input-label">Product *</label>
          <ProductSelector value={productId} onChange={(id) => { setProductId(id); setCounted('') }} placeholder="Search product..." />
        </div>
        <div>
          <label className="input-label">Location *</label>
          <LocationSelector value={locationId} onChange={(id) => { setLocationId(id); setCounted('') }} placeholder="Select location..." />
        </div>

        {/* System quantity display */}
        {productId && locationId && (
          <div className="flex items-center justify-between p-3 rounded-lg dark:bg-dark-surface light:bg-light-surface border dark:border-dark-border light:border-light-border">
            <span className="text-sm dark:text-dark-sub light:text-light-sub">System quantity</span>
            {loadingQty ? <Spinner size="sm" /> : (
              <span className="font-mono font-bold dark:text-white light:text-light-text">{systemQty}</span>
            )}
          </div>
        )}

        <div>
          <label className="input-label">Physical Count *</label>
          <input type="number" min={0} value={counted}
            onChange={(e) => setCounted(e.target.value)}
            placeholder="Enter actual counted quantity"
            className="input font-mono text-lg" />
        </div>

        {/* Difference preview */}
        {difference !== null && (
          <div className={`flex items-center gap-3 p-3 rounded-lg border
            ${difference === 0
              ? 'dark:bg-dark-surface light:bg-light-surface dark:border-dark-border light:border-light-border'
              : difference > 0
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
            <AlertTriangle size={15} className={difference === 0 ? 'dark:text-dark-dim light:text-light-dim' : difference > 0 ? 'text-green-400' : 'text-red-400'} />
            <span className="text-sm dark:text-dark-text light:text-light-text">
              Difference:{' '}
              <span className={`font-mono font-bold ${difference === 0 ? '' : difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {difference > 0 ? '+' : ''}{difference}
              </span>
              {difference === 0 && ' — no change needed'}
            </span>
          </div>
        )}

        <div>
          <label className="input-label">Reason</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Damaged goods, miscounted, theft..."
            className="input" />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={() => navigate('/adjustments')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner size="sm" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Adjustment'}
          </button>
        </div>
      </form>
    </div>
  )
}
