import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import CredentialForm from './CredentialForm'
import { Spinner, EmptyState } from '../components/ui'
import StrengthMeter from '../components/StrengthMeter'
import { vaultApi } from '../api/endpoints'
import { pushToast } from '../store/slices/uiSlice'
import { CREDENTIAL_TYPES, typeMeta, timeAgo, copyToClipboard } from '../utils/helpers'

export default function Vault() {
  const dispatch = useDispatch()
  const [items, setItems] = useState(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const [modal, setModal] = useState(null) // {mode:'create'|'edit', item}
  const [revealed, setRevealed] = useState({}) // id -> secret

  const load = useCallback(async () => {
    const params = {}
    if (type) params.type = type
    if (search) params.search = search
    if (favOnly) params.favorite = true
    const { data } = await vaultApi.list(params)
    setItems(data)
  }, [type, search, favOnly])

  useEffect(() => {
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load])

  const reveal = async (item) => {
    if (revealed[item.id]) {
      setRevealed((r) => { const n = { ...r }; delete n[item.id]; return n })
      return
    }
    const { data } = await vaultApi.reveal(item.id)
    setRevealed((r) => ({ ...r, [item.id]: data.secret }))
  }

  const copy = async (item) => {
    let secret = revealed[item.id]
    if (!secret) {
      const { data } = await vaultApi.reveal(item.id)
      secret = data.secret
    }
    const ok = await copyToClipboard(secret)
    dispatch(pushToast(ok ? 'Copied to clipboard' : 'Copy failed', ok ? 'success' : 'error'))
  }

  const toggleFav = async (item) => {
    await vaultApi.toggleFavorite(item.id)
    load()
  }

  const remove = async (item) => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    await vaultApi.remove(item.id)
    dispatch(pushToast('Credential deleted', 'success'))
    load()
  }

  const onSaved = () => {
    setModal(null)
    dispatch(pushToast('Vault updated', 'success'))
    load()
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-11"
            placeholder="Search by title, username or site…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`btn-ghost ${favOnly ? 'text-aurora-amber' : ''}`}
        >
          <Icon name="star" size={16} filled={favOnly} /> Favourites
        </button>
        <button onClick={() => setModal({ mode: 'create' })} className="btn-primary">
          <Icon name="plus" size={18} /> Add credential
        </button>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={!type} onClick={() => setType('')} label="All" color="#94a3b8" />
        {CREDENTIAL_TYPES.map((t) => (
          <FilterChip
            key={t.value}
            active={type === t.value}
            onClick={() => setType(type === t.value ? '' : t.value)}
            label={t.label}
            color={t.color}
            icon={t.icon}
          />
        ))}
      </div>

      {/* List */}
      {items === null ? (
        <Spinner label="Decrypting vault index…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon="vault"
          title="No credentials found"
          text="Add your first credential — passwords, API keys or secure notes are all encrypted with AES-256."
          action={
            <button onClick={() => setModal({ mode: 'create' })} className="btn-primary mt-2">
              <Icon name="plus" size={16} /> Add credential
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const meta = typeMeta(item.type)
            const isNote = item.type === 'SECURE_NOTE'
            const secret = revealed[item.id]
            return (
              <div key={item.id} className="glass glass-hover group p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: `${meta.color}1f`, color: meta.color }}
                  >
                    <Icon name={meta.icon} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate font-semibold text-white">{item.title}</h4>
                      {item.expired && (
                        <span className="chip bg-aurora-amber/15 text-aurora-amber">expired</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {item.username || item.website || meta.label}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFav(item)}
                    className={`transition ${item.favorite ? 'text-aurora-amber' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    <Icon name="star" size={18} filled={item.favorite} />
                  </button>
                </div>

                {/* Secret line */}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-ink-900/60 px-3 py-2">
                  <code className="flex-1 truncate font-mono text-sm text-slate-300">
                    {secret ? secret : '••••••••••••'}
                  </code>
                  <button onClick={() => reveal(item)} title="Reveal"
                    className="text-slate-400 hover:text-aurora-cyan">
                    <Icon name={secret ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                  <button onClick={() => copy(item)} title="Copy"
                    className="text-slate-400 hover:text-aurora-teal">
                    <Icon name="copy" size={16} />
                  </button>
                </div>

                {!isNote && item.strengthScore > 0 && (
                  <div className="mt-3">
                    <StrengthMeter score={item.strengthScore} compact showLabel={false} />
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-slate-600">
                    Updated {timeAgo(item.updatedAt)}
                  </span>
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => setModal({ mode: 'edit', item })}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/10">
                      <Icon name="edit" size={15} />
                    </button>
                    <button onClick={() => remove(item)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-aurora-rose/20 hover:text-aurora-rose">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit credential' : 'Add credential'}
        subtitle="Secrets are encrypted with AES-256 before they’re stored."
        maxWidth="max-w-xl"
      >
        <CredentialForm
          initial={modal?.item}
          onSaved={onSaved}
          onError={(m) => dispatch(pushToast(m, 'error'))}
        />
      </Modal>
    </div>
  )
}

function FilterChip({ active, onClick, label, color, icon }) {
  return (
    <button
      onClick={onClick}
      className={`chip border transition ${
        active ? 'border-transparent' : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-slate-200'
      }`}
      style={active ? { background: `${color}22`, color } : {}}
    >
      {icon && <Icon name={icon} size={13} />}
      {label}
    </button>
  )
}
