import Icon from './Icon'

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`glass glass-hover p-5 ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-aurora-cyan" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({ icon = 'sparkle', title, text, action }) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-slate-400">
        <Icon name={icon} size={26} />
      </div>
      <div>
        <div className="font-semibold text-white">{title}</div>
        {text && <div className="mt-1 text-sm text-slate-400 max-w-sm">{text}</div>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ icon, label, value, accent = '#22d3ee', hint }) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-40"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-extrabold text-white">{value}</div>
          {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
        <div
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon name={icon} size={20} />
        </div>
      </div>
    </Card>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">{children}</h3>
      {action}
    </div>
  )
}
