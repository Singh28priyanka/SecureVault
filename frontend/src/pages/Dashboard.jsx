import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { dashboardApi, reportUrls } from '../api/endpoints'
import { Card, StatCard, Spinner, SectionTitle } from '../components/ui'
import HealthRing from '../components/HealthRing'
import Icon from '../components/Icon'
import { typeMeta, strengthColor } from '../utils/helpers'

const STRENGTH_BUCKETS = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong']
const BUCKET_SCORES = [10, 30, 50, 70, 90]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 text-xs">
      <div className="font-semibold text-white">{label ?? payload[0].name}</div>
      <div className="text-slate-400">{payload[0].value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    dashboardApi.get().then(({ data }) => setData(data)).catch(() => setData(false))
  }, [])

  if (data === null) return <Spinner label="Building your dashboard…" />
  if (data === false)
    return <p className="text-slate-400">Couldn’t load dashboard.</p>

  const typeData = Object.entries(data.credentialsByType || {}).map(([k, v]) => ({
    name: typeMeta(k).label,
    value: v,
    color: typeMeta(k).color,
  }))

  const strengthData = (data.strengthDistribution || []).map((v, i) => ({
    name: STRENGTH_BUCKETS[i],
    value: v,
    color: strengthColor(BUCKET_SCORES[i]),
  }))

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="vault" label="Credentials" value={data.totalCredentials} accent="#38bdf8" />
        <StatCard icon="alert" label="Weak passwords" value={data.weakPasswords} accent="#fb7185"
          hint={`${data.reusedPasswords} reused`} />
        <StatCard icon="clock" label="Expired" value={data.expiredPasswords} accent="#fbbf24" />
        <StatCard icon="share" label="Active shares" value={data.activeShares} accent="#a78bfa"
          hint={`${data.unresolvedAlerts} open alerts`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health */}
        <Card className="flex flex-col items-center justify-center gap-4 lg:col-span-1">
          <SectionTitle>Password Health</SectionTitle>
          <HealthRing score={data.passwordHealthScore} />
          <p className="text-center text-sm text-slate-400 max-w-[220px]">
            {data.passwordHealthScore >= 80
              ? 'Excellent — your vault is in great shape.'
              : data.passwordHealthScore >= 50
              ? 'Good, but a few passwords need attention.'
              : 'Several credentials are weak, reused or expired.'}
          </p>
          <a href={reportUrls.passwordHealthPdf} className="btn-ghost w-full" target="_blank" rel="noreferrer">
            <Icon name="download" size={16} /> Export health report (PDF)
          </a>
        </Card>

        {/* Login trend */}
        <Card className="lg:col-span-2">
          <SectionTitle>Login Activity · last 7 days</SectionTitle>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data.loginTrend}>
              <defs>
                <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={24} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#22d3ee', strokeOpacity: 0.2 }} />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2.5} fill="url(#loginGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Credentials by type */}
        <Card>
          <SectionTitle>By Type</SectionTitle>
          {typeData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No credentials yet</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={170}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" innerRadius={44} outerRadius={70} paddingAngle={3} stroke="none">
                    {typeData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {typeData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 text-slate-400">{d.name}</span>
                    <span className="font-semibold text-slate-200">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Strength distribution */}
        <Card>
          <SectionTitle>Strength Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={strengthData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={0} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {strengthData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent activity */}
        <Card>
          <SectionTitle action={<Link to="/audit" className="text-xs text-aurora-cyan hover:underline">View all</Link>}>
            Recent Activity
          </SectionTitle>
          <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
            {(data.recentActivity || []).length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">No activity yet</p>
            )}
            {(data.recentActivity || []).map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aurora-cyan" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-slate-200">{a.action}</div>
                  <div className="truncate text-xs text-slate-500">{a.detail}</div>
                </div>
                <span className="shrink-0 text-[10px] text-slate-600">{a.timeAgo}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
