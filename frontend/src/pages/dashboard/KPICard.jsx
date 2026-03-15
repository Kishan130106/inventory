// pages/dashboard/KPICard.jsx
import Spinner from '../../components/ui/Spinner'

const ACCENTS = {
  default: { border: 'dark:border-dark-border light:border-light-border',  icon: 'dark:text-dark-sub light:text-light-sub',   val: 'dark:text-white light:text-light-text' },
  gold:    { border: 'border-gold-500/20',   icon: 'text-gold-500',    val: 'text-gold-500'    },
  red:     { border: 'border-red-500/20',    icon: 'text-red-400',     val: 'text-red-400'     },
  amber:   { border: 'border-amber-500/20',  icon: 'text-amber-400',   val: 'text-amber-400'   },
  blue:    { border: 'border-blue-500/20',   icon: 'text-blue-400',    val: 'text-blue-400'    },
  green:   { border: 'border-green-500/20',  icon: 'text-green-400',   val: 'text-green-400'   },
}

export default function KPICard({ label, value, icon: Icon, accent = 'default', loading, note }) {
  const a = ACCENTS[accent] || ACCENTS.default

  return (
    <div className={`card border ${a.border} p-5 flex flex-col gap-3
                     animate-fade-up opacity-0-init`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono font-medium tracking-wider uppercase
                      dark:text-dark-dim light:text-light-dim">{label}</p>
        <Icon size={15} className={a.icon} />
      </div>

      {loading ? (
        <Spinner size="sm" />
      ) : (
        <p className={`font-display font-bold text-3xl leading-none ${a.val}`}>
          {value ?? '—'}
        </p>
      )}

      {note && (
        <p className="text-xs dark:text-dark-dim light:text-light-dim">{note}</p>
      )}
    </div>
  )
}
