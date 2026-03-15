import Modal from '../ui/Modal'
import { AlertTriangle } from 'lucide-react'
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3 mb-5">
        <AlertTriangle size={18} className={danger ? 'text-red-400 shrink-0 mt-0.5' : 'text-amber-400 shrink-0 mt-0.5'} />
        <p className="text-sm dark:text-dark-text light:text-light-text">{message}</p>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => { onConfirm(); onClose() }} className={danger ? 'btn-danger' : 'btn-primary'}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}
