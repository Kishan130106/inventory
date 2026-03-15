// layouts/AuthLayout.jsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-light-surface dark:bg-dark-surface" />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(200,168,75,0.08) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#c8a84b 1px, transparent 1px), linear-gradient(90deg, #c8a84b 1px, transparent 1px)', backgroundSize: '52px 52px' }} />

        {/* Top — logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1a4b8c]/20 dark:border-gold-500/30 shadow-lg">
            <img src="/logo.png" alt="PSG Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-light-text dark:text-white leading-none">
              Patel Sports & Goods
            </p>
            <p className="text-[11px] text-light-sub dark:text-dark-sub font-mono mt-0.5">
              Inventory System
            </p>
          </div>
        </div>

        {/* Middle — headline */}
        <div className="relative z-10">
          <p className="text-xs font-mono text-light-dim dark:text-dark-dim tracking-[0.25em] uppercase mb-5">
            Since 1987 · Ahmedabad
          </p>
          <h1 className="font-display font-black text-5xl leading-[1.1] tracking-tight mb-6
                         text-light-text dark:text-white">
            Centralize.<br />
            <span className="text-gold-500">Track.</span><br />
            Deliver.
          </h1>
          <p className="text-light-sub dark:text-dark-sub text-sm leading-relaxed max-w-xs">
            One platform for all your sports goods inventory — receipts, deliveries, transfers and adjustments across every warehouse.
          </p>
        </div>

        {/* Bottom — stats */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { num: '4+',   label: 'Warehouses'    },
            { num: '∞',    label: 'Products'      },
            { num: '100%', label: 'Accuracy'      },
            { num: 'Live', label: 'Stock Updates' },
          ].map((s) => (
            <div key={s.label}
              className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border
                         rounded-xl px-3 py-2.5">
              <p className="font-display font-bold text-lg text-gold-500 leading-none">{s.num}</p>
              <p className="text-xs text-light-dim dark:text-dark-dim mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1a4b8c]/20 dark:border-gold-500/30">
              <img src="/logo.png" alt="PSG Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-light-text dark:text-white leading-none">
                Patel Sports & Goods
              </p>
              <p className="text-[10px] text-light-sub dark:text-dark-sub font-mono mt-0.5">
                Inventory System
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}