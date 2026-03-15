// pages/ComingSoon.jsx
import { Construction } from 'lucide-react'

export default function ComingSoon({ name }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center">
      <div className="w-14 h-14 border border-ash-border bg-ash-light rounded
                      flex items-center justify-center mb-5">
        <Construction size={24} className="text-gold-500/60" />
      </div>
      <p className="font-display text-3xl tracking-wider text-carbon-300 mb-2">{name?.toUpperCase()}</p>
      <p className="text-sm text-carbon-600">This page will be built next.</p>
    </div>
  )
}
