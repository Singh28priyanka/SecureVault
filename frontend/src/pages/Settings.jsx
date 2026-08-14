import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import { Card, SectionTitle } from '../components/ui'
import { authApi } from '../api/endpoints'
import { setUser } from '../store/slices/authSlice'
import { pushToast } from '../store/slices/uiSlice'
import { apiError } from '../api/client'
import { initials, formatDate } from '../utils/helpers'

export default function Settings() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const [setup, setSetup] = useState(null) // {secret, qrImageBase64}
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const beginSetup = async () => {
    try {
      const { data } = await authApi.mfaSetup()
      setSetup(data)
    } catch (err) {
      dispatch(pushToast(apiError(err), 'error'))
    }
  }

  const confirmEnable = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await authApi.mfaEnable(code)
      const { data } = await authApi.me()
      dispatch(setUser(data))
      dispatch(pushToast('MFA enabled — your account is now protected', 'success'))
      setSetup(null)
      setCode('')
    } catch (err) {
      dispatch(pushToast(apiError(err, 'Invalid code'), 'error'))
    } finally {
      setBusy(false)
    }
  }

  const disableMfa = async () => {
    if (!confirm('Disable two-factor authentication?')) return
    await authApi.mfaDisable()
    const { data } = await authApi.me()
    dispatch(setUser(data))
    dispatch(pushToast('MFA disabled', 'success'))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Profile */}
      <Card className="lg:col-span-1">
        <SectionTitle>Profile</SectionTitle>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-gradient text-2xl font-extrabold text-ink-950">
            {initials(user?.fullName || user?.username)}
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{user?.fullName || user?.username}</div>
            <div className="text-sm text-slate-400">{user?.email}</div>
          </div>
          <span className="chip bg-aurora-violet/15 text-aurora-violet">{user?.role}</span>
        </div>
        <div className="mt-2 space-y-2 text-sm">
          <Row label="Username" value={`@${user?.username}`} />
          <Row label="Member since" value={formatDate(user?.createdAt)} />
          <Row label="Last login" value={formatDate(user?.lastLoginAt)} />
        </div>
      </Card>

      {/* Security */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <SectionTitle>Two-Factor Authentication</SectionTitle>
          <div className="flex items-start gap-4">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${user?.mfaEnabled ? 'bg-aurora-teal/15 text-aurora-teal' : 'bg-white/[0.05] text-slate-400'}`}>
              <Icon name={user?.mfaEnabled ? 'lock' : 'shield'} size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Authenticator app (TOTP)</span>
                <span className={`chip ${user?.mfaEnabled ? 'bg-aurora-teal/15 text-aurora-teal' : 'bg-white/[0.05] text-slate-500'}`}>
                  {user?.mfaEnabled ? 'enabled' : 'disabled'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Add a second layer of protection using Google Authenticator, Authy or 1Password.
              </p>
              <div className="mt-3">
                {user?.mfaEnabled ? (
                  <button onClick={disableMfa} className="btn-danger">
                    <Icon name="x" size={16} /> Disable MFA
                  </button>
                ) : (
                  <button onClick={beginSetup} className="btn-primary">
                    <Icon name="shield" size={16} /> Enable MFA
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>Encryption</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Feature icon="lock" title="AES-256-GCM at rest" text="Every secret is sealed with authenticated encryption." />
            <Feature icon="key" title="BCrypt password hashing" text="Master passwords are hashed with a work factor of 12." />
            <Feature icon="shield" title="JWT sessions" text="Short-lived access tokens with silent refresh." />
            <Feature icon="activity" title="Full audit trail" text="Every access to a secret is logged and exportable." />
          </div>
        </Card>
      </div>

      {/* MFA setup modal */}
      <Modal open={Boolean(setup)} onClose={() => setSetup(null)} title="Set up two-factor authentication"
        subtitle="Scan the QR code, then enter the 6-digit code to confirm.">
        {setup && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <div className="rounded-2xl bg-white p-3">
                {setup.qrImageBase64 ? (
                  <img src={setup.qrImageBase64} alt="MFA QR code" className="h-44 w-44" />
                ) : (
                  <div className="grid h-44 w-44 place-items-center text-ink-900 text-xs">QR unavailable</div>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <div className="text-xs text-slate-500">Or enter this secret manually</div>
              <code className="mt-1 block break-all font-mono text-sm text-aurora-teal">{setup.secret}</code>
            </div>
            <form onSubmit={confirmEnable} className="space-y-3">
              <input
                className="input text-center text-2xl font-mono tracking-[0.5em]"
                inputMode="numeric" maxLength={6} placeholder="000000"
                value={code} onChange={(e) => setCode(e.target.value)} required
              />
              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? 'Verifying…' : 'Verify & enable'}
              </button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
    <span className="text-slate-500">{label}</span>
    <span className="text-slate-200">{value}</span>
  </div>
)

const Feature = ({ icon, title, text }) => (
  <div className="flex gap-3 rounded-xl bg-white/[0.02] p-3">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-aurora-cyan">
      <Icon name={icon} size={16} />
    </span>
    <div>
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="text-xs text-slate-500">{text}</div>
    </div>
  </div>
)
