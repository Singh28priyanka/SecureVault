import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import StrengthMeter from '../components/StrengthMeter'
import { CREDENTIAL_TYPES } from '../utils/helpers'
import { passwordApi, vaultApi } from '../api/endpoints'
import { apiError } from '../api/client'

const empty = {
  title: '', type: 'WEBSITE_LOGIN', username: '', secret: '',
  url: '', website: '', notes: '', favorite: false,
}

/** Create/edit form for a credential. On edit, secret starts blank (unchanged unless typed). */
export default function CredentialForm({ initial, onSaved, onError }) {
  const editing = Boolean(initial?.id)
  const [form, setForm] = useState(empty)
  const [score, setScore] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) {
      setForm({ ...empty, ...initial, secret: '' })
      setScore(initial.strengthScore || 0)
    }
  }, [initial])

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const onSecret = async (e) => {
    const v = e.target.value
    setForm((f) => ({ ...f, secret: v }))
    if (v) {
      try {
        const { data } = await passwordApi.strength(v)
        setScore(data.score)
      } catch { /* ignore */ }
    } else setScore(0)
  }

  const generate = async () => {
    const { data } = await passwordApi.generate({
      length: 20, includeLowercase: true, includeUppercase: true,
      includeNumbers: true, includeSymbols: true,
    })
    setForm((f) => ({ ...f, secret: data.password }))
    setScore(data.strength.score)
    setShowSecret(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (editing && !payload.secret) delete payload.secret // keep existing secret
      if (editing) await vaultApi.update(initial.id, payload)
      else await vaultApi.create(payload)
      onSaved?.()
    } catch (err) {
      onError?.(apiError(err, 'Could not save credential'))
    } finally {
      setSaving(false)
    }
  }

  const isNote = form.type === 'SECURE_NOTE'

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={set('title')} required autoFocus placeholder="e.g. GitHub" />
        </div>

        <div className="col-span-2">
          <label className="label">Type</label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {CREDENTIAL_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                title={t.label}
                className={`grid place-items-center rounded-xl border py-2.5 transition ${
                  form.type === t.value
                    ? 'border-transparent'
                    : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-slate-300'
                }`}
                style={form.type === t.value ? { background: `${t.color}22`, color: t.color } : {}}
              >
                <Icon name={t.icon} size={18} />
              </button>
            ))}
          </div>
        </div>

        {!isNote && (
          <div className="col-span-2">
            <label className="label">Username / account</label>
            <input className="input" value={form.username || ''} onChange={set('username')} placeholder="you@example.com" />
          </div>
        )}

        <div className="col-span-2">
          <label className="label">{isNote ? 'Note content' : 'Password / secret'}</label>
          <div className="relative">
            {isNote ? (
              <textarea className="input min-h-[90px] resize-y" value={form.secret} onChange={onSecret}
                placeholder="Sensitive note — encrypted at rest" />
            ) : (
              <input
                className="input pr-24 font-mono"
                type={showSecret ? 'text' : 'password'}
                value={form.secret}
                onChange={onSecret}
                placeholder={editing ? '•••••• (unchanged)' : 'Enter or generate'}
              />
            )}
            {!isNote && (
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                <button type="button" onClick={() => setShowSecret((s) => !s)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/10">
                  <Icon name={showSecret ? 'eyeOff' : 'eye'} size={16} />
                </button>
                <button type="button" onClick={generate} title="Generate strong password"
                  className="grid h-7 w-7 place-items-center rounded-lg text-aurora-teal hover:bg-white/10">
                  <Icon name="refresh" size={16} />
                </button>
              </div>
            )}
          </div>
          {!isNote && form.secret && <div className="mt-2"><StrengthMeter score={score} /></div>}
        </div>

        {!isNote && (
          <>
            <div>
              <label className="label">Website</label>
              <input className="input" value={form.website || ''} onChange={set('website')} placeholder="example.com" />
            </div>
            <div>
              <label className="label">URL</label>
              <input className="input" value={form.url || ''} onChange={set('url')} placeholder="https://…" />
            </div>
          </>
        )}

        {!isNote && (
          <div className="col-span-2">
            <label className="label">Notes</label>
            <input className="input" value={form.notes || ''} onChange={set('notes')} placeholder="Optional" />
          </div>
        )}

        <label className="col-span-2 flex items-center gap-2.5 text-sm text-slate-300">
          <input type="checkbox" checked={form.favorite} onChange={set('favorite')}
            className="h-4 w-4 rounded border-white/20 bg-ink-800 accent-aurora-violet" />
          Mark as favourite
        </label>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? 'Saving…' : (
          <>
            <Icon name="lock" size={16} /> {editing ? 'Save changes' : 'Add to vault'}
          </>
        )}
      </button>
    </form>
  )
}
