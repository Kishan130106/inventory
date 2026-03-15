// pages/products/ProductDetailPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Package } from 'lucide-react'
import { getProductById, deleteProduct } from '../../api/products'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { formatQty } from '../../utils/formatNumber'
import { formatDateTime } from '../../utils/formatDate'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [stock, setStock]     = useState([])
  const [loading, setLoading] = useState(true)
  const [delOpen, setDelOpen] = useState(false)

  useEffect(() => {
    getProductById(id)
      .then(({ data }) => { setProduct(data.product); setStock(data.stock) })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      navigate('/products')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!product) return null

  const totalStock = stock.reduce((s, r) => s + (r.quantity || 0), 0)
  const stockStatus = totalStock <= 0 ? 'out_of_stock' : totalStock <= product.reorder_level ? 'low_stock' : 'in_stock'

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/products')}
          className="btn-ghost dark:text-dark-sub light:text-light-sub">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-secondary">
            <Edit size={14} /> Edit
          </button>
          <button onClick={() => setDelOpen(true)} className="btn-danger">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20
                          flex items-center justify-center shrink-0">
            <Package size={22} className="text-gold-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-xl dark:text-white light:text-light-text">
                  {product.name}
                </h2>
                <p className="font-mono text-sm dark:text-dark-dim light:text-light-dim mt-0.5">
                  {product.sku}
                </p>
              </div>
              <Badge status={stockStatus} />
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {[
                { label: 'Category',    val: product.category_name || '—' },
                { label: 'Sport',       val: product.sport_type || '—'    },
                { label: 'Unit',        val: product.unit                  },
                { label: 'Reorder At',  val: `${product.reorder_level} ${product.unit}` },
                { label: 'Created',     val: formatDateTime(product.created_at) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs dark:text-dark-dim light:text-light-dim uppercase tracking-wider font-mono">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium dark:text-dark-text light:text-light-text mt-0.5">
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stock per location */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b dark:border-dark-border light:border-light-border flex justify-between items-center">
          <h3 className="font-display font-bold text-sm dark:text-white light:text-light-text tracking-wide">
            Stock by Location
          </h3>
          <span className="font-mono font-bold text-gold-500 text-sm">
            Total: {formatQty(totalStock)} {product.unit}
          </span>
        </div>

        {stock.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm dark:text-dark-dim light:text-light-dim">
            No stock recorded at any location
          </p>
        ) : (
          <div>
            {stock.map((s) => {
              const pct = totalStock > 0 ? Math.round((s.quantity / totalStock) * 100) : 0
              return (
                <div key={s.location_id}
                  className="flex items-center gap-4 px-5 py-4
                             border-b dark:border-dark-border/50 light:border-light-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dark:text-dark-text light:text-light-text">
                      {s.location_name}
                    </p>
                    <p className="text-xs dark:text-dark-dim light:text-light-dim capitalize mt-0.5">
                      {s.location_type}
                    </p>
                    <div className="mt-2 h-1.5 dark:bg-dark-muted light:bg-light-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gold-500 rounded-full transition-all duration-500"
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold dark:text-white light:text-light-text">
                      {formatQty(s.quantity)}
                    </p>
                    <p className="text-xs dark:text-dark-dim light:text-light-dim">{pct}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={delOpen} onClose={() => setDelOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
        confirmLabel="Delete" danger
      />
    </div>
  )
}
