// components/ui/EmptyState.jsx
import { PackageSearch } from 'lucide-react'
export default function EmptyState({ icon: Icon = PackageSearch, title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-xl dark:border-dark-border light:border-light-border border
                      dark:bg-dark-surface light:bg-light-surface
                      flex items-center justify-center mb-4">
        <Icon size={22} className="dark:text-dark-dim light:text-light-dim" />
      </div>
      <p className="font-display font-bold text-lg dark:text-dark-sub light:text-light-sub mb-1">{title}</p>
      {message && <p className="text-sm dark:text-dark-dim light:text-light-dim max-w-xs">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
