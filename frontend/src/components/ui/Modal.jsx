// components/ui/Modal.jsx
import { useEffect } from 'react'
import { X } from 'lucide-react'
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 dark:bg-dark-bg/80 light:bg-light-bg/80 backdrop-blur-sm animate-fade-in"
           onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} card shadow-2xl animate-fade-up`}>
        <div className="flex items-center justify-between px-5 py-4 divider border-b">
          <h3 className="font-display font-bold text-base dark:text-white light:text-light-text">{title}</h3>
          <button onClick={onClose}
            className="p-1 rounded dark:text-dark-dim light:text-light-dim
                       dark:hover:text-dark-text light:hover:text-light-text
                       dark:hover:bg-dark-muted light:hover:bg-light-muted transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
