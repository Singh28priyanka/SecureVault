import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import { Card, SectionTitle, EmptyState, Spinner } from '../components/ui'
import { shareApi, vaultApi } from '../api/endpoints'
import { pushToast } from '../store/slices/uiSlice'
import { apiError } from '../api/client'
import { typeMeta, formatDate, copyToClipboard } from '../utils/helpers'

const PERMISSIONS = [
  { value: 'VIEW_ONLY', label: 'View only', icon: 'eye' },
  { value: 'EDIT_ACCESS', label: 'Edit access', icon: 'edit' },
  { value: 'FULL_MANAGEMENT', label: 'Full control', icon: 'settings' },
]

export default function Sharing() {
  const dispatch = useDispatch()
  const [tab, setTab] = useState('with-me')
  const [withMe, setWithMe] = useState(null)
  const [byMe, setByMe] = useState(null)
  const [creds, setCreds] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ credentialId: '', recipientEmail: '', permission: 'VIEW_ONLY', expiresAt: '' })

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([shareApi.withMe(), shareApi.byMe()])
    setWithMe(a.data)
    setByMe(b.data)
  }, [])

  useEffect(() => {
    load()
    vaultApi.list().then(({ data }) => setCreds(data))
  }, [load])

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, credentialId: Number(form.credentialId) }
      if (!payload.expiresAt) delete payload.expiresAt
      else payload.expiresAt = new Date(payload.expiresAt).toISOString()
      await shareApi.share(payload)
      setModal(false)
      setForm({ credentialId: '', recipientEmail: '', permission: 'VIEW_ONLY', expiresAt: '' })
      dispatch(pushToast('Credential shared', 'success'))
      load()
    } catch (err) {
      dispatch(pushToast(apiError(err, 'Could not share'), 'error'))
    }
  }

  const revoke = async (id) => {
    await shareApi.revoke(id)
    dispatch(pushToast('Share revoked', 'success'))
    load()
  }

  const copySecret = async (secret) => {
    const ok = await copyToClipboard(secret)
    dispatch(pushToast(ok ? 'Copied' : 'Copy failed', ok ? 'success' : 'error'))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          {[
            ['with-me', 'Shared with me'],
            ['by-me', 'Shared by me'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === k ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Icon name="share" size={16} /> Share a credential
        </button>
      </div>

      {tab === 'with-me' &&
        (withMe === null ? (
          <Spinner />
        ) : withMe.length === 0 ? (
          <EmptyState icon="share" title="Nothing shared with you" text="Credentials others share with you will appear here." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {withMe.map((s) => {
              const meta = typeMeta(s.credential.type)
              return (
                <Card key={s.shareId}>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${meta.color}1f`, color: meta.color }}>
                      <Icon name={meta.icon} size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-semibold text-white">{s.title}</h4>
                      <p className="text-xs text-slate-500">from @{s.ownerUsername}</p>
                    </div>
                    <span className="chip bg-white/[0.05] text-slate-300">{s.permission.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-ink-900/60 px-3 py-2">
                    <code className="flex-1 truncate font-mono text-sm text-slate-300">
                      {s.credential.secret || '••••••••'}
                    </code>
                    <button onClick={() => copySecret(s.credential.secret)} className="text-slate-400 hover:text-aurora-teal">
                      <Icon name="copy" size={16} />
                    </button>
                  </div>
                  {s.expiresAt && (
                    <p className="mt-2 text-[11px] text-aurora-amber">Expires {formatDate(s.expiresAt)}</p>
                  )}
                </Card>
              )
            })}
          </div>
        ))}

      {tab === 'by-me' &&
        (byMe === null ? (
          <Spinner />
        ) : byMe.length === 0 ? (
          <EmptyState icon="users" title="You haven’t shared anything" text="Share a credential to collaborate securely." />
        ) : (
          <Card className="overflow-hidden !p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Credential</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Access</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {byMe.map((s) => (
                  <tr key={s.shareId} className="border-b border-white/[0.03] last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-200">{s.title}</td>
                    <td className="px-4 py-3 text-slate-400">{s.recipientEmail}</td>
                    <td className="px-4 py-3 text-slate-400">{s.permission.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`chip ${s.active ? 'bg-aurora-teal/15 text-aurora-teal' : 'bg-white/[0.05] text-slate-500'}`}>
                        {s.active ? 'active' : 'revoked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.active && (
                        <button onClick={() => revoke(s.shareId)} className="text-aurora-rose hover:underline text-xs">
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Share a credential"
        subtitle="Grant another SecureVault user access with a permission level.">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Credential</label>
            <select className="input" value={form.credentialId}
              onChange={(e) => setForm((f) => ({ ...f, credentialId: e.target.value }))} required>
              <option value="">Select a credential…</option>
              {creds.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Recipient email</label>
            <input className="input" type="email" placeholder="team@securevault.io" value={form.recipientEmail}
              onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Permission</label>
            <div className="grid grid-cols-3 gap-2">
              {PERMISSIONS.map((p) => (
                <button type="button" key={p.value}
                  onClick={() => setForm((f) => ({ ...f, permission: p.value }))}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs transition ${
                    form.permission === p.value ? 'border-aurora-violet/50 bg-aurora-violet/10 text-aurora-violet' : 'border-white/[0.06] text-slate-400'
                  }`}>
                  <Icon name={p.icon} size={18} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Expires (optional)</label>
            <input className="input" type="datetime-local" value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full">
            <Icon name="share" size={16} /> Share securely
          </button>
        </form>
      </Modal>
    </div>
  )
}
