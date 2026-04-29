# Legal Document Risk Scanner — Master Project Document (PRD)

> Feed this entire document to your AI coding assistant and instruct it to scaffold the complete project. All architecture decisions, folder structure, module logic, knowledge base rules, API contracts, and UI specifications are defined here.

---

## 1. Project Overview

**Project Name:** Legal Document Risk Scanner
**Type:** Full-stack web application with a rule-based Expert System core
**Purpose:** Users paste or upload a legal contract (rental agreement, employment contract, NDA, freelance agreement). The system automatically identifies risky or unfair clauses, explains each risk in plain English, and returns an overall risk score from 0–100.
**Target Users:** Students, fresh graduates, tenants, freelancers — anyone who needs to sign a legal document without access to a lawyer.

---

## 2. Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (utility-first, no custom CSS files unless unavoidable)
- **Animation:** Framer Motion
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Package Manager:** npm

### Backend
- **Runtime:** Node.js v20
- **Framework:** Express.js
- **PDF Text Extraction:** `pdf-parse` npm package
- **NLP Preprocessing:** `compromise` npm package (lightweight, no Python dependency)
- **CORS:** `cors` npm package
- **Environment Variables:** `dotenv`

### No Database
There is no database. The system is stateless — every scan request is self-contained. No user accounts, no scan history.

### Deployment (optional, not required for academic submission)
- Frontend: Vercel
- Backend: Render

---

## 3. Folder Structure

```
legal-risk-scanner/
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Upload.jsx           # Home page — document input
│   │   │   └── Results.jsx          # Results dashboard
│   │   ├── components/
│   │   │   ├── RiskMeter/
│   │   │   │   └── RiskMeter.jsx    # Circular score gauge
│   │   │   ├── FindingCard/
│   │   │   │   └── FindingCard.jsx  # Individual flagged clause card
│   │   │   ├── SeverityBadge/
│   │   │   │   └── SeverityBadge.jsx
│   │   │   └── MetricCard/
│   │   │       └── MetricCard.jsx   # Summary stat card
│   │   ├── hooks/
│   │   │   └── useScan.js           # API call hook
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                          # Node/Express backend
    ├── src/
    │   ├── knowledgeBase.js         # 20 legal risk rules
    │   ├── clauseSegmenter.js       # NLP preprocessing
    │   ├── inferenceEngine.js       # Forward chaining engine
    │   ├── riskScorer.js            # Score + label calculator
    │   └── index.js                 # Express app + routes
    ├── .env
    └── package.json
```

---

## 4. Backend — Expert System Core

### 4.1 Clause Segmenter (`clauseSegmenter.js`)

Splits raw document text into individual evaluable clauses.

**Logic:**
1. Split on sentence boundaries — punctuation (`.!?`) followed by whitespace and a capital letter or digit.
2. Filter out clauses shorter than 40 characters (headings, page numbers, artefacts).
3. Return an array of objects: `{ text: string, index: number }`.

```js
const segmentClauses = (rawText) => {
  return rawText
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((text, index) => ({ text: text.trim(), index }))
    .filter(c => c.text.length > 40)
}

module.exports = { segmentClauses }
```

---

### 4.2 Knowledge Base (`knowledgeBase.js`)

The heart of the expert system. A JavaScript array of rule objects. Each rule has:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique rule identifier (R001–R020) |
| `category` | string | Risk category label shown to user |
| `severity` | `'high'` / `'medium'` / `'low'` | Risk severity |
| `keywords` | string[] | Trigger keywords (informational only) |
| `condition` | `(clauseText: string) => boolean` | Firing condition function |
| `explanation` | string | Plain-English explanation of the risk |
| `recommendation` | string | Actionable advice for the user |

**Helper function:**
```js
const hasKeyword = (text, keywords) =>
  keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()))
```

**Complete Knowledge Base — all 20 rules:**

```js
const knowledgeBase = [
  {
    id: 'R001',
    category: 'Termination Without Notice',
    severity: 'high',
    keywords: ['terminate', 'termination', 'end contract', 'dismiss'],
    condition: (clause) =>
      hasKeyword(clause, ['terminate', 'termination', 'dismiss']) &&
      !hasKeyword(clause, ['notice', 'days', 'weeks', 'months']),
    explanation: 'A termination clause was found with no notice period. The contract can be ended without any warning.',
    recommendation: 'Negotiate a minimum 30-day written notice period before termination takes effect.'
  },
  {
    id: 'R002',
    category: 'Non-Compete Restriction',
    severity: 'high',
    keywords: ['non-compete', 'non compete', 'competing business', 'competitor'],
    condition: (clause) =>
      hasKeyword(clause, ['non-compete', 'non compete', 'competing business', 'competitor']),
    explanation: 'A non-compete clause was detected. You may be restricted from working in the same industry or for competing companies after leaving.',
    recommendation: 'Check the geographic scope and duration carefully. Non-competes longer than 12 months or with broad geographic scope are often unenforceable.'
  },
  {
    id: 'R003',
    category: 'IP Ownership Assignment',
    severity: 'high',
    keywords: ['intellectual property', 'invention', 'work product', 'created by employee'],
    condition: (clause) =>
      hasKeyword(clause, ['intellectual property', 'work product', 'invention', 'created during']) &&
      hasKeyword(clause, ['owned by', 'belongs to', 'assigned to', 'property of']),
    explanation: 'An IP assignment clause was detected. Any work you create — potentially including personal projects made outside working hours — may be owned by the employer.',
    recommendation: 'Request a carve-out for inventions developed outside of work hours using personal resources, with no relation to the company\'s business.'
  },
  {
    id: 'R004',
    category: 'Unilateral Modification',
    severity: 'high',
    keywords: ['reserves the right', 'may change', 'sole discretion', 'modify at any time'],
    condition: (clause) =>
      hasKeyword(clause, ['reserves the right', 'may change', 'sole discretion', 'modify at any time', 'amend at its discretion']),
    explanation: 'One party can unilaterally modify the terms of this agreement without your consent.',
    recommendation: 'Push for a clause requiring mutual written agreement signed by both parties before any modification takes effect.'
  },
  {
    id: 'R005',
    category: 'Penalty / Liquidated Damages',
    severity: 'medium',
    keywords: ['penalty', 'liquidated damages', 'forfeit', 'deduction', 'breach of contract'],
    condition: (clause) =>
      hasKeyword(clause, ['penalty', 'liquidated damages', 'forfeit', 'financial penalty']),
    explanation: 'A penalty clause was found. You may owe a fixed sum of money if you breach certain conditions, regardless of actual harm caused.',
    recommendation: 'Ensure the penalty amount is proportionate to the actual damage. Courts may void grossly excessive penalty clauses.'
  },
  {
    id: 'R006',
    category: 'Mandatory Arbitration',
    severity: 'medium',
    keywords: ['arbitration', 'binding arbitration', 'waive right to sue', 'dispute resolution'],
    condition: (clause) =>
      hasKeyword(clause, ['arbitration', 'binding arbitration', 'waive right to sue', 'arbitrator']),
    explanation: 'A mandatory arbitration clause was detected. You may be waiving your right to pursue legal action in a court of law.',
    recommendation: 'Check whether arbitration is binding, whether you waive the right to a class-action suit, and who bears the arbitration costs.'
  },
  {
    id: 'R007',
    category: 'Auto-Renewal Clause',
    severity: 'medium',
    keywords: ['automatically renew', 'auto-renewal', 'auto renewal', 'unless cancelled'],
    condition: (clause) =>
      hasKeyword(clause, ['automatically renew', 'auto-renewal', 'auto renewal', 'automatically extended', 'unless cancelled']),
    explanation: 'This contract will automatically renew unless you actively cancel it by a specific deadline.',
    recommendation: 'Note the cancellation deadline in your calendar. Ensure the notice period required to cancel is reasonable (ideally 30 days or less).'
  },
  {
    id: 'R008',
    category: 'Unlimited Liability',
    severity: 'high',
    keywords: ['unlimited liability', 'fully liable', 'solely responsible', 'all damages'],
    condition: (clause) =>
      hasKeyword(clause, ['unlimited liability', 'fully liable', 'solely responsible for all', 'all losses and damages']),
    explanation: 'This clause may expose you to unlimited financial liability with no cap on damages.',
    recommendation: 'Negotiate a liability cap, typically equal to the total contract value or a fixed reasonable amount.'
  },
  {
    id: 'R009',
    category: 'Confidentiality (Overbroad)',
    severity: 'medium',
    keywords: ['confidential', 'non-disclosure', 'proprietary information', 'trade secret'],
    condition: (clause) =>
      hasKeyword(clause, ['confidential', 'non-disclosure', 'proprietary']) &&
      !hasKeyword(clause, ['except', 'excluding', 'does not include', 'publicly available']),
    explanation: 'A confidentiality clause was found with no exceptions. This may prevent you from disclosing information that is already publicly known or that you already knew before signing.',
    recommendation: 'Ensure the NDA carves out: (a) information already public, (b) information you knew prior to the agreement, (c) information independently developed by you.'
  },
  {
    id: 'R010',
    category: 'No Severance',
    severity: 'medium',
    keywords: ['no severance', 'not entitled to severance', 'no separation pay'],
    condition: (clause) =>
      hasKeyword(clause, ['no severance', 'not entitled to severance', 'no separation pay', 'waive severance']),
    explanation: 'This clause explicitly removes your entitlement to severance pay upon termination.',
    recommendation: 'Negotiate a severance formula (e.g., one week per year of service) to be included in writing.'
  },
  {
    id: 'R011',
    category: 'Unilateral Salary Deduction',
    severity: 'high',
    keywords: ['deduct from salary', 'deducted from wages', 'salary deduction', 'withhold payment'],
    condition: (clause) =>
      hasKeyword(clause, ['deduct from salary', 'deducted from wages', 'salary deduction', 'withhold payment', 'recover from salary']),
    explanation: 'The employer may deduct amounts from your salary without requiring separate authorisation.',
    recommendation: 'Any salary deduction should require your written consent each time it occurs. Push for this to be stated explicitly.'
  },
  {
    id: 'R012',
    category: 'Choice of Jurisdiction',
    severity: 'low',
    keywords: ['jurisdiction', 'governing law', 'courts of', 'subject to the laws of'],
    condition: (clause) =>
      hasKeyword(clause, ['jurisdiction', 'governing law', 'courts of', 'subject to the laws of']),
    explanation: 'This clause specifies which country or state\'s laws govern the contract and where disputes must be resolved.',
    recommendation: 'Ensure the jurisdiction is convenient for you. If it specifies a foreign jurisdiction, legal action becomes significantly more expensive and complex.'
  },
  {
    id: 'R013',
    category: 'No Ownership of Work After Termination',
    severity: 'medium',
    keywords: ['return all materials', 'delete all copies', 'no right to retain', 'revert to company'],
    condition: (clause) =>
      hasKeyword(clause, ['return all materials', 'delete all copies', 'no right to retain', 'revert to company']),
    explanation: 'Upon termination you may be required to return or destroy all work materials, losing access to anything you created.',
    recommendation: 'Ensure you retain copies of work relevant to your personal portfolio under a clearly defined permitted use clause.'
  },
  {
    id: 'R014',
    category: 'Probation Period Clause',
    severity: 'low',
    keywords: ['probation', 'probationary period', 'trial period'],
    condition: (clause) =>
      hasKeyword(clause, ['probation', 'probationary period', 'trial period']) &&
      hasKeyword(clause, ['terminate', 'dismissed', 'end employment']),
    explanation: 'A probation period clause was found that allows termination with reduced or no notice during the probation window.',
    recommendation: 'Clarify the exact duration of the probation period and what notice (if any) is required to terminate during it.'
  },
  {
    id: 'R015',
    category: 'Indemnification Clause',
    severity: 'high',
    keywords: ['indemnify', 'indemnification', 'hold harmless', 'defend and indemnify'],
    condition: (clause) =>
      hasKeyword(clause, ['indemnify', 'indemnification', 'hold harmless', 'defend and indemnify']),
    explanation: 'An indemnification clause requires you to compensate the other party for losses, damages, or legal costs arising from your actions.',
    recommendation: 'Limit indemnification to losses directly caused by your own gross negligence or willful misconduct — not general errors or third-party claims.'
  },
  {
    id: 'R016',
    category: 'Exclusion of Consequential Damages',
    severity: 'low',
    keywords: ['consequential damages', 'indirect damages', 'loss of profits', 'special damages'],
    condition: (clause) =>
      hasKeyword(clause, ['consequential damages', 'indirect damages', 'loss of profits', 'special damages']) &&
      hasKeyword(clause, ['not liable', 'exclude', 'waive', 'disclaim']),
    explanation: 'The other party is excluding liability for indirect losses such as lost profits or business opportunities, even if caused by their breach.',
    recommendation: 'Consider whether this exclusion is fair relative to the risk you are taking on under the agreement.'
  },
  {
    id: 'R017',
    category: 'Non-Solicitation Clause',
    severity: 'medium',
    keywords: ['non-solicitation', 'non solicitation', 'solicit employees', 'solicit clients'],
    condition: (clause) =>
      hasKeyword(clause, ['non-solicitation', 'non solicitation', 'solicit employees', 'solicit clients', 'poach']),
    explanation: 'A non-solicitation clause was found. You may be prohibited from recruiting the company\'s employees or approaching their clients after leaving.',
    recommendation: 'Check the duration. More than 12 months is generally considered excessive. Geographic and role-based limits should also be specified.'
  },
  {
    id: 'R018',
    category: 'Unilateral Assignment of Contract',
    severity: 'medium',
    keywords: ['assign this agreement', 'transfer this agreement', 'assign its rights', 'successor company'],
    condition: (clause) =>
      hasKeyword(clause, ['assign this agreement', 'transfer this agreement', 'assign its rights', 'successor']) &&
      !hasKeyword(clause, ['consent', 'written approval', 'prior approval']),
    explanation: 'The other party can transfer this contract to a third party (e.g., if the company is acquired) without requiring your consent.',
    recommendation: 'Add a clause stating that assignment requires your prior written consent, which shall not be unreasonably withheld.'
  },
  {
    id: 'R019',
    category: 'Waiver of Class Action',
    severity: 'high',
    keywords: ['class action', 'class-action', 'waive class', 'individual basis only'],
    condition: (clause) =>
      hasKeyword(clause, ['class action', 'class-action', 'waive class', 'individual basis only']),
    explanation: 'You are waiving your right to participate in a class-action lawsuit. Disputes must be resolved individually, which increases your cost of seeking legal recourse.',
    recommendation: 'This waiver is often bundled with mandatory arbitration. Consider negotiating its removal entirely.'
  },
  {
    id: 'R020',
    category: 'Force Majeure (Asymmetric)',
    severity: 'low',
    keywords: ['force majeure', 'act of god', 'circumstances beyond control'],
    condition: (clause) =>
      hasKeyword(clause, ['force majeure', 'act of god', 'circumstances beyond control']) &&
      hasKeyword(clause, ['employer', 'company', 'licensor']) &&
      !hasKeyword(clause, ['employee', 'both parties', 'either party']),
    explanation: 'A force majeure clause was found that may only protect one party (typically the employer or company), leaving you exposed to obligations even in extraordinary circumstances.',
    recommendation: 'Ensure the force majeure clause applies symmetrically to both parties.'
  }
]

module.exports = { knowledgeBase, hasKeyword }
```

---

### 4.3 Inference Engine (`inferenceEngine.js`)

Implements **forward chaining**. Iterates over every clause, checks it against every rule in order, fires the first matching rule (conflict resolution: first-match wins per clause), and stores the finding in working memory.

```js
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
```

---

### 4.4 Risk Scorer (`riskScorer.js`)

Computes a 0–100 risk score and assigns a label.

**Severity weights:**
- `high` → 30 points
- `medium` → 15 points
- `low` → 5 points
- Score is capped at 100.

**Risk labels:**
- Score ≥ 70 → `High Risk` (red)
- Score ≥ 40 → `Moderate Risk` (amber)
- Score < 40 → `Low Risk` (green)

```js
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
```

---

### 4.5 Express API (`index.js`)

**Single endpoint:** `POST /api/scan`

**Request body:**
```json
{
  "text": "string — raw extracted document text"
}
```

**Response:**
```json
{
  "findings": [
    {
      "ruleId": "R001",
      "category": "Termination Without Notice",
      "severity": "high",
      "explanation": "...",
      "recommendation": "...",
      "matchedClause": "The employer may terminate this agreement at any time.",
      "clauseIndex": 4
    }
  ],
  "riskScore": 75,
  "riskLabel": "High Risk",
  "color": "red",
  "clauseCount": 38
}
```

**Error response (400):**
```json
{ "error": "Document too short or empty." }
```

**Full implementation:**
```js
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
    if (!text || text.trim().length < 100)
      return res.status(400).json({ error: 'Document too short or empty. Please paste at least a paragraph of text.' })

    const clauses = segmentClauses(text)
    const findings = runInferenceEngine(clauses)
    const riskScore = calculateRiskScore(findings)
    const { label: riskLabel, color } = getRiskLabel(riskScore)

    res.json({ findings, riskScore, riskLabel, color, clauseCount: clauses.length })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' })
  }
})

app.post('/api/scan/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const data = await pdfParse(req.file.buffer)
    const text = data.text

    if (!text || text.trim().length < 100)
      return res.status(400).json({ error: 'Could not extract readable text from this PDF.' })

    const clauses = segmentClauses(text)
    const findings = runInferenceEngine(clauses)
    const riskScore = calculateRiskScore(findings)
    const { label: riskLabel, color } = getRiskLabel(riskScore)

    res.json({ findings, riskScore, riskLabel, color, clauseCount: clauses.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse PDF.' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

**server/package.json:**
```json
{
  "name": "legal-scanner-server",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1",
    "compromise": "^14.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 5. Frontend — Pages and Components

### 5.1 App.jsx — Routing

Two routes:
- `/` → `Upload` page
- `/results` → `Results` page (receives scan data via React Router state)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Upload from './pages/Upload'
import Results from './pages/Results'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

### 5.2 useScan Hook (`hooks/useScan.js`)

Handles both text scan and PDF scan API calls.

```js
import { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const useScan = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const scanText = async (text) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API_BASE}/api/scan`, { text })
      return res.data
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const scanPDF = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post(`${API_BASE}/api/scan/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse PDF.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { scanText, scanPDF, loading, error }
}

export default useScan
```

---

### 5.3 Upload Page (`pages/Upload.jsx`)

**Layout:** Two-column on desktop, single column on mobile.

**Left column:**
- Label: "Paste your contract text"
- Large `<textarea>` (min 300px tall), placeholder: "Paste the full text of your rental agreement, employment contract, or NDA here..."
- "Scan Document" button (primary, full width)

**Right column:**
- Label: "Or upload a PDF"
- Drag-and-drop PDF upload zone
  - Accepts `.pdf` only
  - Shows filename once selected
  - "Scan PDF" button

**Behaviour:**
- On submit (either path), call the appropriate `useScan` method
- Show a loading spinner/skeleton while scanning
- On success, navigate to `/results` using React Router's `useNavigate`, passing scan data via state: `navigate('/results', { state: { data } })`
- On error, show inline error message below the input
- Disable the scan button if textarea is empty or no file selected

**Design notes:**
- Clean white background
- The textarea and PDF zone should have a light gray dashed border (`border-dashed border-2 border-gray-200`)
- Primary button: indigo/blue (`bg-indigo-600 hover:bg-indigo-700`)
- A short hero text at the top: "Know what you're signing." with a subtitle: "Paste or upload a legal document to automatically identify risky clauses."

---

### 5.4 Results Page (`pages/Results.jsx`)

Reads scan data from React Router location state. If no state, redirect to `/`.

**Layout (top to bottom):**

1. **Header bar** — "Legal Document Risk Scanner" title + "Scan Another Document" button (navigates back to `/`)

2. **Summary section (4 metric cards in a row):**
   - Total Clauses Scanned
   - Risks Flagged
   - High Severity
   - Medium Severity

3. **Risk Score section:**
   - Large circular gauge showing the score (0–100)
   - Colour: red if High Risk, amber if Moderate Risk, green if Low Risk
   - Risk label text below the gauge: "High Risk" / "Moderate Risk" / "Low Risk"

4. **Findings list:**
   - Heading: "Flagged Clauses"
   - If no findings: show a green success banner — "No significant risks detected. This document appears to be relatively fair."
   - Otherwise: render one `FindingCard` per finding, sorted by severity (high first, then medium, then low)

5. **Footer note:** "This tool is not a substitute for legal advice. Consult a qualified lawyer for serious contracts."

---

### 5.5 RiskMeter Component (`components/RiskMeter/RiskMeter.jsx`)

An SVG-based circular gauge.

**Props:**
- `score: number` (0–100)
- `label: string` ("High Risk" / "Moderate Risk" / "Low Risk")
- `color: string` ("red" / "amber" / "green")

**Implementation approach:**
- SVG circle with `stroke-dasharray` and `stroke-dashoffset` to animate the arc
- Use Framer Motion to animate the arc from 0 to the actual score on mount
- Color map: `red → #EF4444`, `amber → #F59E0B`, `green → #22C55E`
- Display the score number in the center of the circle (large, bold)
- Display the label below the circle

---

### 5.6 FindingCard Component (`components/FindingCard/FindingCard.jsx`)

**Props:**
```ts
{
  ruleId: string
  category: string
  severity: 'high' | 'medium' | 'low'
  explanation: string
  recommendation: string
  matchedClause: string
  clauseIndex: number
}
```

**Layout:**
- Card with white background, border, rounded corners, subtle shadow
- Top row: `SeverityBadge` on the left, category name (bold) on the right
- "Matched clause" section: light gray background block showing the exact clause text in italic (truncated to 3 lines with a "Show more" toggle)
- "Risk" section: explanation text
- "Recommendation" section: recommendation text, with a lightbulb icon prefix
- Animate in with Framer Motion `fadeInUp` on mount, staggered by index

---

### 5.7 SeverityBadge Component (`components/SeverityBadge/SeverityBadge.jsx`)

**Props:** `severity: 'high' | 'medium' | 'low'`

**Colour map:**
- `high` → red background, red text (`bg-red-100 text-red-700`)
- `medium` → amber background, amber text (`bg-amber-100 text-amber-700`)
- `low` → blue background, blue text (`bg-blue-100 text-blue-700`)

Pill shape, uppercase text, small font size.

---

### 5.8 MetricCard Component (`components/MetricCard/MetricCard.jsx`)

**Props:** `label: string`, `value: number | string`

Simple card with muted label above and large bold number below. Light gray background (`bg-gray-50`).

---

### 5.9 Tailwind Config (`tailwind.config.js`)

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
}
```

**client/package.json dependencies:**
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "framer-motion": "^10.16.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.0"
  }
}
```

---

## 6. Environment Variables

**server/.env:**
```
PORT=5000
```

**client/.env:**
```
VITE_API_URL=http://localhost:5000
```

---

## 7. API Contract Summary

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/scan` | `{ text: string }` | `{ findings[], riskScore, riskLabel, color, clauseCount }` |
| POST | `/api/scan/pdf` | `multipart/form-data` with `file` field | Same as above |

---

## 8. Data Models

### Finding Object
```ts
{
  ruleId: string          // e.g. "R001"
  category: string        // e.g. "Termination Without Notice"
  severity: 'high' | 'medium' | 'low'
  explanation: string     // Plain-English risk description
  recommendation: string  // Actionable advice
  matchedClause: string   // The exact clause text that triggered this rule
  clauseIndex: number     // Position in the document
}
```

### Scan Response Object
```ts
{
  findings: Finding[]
  riskScore: number       // 0–100
  riskLabel: string       // "High Risk" | "Moderate Risk" | "Low Risk"
  color: string           // "red" | "amber" | "green"
  clauseCount: number     // Total clauses evaluated
}
```

---

## 9. Animations (Framer Motion)

| Element | Animation |
|---|---|
| Upload page hero text | Fade in + slide up on mount |
| Results page summary cards | Staggered fade in (0.1s delay per card) |
| RiskMeter arc | Animate from 0 to score over 1.2s on mount |
| FindingCards | Staggered fade in + slide up (0.08s delay per card) |
| Error messages | Shake animation on appear |

---

## 10. Framer Motion Animation Variants (reusable)

```js
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 }
  }
}

export const cardVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 }
}
```

---

## 11. Development Setup Instructions

```bash
# Clone / initialise
mkdir legal-risk-scanner && cd legal-risk-scanner

# Backend
mkdir server && cd server
npm init -y
npm install express cors multer pdf-parse compromise dotenv
npm install -D nodemon
mkdir src
# Create src/index.js, src/knowledgeBase.js, src/clauseSegmenter.js,
# src/inferenceEngine.js, src/riskScorer.js with the code from Section 4

# Frontend
cd ..
npm create vite@latest client -- --template react
cd client
npm install axios framer-motion react-router-dom react-hook-form
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# Configure tailwind.config.js content paths
# Add @tailwind directives to index.css

# Run both (from root)
# Terminal 1:
cd server && npm run dev
# Terminal 2:
cd client && npm run dev
```

---

## 12. Key Implementation Notes for the AI Coding Assistant

1. **No database.** Every request is fully self-contained. Do not add MongoDB, Prisma, or any persistence layer.
2. **No authentication.** No login, no sessions, no JWT. The app is fully public.
3. **No comments in code.** Write clean, self-documenting code without comment lines.
4. **Framer Motion on all transitions.** Do not use CSS transitions — use Framer Motion for all animations.
5. **Knowledge base is pure JS.** Do not convert it to JSON — the `condition` field is a live function and cannot be serialised.
6. **Findings are sorted before rendering:** high → medium → low severity order on the Results page.
7. **PDF upload uses `multer` with `memoryStorage()`** — do not write files to disk.
8. **The `clauseSegmenter` regex** uses a JS lookbehind — ensure Node.js v10+ (Node 20 fully supports this).
9. **React Router navigation to Results** passes the full scan response via `location.state`. The Results page must guard against missing state (redirect to `/` if state is null).
10. **The RiskMeter is SVG-based**, not a third-party chart library. Build it from scratch using SVG `circle` with `stroke-dasharray`.
11. **Error handling on the frontend**: any API error should show an inline red error message, not a full-page error screen.
12. **Mobile responsive**: the Upload page is two columns on `md:` and above, single column on mobile. The Results page metric cards are a 2×2 grid on mobile and 4-in-a-row on `md:` and above.

---

## 13. Sample Test Documents

To test the system, use any of these freely available contract types pasted as plain text:

- A standard Indian residential rental agreement (search: "simple rental agreement India template")
- An IT company offer letter / employment contract
- A freelance services NDA template

**Expected results on a typical employment contract:**
- Rules fired: R001 (no notice), R002 (non-compete), R003 (IP ownership), R015 (indemnification)
- Risk Score: ~75–90
- Risk Label: High Risk

**Expected results on a simple freelance NDA:**
- Rules fired: R006 (arbitration), R009 (confidentiality overbroad)
- Risk Score: ~20–30
- Risk Label: Low Risk

---

*End of Master Document. All information required to build the complete Legal Document Risk Scanner is contained above. Build each file in the order: server modules (knowledgeBase → clauseSegmenter → inferenceEngine → riskScorer → index) then client (hooks → components → pages → App).*
