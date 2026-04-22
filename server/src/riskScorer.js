const calculateRiskScore = (findings) => {
  const weights = { high: 30, medium: 15, low: 5 }
  const raw = findings.reduce((sum, f) => sum + (weights[f.severity] || 0), 0)
  return Math.min(100, raw)
}

const getRiskLabel = (score) => {
  if (score >= 70) return { label: 'High Risk', color: 'red' }
  if (score >= 40) return { label: 'Moderate Risk', color: 'amber' }
  return { label: 'Low Risk', color: 'green' }
}

module.exports = { calculateRiskScore, getRiskLabel }
