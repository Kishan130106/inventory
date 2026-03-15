// pages/deliveries/DeliveryDetailPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, ArrowUpFromLine } from 'lucide-react'
import { getDeliveryById, validateDelivery, cancelDelivery } from '../../api/deliveries'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { formatQty } from '../../utils/formatNumber'
import { formatDateTime } from '../../utils/formatDate'
import toast from 'react-hot-toast'

export default function DeliveryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState(null)
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [validateOpen, setValidateOpen] = useState(false)
  const [cancelOpen, setCancelOpen]     = useState(false)

  const load = () => {
    getDeliveryById(id)
      .then(({ data }) => { setDelivery(data.delivery); setItems(data.items) })
      .catch(() => toast.error('Delivery not found'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleValidate = async () => {
    try { await validateDelivery(id); toast.success('Delivery validated — stock deducted'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Validation failed') }
  }
  const handleCancel = async () => {
    try { await cancelDelivery(id); toast.success('Delivery cancelled'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Cancel failed') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!delivery) return null

  const canAct = !['done','cancelled'].includes(delivery.status)

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/deliveries')} className="btn-ghost dark:text-dark-sub light:text-light-sub">
          <ArrowLeft size={15} /> Back
        </button>
        {canAct && (
          <div className="flex gap-2">
            <button onClick={() => setCancelOpen(true)} className="btn-danger"><XCircle size={14} /> Cancel</button>
            <button onClick={() => setValidateOpen(true)} className="btn-primary"><CheckCircle size={14} /> Validate</button>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20
                          flex items-center justify-center shrink-0">
            <ArrowUpFromLine size={20} className="text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl dark:text-white light:text-light-text">
                Delivery #{delivery.id}
              </h2>
              <Badge status={delivery.status} />
            </div>
            <div className="flex flex-wrap gap-5 mt-3">
              {[
                { label: 'Customer',    val: delivery.customer || '—' },
                { label: 'From',        val: delivery.source_location_name || '—' },
                { label: 'Created By',  val: delivery.created_by_name || '—' },
                { label: 'Created',     val: formatDateTime(delivery.created_at) },
                ...(delivery.validated_at ? [{ label: 'Validated', val: formatDateTime(delivery.validated_at) }] : []),
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs dark:text-dark-dim light:text-light-dim uppercase tracking-wider font-mono">{item.label}</p>
                  <p className="text-sm font-medium dark:text-dark-text light:text-light-text mt-0.5">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b dark:border-dark-border light:border-light-border">
          <h3 className="font-display font-bold text-sm dark:text-white light:text-light-text tracking-wide">Line Items</h3>
        </div>
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between px-5 py-4
                                        border-b dark:border-dark-border/50 light:border-light-border last:border-0">
            <div>
              <p className="text-sm font-semibold dark:text-dark-text light:text-light-text">{item.product_name}</p>
              <p className="text-xs font-mono dark:text-dark-dim light:text-light-dim mt-0.5">{item.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold dark:text-white light:text-light-text">{formatQty(item.quantity)}</p>
              <p className="text-xs dark:text-dark-dim light:text-light-dim">{item.unit}</p>
            </div>
          </div>
        ))}
        <div className="flex justify-between px-5 py-3 dark:bg-dark-surface light:bg-light-surface">
          <span className="text-sm font-semibold dark:text-dark-sub light:text-light-sub">Total Items</span>
          <span className="font-mono font-bold text-gold-500">{items.length} line(s)</span>
        </div>
      </div>

      <ConfirmDialog open={validateOpen} onClose={() => setValidateOpen(false)} onConfirm={handleValidate}
        title="Validate Delivery"
        message={`Validate Delivery #${id}? Stock at "${delivery.source_location_name}" will be reduced for all ${items.length} item(s).`}
        confirmLabel="Validate" />
      <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleCancel}
        title="Cancel Delivery" message="Cancel this delivery? This cannot be undone."
        confirmLabel="Cancel Delivery" danger />
    </div>
  )
}
