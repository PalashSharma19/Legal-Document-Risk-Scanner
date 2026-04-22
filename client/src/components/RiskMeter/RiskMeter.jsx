import { motion } from 'framer-motion'

const COLOR_MAP = {
  red: '#EF4444',
  amber: '#F59E0B',
  green: '#22C55E'
}

export default function RiskMeter({ score, label, color }) {
  const Motion = motion
  const radius = 74
  const stroke = 12
  const normalized = Math.max(0, Math.min(100, Number(score) || 0))
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (normalized / 100) * circumference
  const strokeColor = COLOR_MAP[color] || COLOR_MAP.green

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
        <svg className="h-48 w-48 -rotate-90" viewBox="0 0 180 180" role="img" aria-label={`Risk score ${normalized}`}>
          <circle cx="90" cy="90" r={radius} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
          <Motion.circle
            cx="90"
            cy="90"
            r={radius}
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{normalized}</span>
        </div>
      </div>
      <p className="mt-3 text-lg font-semibold text-gray-900">{label}</p>
    </div>
  )
}
