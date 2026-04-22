const express = require('express')
const cors = require('cors')
const multer = require('multer')
const pdfParse = require('pdf-parse')
require('dotenv').config()

const { segmentClauses } = require('./clauseSegmenter')
const { runInferenceEngine } = require('./inferenceEngine')
const { calculateRiskScore, getRiskLabel } = require('./riskScorer')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.post('/api/scan', async (req, res) => {
  try {
    const { text } = req.body

    if (!text || text.trim().length < 100) {
      return res
        .status(400)
        .json({ error: 'Document too short or empty. Please paste at least a paragraph of text.' })
    }

    const clauses = segmentClauses(text)
    const findings = runInferenceEngine(clauses)
    const riskScore = calculateRiskScore(findings)
    const { label: riskLabel, color } = getRiskLabel(riskScore)

    return res.json({ findings, riskScore, riskLabel, color, clauseCount: clauses.length })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

app.post('/api/scan/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' })
    }

    const data = await pdfParse(req.file.buffer)
    const text = data.text

    if (!text || text.trim().length < 100) {
      return res.status(400).json({ error: 'Could not extract readable text from this PDF.' })
    }

    const clauses = segmentClauses(text)
    const findings = runInferenceEngine(clauses)
    const riskScore = calculateRiskScore(findings)
    const { label: riskLabel, color } = getRiskLabel(riskScore)

    return res.json({ findings, riskScore, riskLabel, color, clauseCount: clauses.length })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to parse PDF.' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
