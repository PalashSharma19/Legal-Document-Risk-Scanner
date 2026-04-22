const segmentClauses = (rawText) => {
  return rawText
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((text, index) => ({ text: text.trim(), index }))
    .filter((c) => c.text.length > 40)
}

module.exports = { segmentClauses }
