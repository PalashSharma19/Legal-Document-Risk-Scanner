import { useState } from 'react'
import { motion } from 'framer-motion'
import SeverityBadge from '../SeverityBadge/SeverityBadge'

export default function FindingCard({
  ruleId,
  category,
  severity,
  explanation,
  recommendation,
  matchedClause,
  clauseIndex,
  index = 0
}) {
  const Motion = motion
  const [expanded, setExpanded] = useState(false)

  return (
    <Motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SeverityBadge severity={severity} />
        <h3 className="text-base font-semibold text-gray-900">{category}</h3>
      </div>

      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {ruleId} · Clause {Number(clauseIndex) + 1}
      </p>

      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Matched Clause</p>
        <p
          className="text-sm italic text-gray-700"
          style={
            expanded
              ? undefined
              : {
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }
          }
        >
          {matchedClause}
        </p>
        {matchedClause?.length > 200 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Risk</p>
        <p className="mt-1 text-sm text-gray-700">{explanation}</p>
      </div>

      <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Recommendation</p>
        <div className="mt-1 flex items-start gap-2 text-sm text-amber-900">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
            <path
              d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.26A7 7 0 0 0 12 2Z"
              fill="currentColor"
            />
          </svg>
          <p>{recommendation}</p>
        </div>
      </div>
    </Motion.article>
  )
}
