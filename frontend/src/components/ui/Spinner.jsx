// components/ui/Spinner.jsx
export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={`${sizes[size]} ${className} relative`}>
      <div className="absolute inset-0 rounded-full dark:border-dark-border light:border-light-border border-2" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold-500 animate-spin" />
    </div>
  )
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen dark:bg-dark-bg light:bg-light-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="dark:text-dark-dim light:text-light-dim text-sm font-mono tracking-wider">Loading...</p>
      </div>
    </div>
  )
}
