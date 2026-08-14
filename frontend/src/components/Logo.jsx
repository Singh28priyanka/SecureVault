import Icon from './Icon'

export default function Logo({ size = 36, withText = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid place-items-center rounded-xl bg-brand-gradient text-ink-950 shadow-glow shrink-0"
        style={{ width: size, height: size }}
      >
        <Icon name="shield" size={size * 0.56} strokeWidth={2.2} />
      </div>
      {withText && (
        <div className="leading-none">
          <div className="font-extrabold tracking-tight text-white text-[15px]">
            Secure<span className="brand-text">Vault</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">
            Credential Manager
          </div>
        </div>
      )}
    </div>
  )
}
