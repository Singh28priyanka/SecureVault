// Shared presentation helpers: credential-type metadata, strength colours, time.

export const CREDENTIAL_TYPES = [
  { value: 'WEBSITE_LOGIN', label: 'Website Login', icon: 'globe', color: '#38bdf8' },
  { value: 'EMAIL_ACCOUNT', label: 'Email Account', icon: 'mail', color: '#2dd4bf' },
  { value: 'BANKING', label: 'Banking', icon: 'card', color: '#fbbf24' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media', icon: 'share', color: '#f472b6' },
  { value: 'APPLICATION', label: 'Application', icon: 'device', color: '#a78bfa' },
  { value: 'API_KEY', label: 'API Key', icon: 'key', color: '#a3e635' },
  { value: 'SECURE_NOTE', label: 'Secure Note', icon: 'note', color: '#94a3b8' },
]

export function typeMeta(value) {
  return CREDENTIAL_TYPES.find((t) => t.value === value) || CREDENTIAL_TYPES[0]
}

export function strengthColor(score) {
  if (score >= 80) return '#2dd4bf'
  if (score >= 60) return '#a3e635'
  if (score >= 40) return '#fbbf24'
  if (score >= 20) return '#fb923c'
  return '#fb7185'
}

export function strengthLabel(score) {
  if (score >= 80) return 'Very Strong'
  if (score >= 60) return 'Strong'
  if (score >= 40) return 'Moderate'
  if (score >= 20) return 'Weak'
  return 'Very Weak'
}

export function severityMeta(sev) {
  return (
    {
      CRITICAL: { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
      HIGH: { color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
      MEDIUM: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
      LOW: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
    }[sev] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }
  )
}

export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
}
