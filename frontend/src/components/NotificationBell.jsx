import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { notificationApi } from '../api/endpoints'
import { timeAgo } from '../utils/helpers'

const typeColor = {
  SECURITY: '#fb7185',
  LOGIN: '#38bdf8',
  SHARE: '#a78bfa',
  EXPIRY: '#fbbf24',
  RISK: '#fb923c',
  SYSTEM: '#2dd4bf',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const load = async () => {
    try {
      const [{ data }, { data: c }] = await Promise.all([
        notificationApi.list(),
        notificationApi.unreadCount(),
      ])
      setItems(data)
      setUnread(c.count)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const markAll = async () => {
    await notificationApi.readAll()
    load()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 hover:bg-white/[0.08] transition"
      >
        <Icon name="bell" size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-aurora-rose px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="glass absolute right-0 mt-2 w-80 p-2 z-50 animate-fade-up">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-aurora-cyan hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-slate-500">No notifications yet</p>
            )}
            {items.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 rounded-xl px-2.5 py-2.5 ${
                  n.read ? 'opacity-60' : 'bg-white/[0.03]'
                }`}
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: typeColor[n.type] || '#94a3b8' }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100">{n.title}</div>
                  <div className="text-xs text-slate-400">{n.body}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
