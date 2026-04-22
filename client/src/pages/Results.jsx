import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import RiskMeter from '../components/RiskMeter/RiskMeter'
import FindingCard from '../components/FindingCard/FindingCard'
import MetricCard from '../components/MetricCard/MetricCard'

const severityOrder = { high: 0, medium: 1, low: 2 }

export default function Results() {
  const Motion = motion
  const navigate = useNavigate()
  const location = useLocation()
  const data = location.state?.data

  useEffect(() => {
    if (!data) {
      navigate('/', { replace: true })
    }
  }, [data, navigate])

  const findings = useMemo(() => data?.findings || [], [data])

  const sortedFindings = useMemo(() => {
    return [...findings].sort((a, b) => {
      const aRank = severityOrder[a.severity] ?? 3
      const bRank = severityOrder[b.severity] ?? 3
      if (aRank !== bRank) return aRank - bRank
      return (a.clauseIndex ?? 0) - (b.clauseIndex ?? 0)
    })
  }, [findings])

  const metrics = useMemo(() => {
    const highCount = findings.filter((f) => f.severity === 'high').length
    const mediumCount = findings.filter((f) => f.severity === 'medium').length

    return {
      clauseCount: data?.clauseCount || 0,
      risksFlagged: findings.length,
      highCount,
      mediumCount
    }
  }, [data, findings])

  if (!data) {
    return null
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Legal Document Risk Scanner</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Scan Another Document
          </button>
        </header>

        <Motion.section
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[{ label: 'Total Clauses Scanned', value: metrics.clauseCount },
            { label: 'Risks Flagged', value: metrics.risksFlagged },
            { label: 'High Severity', value: metrics.highCount },
            { label: 'Medium Severity', value: metrics.mediumCount }].map((item) => (
            <Motion.div key={item.label} variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
              <MetricCard label={item.label} value={item.value} />
            </Motion.div>
          ))}
        </Motion.section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Overall Risk Score</h2>
          <div className="mt-4 flex justify-center">
            <RiskMeter score={data.riskScore} label={data.riskLabel} color={data.color} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Flagged Clauses</h2>
          {sortedFindings.length === 0 ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              No significant risks detected. This document appears to be relatively fair.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFindings.map((finding, index) => (
                <FindingCard key={`${finding.ruleId}-${finding.clauseIndex}-${index}`} {...finding} index={index} />
              ))}
            </div>
          )}
        </section>

        <footer className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
          This tool is not a substitute for legal advice. Consult a qualified lawyer for serious contracts.
        </footer>
      </div>
    </main>
  )
}
