import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMe } from './store/slices/authSlice'
import { tokenStore } from './api/client'

import AppLayout from './components/AppLayout'
import Toasts from './components/Toasts'
import Icon from './components/Icon'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Vault from './pages/Vault'
import Generator from './pages/Generator'
import Sharing from './pages/Sharing'
import Security from './pages/Security'
import Audit from './pages/Audit'
import Settings from './pages/Settings'
import Admin from './pages/Admin'

function FullscreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-aurora-radial">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-ink-950 shadow-glow animate-floaty">
          <Icon name="shield" size={28} strokeWidth={2.2} />
        </div>
        <p className="text-sm">Securing your session…</p>
      </div>
    </div>
  )
}

function Protected({ children }) {
  const status = useSelector((s) => s.auth.status)
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { status, bootstrapped } = useSelector((s) => s.auth)

  useEffect(() => {
    if (tokenStore.access) dispatch(fetchMe())
  }, [dispatch])

  // Wait for the initial "who am I" check before routing when a page load
  // starts with a stored token. A fresh in-session login sets status directly,
  // so we let it through even though `bootstrapped` hasn't flipped.
  if (tokenStore.access && !bootstrapped && status !== 'authenticated')
    return <FullscreenLoader />

  const authed = status === 'authenticated'

  return (
    <>
      <Routes>
        <Route path="/login" element={authed ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={authed ? <Navigate to="/" replace /> : <Register />} />

        <Route
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/sharing" element={<Sharing />} />
          <Route path="/security" element={<Security />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to={authed ? '/' : '/login'} replace />} />
      </Routes>
      <Toasts />
    </>
  )
}
