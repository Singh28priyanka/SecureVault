import { strengthColor, strengthLabel } from '../utils/helpers'

/** Segmented password-strength meter (5 bars) with label. */
export default function StrengthMeter({ score = 0, showLabel = true, compact = false }) {
  const color = strengthColor(score)
  const activeBars = Math.ceil((score / 100) * 5)

  return (
    <div className={compact ? '' : 'space-y-1.5'}>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i < activeBars ? color : 'rgba(255,255,255,0.08)',
              boxShadow: i < activeBars ? `0 0 8px ${color}66` : 'none',
            }}
          />
        ))}
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span style={{ color }} className="font-semibold">
            {strengthLabel(score)}
          </span>
          <span className="text-slate-500 font-mono">{score}/100</span>
        </div>
      )}
    </div>
  )
}
