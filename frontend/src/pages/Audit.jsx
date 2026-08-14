import { useEffect, useState, useCallback } from 'react'
import Icon from '../components/Icon'
import { Card, Spinner, EmptyState } from '../components/ui'
import { auditApi, reportUrls } from '../api/endpoints'
import { formatDate } from '../utils/helpers'

const CATEGORY_COLOR = {
  AUTH: '#38bdf8',
  VAULT: '#2dd4bf',
  SHARE: '#a78bfa',
  SECURITY: '#fb7185',
  SYSTEM: '#94a3b8',
}

export default function Audit() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)

  const load = useCallback(async () => {
    const { data } = await auditApi.logs(page, 20)
    setData(data)
  }, [page])

  useEffect(() => { load() }, [load])

  if (data === null) return <Spinner label="Loading audit trail…" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {data.totalElements} recorded event{data.totalElements === 1 ? '' : 's'}
        </p>
        <a href={reportUrls.auditExcel} target="_blank" rel="noreferrer" className="btn-ghost">
          <Icon name="download" size={16} /> Export Excel
        </a>
      </div>

      {data.content.length === 0 ? (
        <EmptyState icon="activity" title="No activity yet" text="Actions across your account will be logged here." />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {data.content.map((log) => {
              const color = CATEGORY_COLOR[log.category] || '#94a3b8'
              return (
                <div key={log.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${color}1f`, color }}>
                    <Icon name="activity" size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{prettyAction(log.action)}</span>
                      <span className="chip" style={{ background: `${color}1f`, color }}>{log.category}</span>
                    </div>
                    <div className="truncate text-xs text-slate-500">{log.detail}</div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-xs text-slate-400">{formatDate(log.createdAt)}</div>
                    <div className="text-[10px] text-slate-600 font-mono">{log.ipAddress}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={data.first} onClick={() => setPage((p) => p - 1)} className="btn-ghost disabled:opacity-40">
            Prev
          </button>
          <span className="px-3 text-sm text-slate-400">
            Page {data.number + 1} of {data.totalPages}
          </span>
          <button disabled={data.last} onClick={() => setPage((p) => p + 1)} className="btn-ghost disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function prettyAction(a) {
  if (!a) return ''
  const s = a.toLowerCase().replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
