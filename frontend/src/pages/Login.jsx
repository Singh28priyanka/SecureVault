import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AuthShell from './AuthShell'
import Icon from '../components/Icon'
import { login, clearError } from '../store/slices/authSlice'

export default function Login() {
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.auth)
  const mfaStage = status === 'mfa'

  const [form, setForm] = useState({ usernameOrEmail: '', password: '', mfaCode: '' })
  const [showPwd, setShowPwd] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    dispatch(login(form))
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <AuthShell>
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-400">
          {mfaStage ? 'Enter the 6-digit code from your authenticator app.' : 'Sign in to your encrypted vault.'}
        </p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-aurora-rose/30 bg-aurora-rose/10 px-3.5 py-2.5 text-sm text-aurora-rose">
            <Icon name="alert" size={16} />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {!mfaStage ? (
            <>
              <div>
                <label className="label">Username or email</label>
                <input
                  className="input"
                  autoFocus
                  placeholder="demo@securevault.io"
                  value={form.usernameOrEmail}
                  onChange={set('usernameOrEmail')}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input pr-11"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <Icon name={showPwd ? 'eyeOff' : 'eye'} size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="label">Authentication code</label>
              <input
                className="input text-center text-2xl font-mono tracking-[0.5em]"
                autoFocus
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={form.mfaCode}
                onChange={set('mfaCode')}
                required
              />
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
            {status === 'loading' ? (
              'Please wait…'
            ) : mfaStage ? (
              <>
                <Icon name="shield" size={18} /> Verify &amp; continue
              </>
            ) : (
              <>
                <Icon name="lock" size={18} /> Sign in
              </>
            )}
          </button>

          {mfaStage && (
            <button
              type="button"
              onClick={() => dispatch(clearError())}
              className="btn-ghost w-full"
            >
              Back
            </button>
          )}
        </form>

        {!mfaStage && (
          <>
            <p className="mt-6 text-center text-sm text-slate-400">
              No account?{' '}
              <Link to="/register" className="font-semibold text-aurora-cyan hover:underline">
                Create one
              </Link>
            </p>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-xs text-slate-400">
              <div className="mb-1 font-semibold text-slate-300">Demo account</div>
              <code className="font-mono text-aurora-teal">demo@securevault.io</code> ·{' '}
              <code className="font-mono text-aurora-teal">Demo@12345</code>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  )
}
