import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Icon from '../components/Icon'
import { Card, SectionTitle, EmptyState, Spinner } from '../components/ui'
import { securityApi } from '../api/endpoints'
import { pushToast } from '../store/slices/uiSlice'
import { severityMeta, timeAgo, formatDate } from '../utils/helpers'

export default function Security() {
  const dispatch = useDispatch()
  const [alerts, setAlerts] = useState(null)
  const [logins, setLogins] = useState(null)
  const [devices, setDevices] = useState(null)

  const load = useCallback(async () => {
    const [a, l, d] = await Promise.all([securityApi.alerts(), securityApi.logins(), securityApi.devices()])
    setAlerts(a.data)
    setLogins(l.data)
    setDevices(d.data)
  }, [])

  useEffect(() => { load() }, [load])

  const resolve = async (id) => {
    await securityApi.resolve(id)
    dispatch(pushToast('Alert resolved', 'success'))
    load()
  }

  const trust = async (id, trusted) => {
    await securityApi.trustDevice(id, trusted)
    load()
  }

  const removeDevice = async (id) => {
    await securityApi.removeDevice(id)
    dispatch(pushToast('Device removed', 'success'))
    load()
  }

  const openAlerts = (alerts || []).filter((a) => !a.resolved)

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <div>
        <SectionTitle>Security Alerts {openAlerts.length > 0 && <span className="text-aurora-rose">· {openAlerts.length} open</span>}</SectionTitle>
        {alerts === null ? (
          <Spinner />
        ) : alerts.length === 0 ? (
          <EmptyState icon="shield" title="All clear" text="No security alerts. We’ll notify you if anything looks off." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {alerts.map((a) => {
              const m = severityMeta(a.severity)
              return (
                <Card key={a.id} className={a.resolved ? 'opacity-50' : ''}>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: m.bg, color: m.color }}>
                      <Icon name="alert" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{a.title}</h4>
                        <span className="chip" style={{ background: m.bg, color: m.color }}>{a.severity}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{a.message}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-600">{timeAgo(a.createdAt)}</p>
                    </div>
                    {!a.resolved && (
                      <button onClick={() => resolve(a.id)} title="Resolve" className="text-slate-400 hover:text-aurora-teal">
                        <Icon name="check" size={18} />
                      </button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Login activity */}
        <Card>
          <SectionTitle>Login Activity</SectionTitle>
          {logins === null ? <Spinner /> : (
            <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
              {logins.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.02]">
                  <span className={`grid h-8 w-8 place-items-center rounded-lg ${l.success ? 'bg-aurora-teal/15 text-aurora-teal' : 'bg-aurora-rose/15 text-aurora-rose'}`}>
                    <Icon name={l.success ? 'check' : 'x'} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-200">{l.deviceLabel || 'Unknown device'}</div>
                    <div className="truncate text-xs text-slate-500">{l.location} · {l.ipAddress}</div>
                  </div>
                  {l.anomalous && <span className="chip bg-aurora-amber/15 text-aurora-amber">flagged</span>}
                  <span className="shrink-0 text-[10px] text-slate-600">{timeAgo(l.createdAt)}</span>
                </div>
              ))}
              {logins.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No login history</p>}
            </div>
          )}
        </Card>

        {/* Devices */}
        <Card>
          <SectionTitle>Trusted Devices</SectionTitle>
          {devices === null ? <Spinner /> : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-aurora-violet/15 text-aurora-violet">
                    <Icon name="device" size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-200">{d.label}</div>
                    <div className="truncate text-xs text-slate-500">Last seen {formatDate(d.lastSeenAt)}</div>
                  </div>
                  <button onClick={() => trust(d.id, !d.trusted)}
                    className={`chip ${d.trusted ? 'bg-aurora-teal/15 text-aurora-teal' : 'bg-white/[0.05] text-slate-400'}`}>
                    {d.trusted ? 'trusted' : 'trust'}
                  </button>
                  <button onClick={() => removeDevice(d.id)} className="text-slate-500 hover:text-aurora-rose">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              ))}
              {devices.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No devices tracked</p>}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
