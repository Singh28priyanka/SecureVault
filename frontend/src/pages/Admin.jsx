import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from 'recharts'
import Icon from '../components/Icon'
import { Card, StatCard, SectionTitle, Spinner } from '../components/ui'
import { adminApi } from '../api/endpoints'
import { severityMeta, timeAgo, initials } from '../utils/helpers'

export default function Admin() {
  const user = useSelector((s) => s.auth.user)
  const [dash, setDash] = useState(null)
  const [users, setUsers] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    adminApi.dashboard().then(({ data }) => setDash(data))
    adminApi.users().then(({ data }) => setUsers(data))
    adminApi.alerts().then(({ data }) => setAlerts(data))
  }, [user])

  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  if (!dash) return <Spinner label="Loading admin console…" />

  const roleColor = { ADMIN: '#fbbf24', USER: '#38bdf8', TEAM_MEMBER: '#a78bfa' }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="users" label="Total users" value={dash.totalUsers} accent="#38bdf8" hint={`${dash.activeUsers} active`} />
        <StatCard icon="vault" label="Credentials" value={dash.totalCredentials} accent="#2dd4bf" />
        <StatCard icon="alert" label="Alerts" value={dash.totalAlerts} accent="#fb7185" hint={`${dash.criticalAlerts} high/critical`} />
        <StatCard icon="activity" label="Logins today" value={dash.loginsToday} accent="#a78bfa" hint={`${dash.failedLoginsToday} failed`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle>System Login Trend · 7 days</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dash.systemLoginTrend}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={24} />
              <Tooltip contentStyle={{ background: '#14162e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2.5} fill="url(#adminGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Users by Role</SectionTitle>
          <div className="space-y-3 pt-2">
            {Object.entries(dash.usersByRole || {}).map(([role, count]) => (
              <div key={role}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{role.replace('_', ' ')}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full" style={{
                    width: `${(count / dash.totalUsers) * 100}%`,
                    background: roleColor[role] || '#94a3b8',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users table */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-5 pt-5"><SectionTitle>Users</SectionTitle></div>
          <table className="w-full text-sm">
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/[0.03]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-xs font-bold text-ink-950">
                        {initials(u.fullName || u.username)}
                      </span>
                      <div>
                        <div className="font-medium text-slate-200">{u.fullName || u.username}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="chip" style={{ background: `${roleColor[u.role]}1f`, color: roleColor[u.role] }}>
                      {u.role.replace('_', ' ')}
                    </span>
                    {u.mfaEnabled && (
                      <span className="chip ml-1 bg-aurora-teal/15 text-aurora-teal"><Icon name="lock" size={11} /> MFA</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Recent alerts */}
        <Card>
          <SectionTitle>Recent Security Alerts</SectionTitle>
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {alerts.slice(0, 20).map((a) => {
              const m = severityMeta(a.severity)
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: m.bg, color: m.color }}>
                    <Icon name="alert" size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-200">{a.title}</div>
                    <div className="truncate text-xs text-slate-500">{a.message}</div>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-600">{timeAgo(a.createdAt)}</span>
                </div>
              )
            })}
            {alerts.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No alerts</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
