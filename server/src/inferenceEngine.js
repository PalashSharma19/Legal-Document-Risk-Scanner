const { knowledgeBase } = require('./knowledgeBase')

const runInferenceEngine = (clauses) => {
  const workingMemory = []

  for (const clause of clauses) {
    for (const rule of knowledgeBase) {
      if (rule.condition(clause.text)) {
        workingMemory.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          explanation: rule.explanation,
          recommendation: rule.recommendation,
          matchedClause: clause.text,
          clauseIndex: clause.index
        })
        break
      }
    }
  }

  return workingMemory
}

module.exports = { runInferenceEngine }
