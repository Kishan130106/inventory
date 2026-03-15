// pages/settings/SettingsPage.jsx
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Trash2, Edit, Check, X, MapPin, Tag, Users } from 'lucide-react'
import { getLocations, createLocation, updateLocation, deleteLocation,
         getCategories, createCategory, deleteCategory,
         getUsers, updateUserRole } from '../../api/settings'
import { selectUser } from '../../store/authSlice'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'locations',  label: 'Warehouses',  icon: MapPin },
  { id: 'categories', label: 'Categories',  icon: Tag    },
  { id: 'users',      label: 'Users',       icon: Users  },
]
const LOCATION_TYPES = ['warehouse', 'rack', 'court', 'floor', 'store']
const ROLES = ['admin', 'manager', 'staff']

export default function SettingsPage() {
  const [tab, setTab] = useState('locations')
  const me = useSelector(selectUser)

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Manage warehouses, categories and users" />
      <div className="flex gap-1 border-b dark:border-dark-border light:border-light-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all
              ${tab === id
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent dark:text-dark-sub light:text-light-sub dark:hover:text-dark-text light:hover:text-light-text'
              }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      <div>
        {tab === 'locations'  && <LocationsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'users'      && <UsersTab me={me} />}
      </div>
    </div>
  )
}

// ── Locations Tab ─────────────────────────────────────────────────────────
function LocationsTab() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading]     = useState(true)
  const [name, setName]           = useState('')
  const [type, setType]           = useState('warehouse')
  const [editId, setEditId]       = useState(null)
  const [editName, setEditName]   = useState('')
  const [delId, setDelId]         = useState(null)

  const load = () => getLocations().then(({ data }) => setLocations(data.locations || [])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try { await createLocation({ name: name.trim(), type }); toast.success('Location added'); setName(''); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to add location') }
  }

  const handleEdit = async (id) => {
    try { await updateLocation(id, { name: editName }); toast.success('Updated'); setEditId(null); load() }
    catch (err) { toast.error('Failed to update') }
  }

  const handleDelete = async () => {
    try { await deleteLocation(delId); toast.success('Location deleted'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Cannot delete') }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div className="space-y-4 max-w-lg">
      <form onSubmit={handleAdd} className="card p-4 flex gap-3 items-end">
        <div className="flex-1">
          <label className="input-label">Location Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Warehouse" className="input" required />
        </div>
        <div className="w-36">
          <label className="input-label">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input">
            {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary mb-0.5"><Plus size={14} /> Add</button>
      </form>

      <div className="card overflow-hidden">
        {locations.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm dark:text-dark-dim light:text-light-dim">No locations yet</p>
        ) : locations.map((loc) => (
          <div key={loc.id} className="flex items-center justify-between px-4 py-3
                                       border-b dark:border-dark-border/50 light:border-light-border last:border-0">
            {editId === loc.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="input text-sm py-1" autoFocus />
                <button onClick={() => handleEdit(loc.id)} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded"><Check size={14} /></button>
                <button onClick={() => setEditId(null)} className="p-1.5 dark:text-dark-dim light:text-light-dim hover:bg-dark-muted rounded"><X size={14} /></button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-semibold dark:text-dark-text light:text-light-text">{loc.name}</p>
                  <p className="text-xs dark:text-dark-dim light:text-light-dim capitalize">{loc.type} · {loc.product_count || 0} products</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditId(loc.id); setEditName(loc.name) }}
                    className="p-1.5 dark:text-dark-dim light:text-light-dim hover:text-gold-400 dark:hover:bg-dark-muted light:hover:bg-light-muted rounded transition-colors">
                    <Edit size={13} />
                  </button>
                  <button onClick={() => setDelId(loc.id)}
                    className="p-1.5 dark:text-dark-dim light:text-light-dim hover:text-red-400 dark:hover:bg-dark-muted light:hover:bg-light-muted rounded transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        title="Delete Location" message="Delete this location? Stock must be zero first." confirmLabel="Delete" danger />
    </div>
  )
}

// ── Categories Tab ────────────────────────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [name, setName]             = useState('')
  const [delId, setDelId]           = useState(null)

  const load = () => getCategories().then(({ data }) => setCategories(data.categories || [])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try { await createCategory({ name: name.trim() }); toast.success('Category added'); setName(''); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to add') }
  }

  const handleDelete = async () => {
    try { await deleteCategory(delId); toast.success('Category deleted'); load() }
    catch (err) { toast.error('Failed to delete') }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div className="space-y-4 max-w-sm">
      <form onSubmit={handleAdd} className="card p-4 flex gap-3 items-end">
        <div className="flex-1">
          <label className="input-label">Category Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cricket" className="input" required />
        </div>
        <button type="submit" className="btn-primary mb-0.5"><Plus size={14} /> Add</button>
      </form>
      <div className="card overflow-hidden">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3
                                       border-b dark:border-dark-border/50 light:border-light-border last:border-0">
            <p className="text-sm font-medium dark:text-dark-text light:text-light-text">{cat.name}</p>
            <button onClick={() => setDelId(cat.id)}
              className="p-1.5 dark:text-dark-dim light:text-light-dim hover:text-red-400 dark:hover:bg-dark-muted light:hover:bg-light-muted rounded transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        title="Delete Category" message="Delete this category? Products using it will be uncategorized." confirmLabel="Delete" danger />
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────
function UsersTab({ me }) {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => getUsers().then(({ data }) => setUsers(data.users || [])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleRoleChange = async (id, role) => {
    try { await updateUserRole(id, role); toast.success('Role updated'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to update role') }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div className="space-y-3 max-w-xl">
      <div className="card overflow-hidden">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between px-4 py-3
                                        border-b dark:border-dark-border/50 light:border-light-border last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20
                              flex items-center justify-center text-gold-500 text-xs font-bold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold dark:text-dark-text light:text-light-text">{user.name}</p>
                <p className="text-xs dark:text-dark-dim light:text-light-dim">{user.email}</p>
              </div>
            </div>
            {me?.role === 'admin' && user.id !== me?.id ? (
              <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="input w-28 text-xs py-1.5">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <Badge status={user.role} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
