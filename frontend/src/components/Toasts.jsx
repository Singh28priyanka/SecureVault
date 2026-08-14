import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { dismissToast } from '../store/slices/uiSlice'
import Icon from './Icon'

const styles = {
  success: { icon: 'check', color: '#2dd4bf', ring: 'rgba(45,212,191,0.3)' },
  error: { icon: 'alert', color: '#fb7185', ring: 'rgba(251,113,133,0.3)' },
  info: { icon: 'sparkle', color: '#38bdf8', ring: 'rgba(56,189,248,0.3)' },
}

function Toast({ toast }) {
  const dispatch = useDispatch()
  const s = styles[toast.type] || styles.info
  useEffect(() => {
    const t = setTimeout(() => dispatch(dismissToast(toast.id)), 3500)
    return () => clearTimeout(t)
  }, [toast.id, dispatch])

  return (
    <div
      className="glass animate-fade-up flex items-center gap-3 px-4 py-3 min-w-[260px] max-w-sm"
      style={{ boxShadow: `0 0 0 1px ${s.ring}, 0 20px 50px -24px rgba(0,0,0,0.7)` }}
    >
      <span
        className="grid place-items-center h-8 w-8 rounded-lg shrink-0"
        style={{ background: `${s.color}22`, color: s.color }}
      >
        <Icon name={s.icon} size={16} />
      </span>
      <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
      <button
        onClick={() => dispatch(dismissToast(toast.id))}
        className="text-slate-500 hover:text-slate-300"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  )
}

export default function Toasts() {
  const toasts = useSelector((s) => s.ui.toasts)
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  )
}
