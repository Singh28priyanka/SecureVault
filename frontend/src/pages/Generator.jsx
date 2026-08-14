import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Icon from '../components/Icon'
import StrengthMeter from '../components/StrengthMeter'
import { Card, SectionTitle } from '../components/ui'
import { passwordApi } from '../api/endpoints'
import { pushToast } from '../store/slices/uiSlice'
import { copyToClipboard } from '../utils/helpers'

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] px-4 py-3">
    <span className="text-sm text-slate-300">{label}</span>
    <span
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand-gradient' : 'bg-ink-700'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </span>
  </label>
)

export default function Generator() {
  const dispatch = useDispatch()
  const [opts, setOpts] = useState({
    length: 20,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  })
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const generate = useCallback(async () => {
    const { data } = await passwordApi.generate(opts)
    setResult(data)
    setHistory((h) => [data.password, ...h].slice(0, 6))
  }, [opts])

  useEffect(() => {
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (k, v) => setOpts((o) => ({ ...o, [k]: v }))

  const copy = async (text) => {
    const ok = await copyToClipboard(text)
    dispatch(pushToast(ok ? 'Password copied' : 'Copy failed', ok ? 'success' : 'error'))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-6">
        {/* Result */}
        <Card>
          <SectionTitle
            action={
              <button onClick={generate} className="text-xs text-aurora-cyan hover:underline inline-flex items-center gap-1">
                <Icon name="refresh" size={13} /> Regenerate
              </button>
            }
          >
            Generated Password
          </SectionTitle>

          <div className="rounded-2xl border border-white/[0.06] bg-ink-900/60 p-5">
            <div className="break-all text-center font-mono text-2xl font-semibold text-white sm:text-3xl">
              {result?.password || '…'}
            </div>
          </div>

          {result && (
            <div className="mt-4 space-y-4">
              <StrengthMeter score={result.strength.score} />
              <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                <Metric label="Length" value={result.strength.length} />
                <Metric label="Entropy" value={`${result.strength.entropyBits} bits`} />
                <Metric label="Rating" value={result.strength.label} />
                <Metric label="Charset" value={charsetLabel(opts)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => copy(result.password)} className="btn-primary flex-1">
                  <Icon name="copy" size={16} /> Copy password
                </button>
                <button onClick={generate} className="btn-ghost">
                  <Icon name="refresh" size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>

        {history.length > 1 && (
          <Card>
            <SectionTitle>Recent (this session)</SectionTitle>
            <div className="space-y-2">
              {history.slice(1).map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-white/[0.02] px-3 py-2">
                  <code className="flex-1 truncate font-mono text-sm text-slate-400">{p}</code>
                  <button onClick={() => copy(p)} className="text-slate-500 hover:text-aurora-teal">
                    <Icon name="copy" size={15} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Controls */}
      <Card className="lg:col-span-2 space-y-5 self-start">
        <SectionTitle>Options</SectionTitle>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-300">Length</span>
            <span className="rounded-lg bg-white/[0.05] px-2.5 py-1 font-mono text-sm text-aurora-cyan">
              {opts.length}
            </span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={opts.length}
            onChange={(e) => set('length', Number(e.target.value))}
            className="w-full accent-aurora-violet"
          />
        </div>

        <div className="space-y-2.5">
          <Toggle checked={opts.includeUppercase} onChange={(v) => set('includeUppercase', v)} label="Uppercase (A-Z)" />
          <Toggle checked={opts.includeLowercase} onChange={(v) => set('includeLowercase', v)} label="Lowercase (a-z)" />
          <Toggle checked={opts.includeNumbers} onChange={(v) => set('includeNumbers', v)} label="Numbers (0-9)" />
          <Toggle checked={opts.includeSymbols} onChange={(v) => set('includeSymbols', v)} label="Symbols (!@#$)" />
          <Toggle checked={opts.excludeAmbiguous} onChange={(v) => set('excludeAmbiguous', v)} label="Exclude look-alikes (il1Lo0O)" />
        </div>

        <button onClick={generate} className="btn-primary w-full">
          <Icon name="key" size={16} /> Generate new
        </button>
      </Card>
    </div>
  )
}

const Metric = ({ label, value }) => (
  <div className="rounded-xl bg-white/[0.02] px-2 py-2.5">
    <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-0.5 truncate text-sm font-semibold text-slate-200">{value}</div>
  </div>
)

function charsetLabel(o) {
  const n = [o.includeLowercase, o.includeUppercase, o.includeNumbers, o.includeSymbols].filter(Boolean).length
  return `${n} sets`
}
