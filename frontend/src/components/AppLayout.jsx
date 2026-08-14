import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import NotificationBell from './NotificationBell'
import Logo from './Logo'
import Icon from './Icon'

const TITLES = {
  '/': { title: 'Dashboard', sub: 'Your password health & security at a glance' },
  '/vault': { title: 'Password Vault', sub: 'Encrypted credentials, organised' },
  '/generator': { title: 'Password Generator', sub: 'Create strong, unique passwords' },
  '/sharing': { title: 'Secure Sharing', sub: 'Share credentials with fine-grained control' },
  '/security': { title: 'Security Center', sub: 'Alerts, login activity & devices' },
  '/audit': { title: 'Audit Log', sub: 'A complete trail of account activity' },
  '/settings': { title: 'Settings', sub: 'Account, MFA & preferences' },
  '/admin': { title: 'Admin Console', sub: 'Platform-wide security & user management' },
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const meta = TITLES[pathname] || { title: 'SecureVault', sub: '' }

  return (
    <div className="relative min-h-screen bg-aurora-radial">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 hidden lg:block border-r border-white/[0.05] bg-ink-900/40 backdrop-blur-xl">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 bg-ink-900/95 backdrop-blur-xl border-r border-white/10">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/[0.05] bg-ink-950/60 backdrop-blur-xl px-5 py-3.5">
          <button
            className="lg:hidden text-slate-300"
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="dashboard" size={22} />
          </button>
          <div className="lg:hidden">
            <Logo withText={false} size={32} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-white leading-tight">{meta.title}</h1>
            <p className="text-xs text-slate-500">{meta.sub}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <main className="p-5 sm:p-7 max-w-7xl mx-auto animate-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
