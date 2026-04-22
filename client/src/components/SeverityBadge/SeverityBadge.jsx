const STYLE_MAP = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700'
}

export default function SeverityBadge({ severity }) {
  const normalized = typeof severity === 'string' ? severity.toLowerCase() : 'low'
  const style = STYLE_MAP[normalized] || STYLE_MAP.low

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}>
      {normalized}
    </span>
  )
}
