import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Icon from './Icon'
import Logo from './Logo'
import { logout } from '../store/slices/authSlice'
import { initials } from '../utils/helpers'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/vault', label: 'Vault', icon: 'vault' },
  { to: '/generator', label: 'Generator', icon: 'key' },
  { to: '/sharing', label: 'Sharing', icon: 'share' },
  { to: '/security', label: 'Security', icon: 'shield' },
  { to: '/audit', label: 'Audit Log', icon: 'activity' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ onNavigate }) {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  return (
    <aside className="flex h-full w-64 flex-col gap-6 p-4">
      <div className="px-2 pt-2">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <Icon name="users" size={18} />
            Admin
            <span className="chip ml-auto bg-aurora-amber/15 text-aurora-amber">ADMIN</span>
          </NavLink>
        )}
      </nav>

      <div className="glass p-3 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-ink-950 text-sm font-bold shrink-0">
          {initials(user?.fullName || user?.username || 'U')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">
            {user?.fullName || user?.username}
          </div>
          <div className="truncate text-xs text-slate-500">{user?.email}</div>
        </div>
        <button
          onClick={() => dispatch(logout())}
          title="Sign out"
          className="text-slate-500 hover:text-aurora-rose transition"
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </aside>
  )
}
