# Legal Document Risk Scanner

A full-stack, rule-based legal clause risk scanner that analyzes pasted text and uploaded PDFs to identify potential legal risks. This tool operates without a database and processes everything completely statelessly.

## 🌟 Features

- **Text & PDF Scanning:** Paste plain text or upload PDF contracts for instant risk analysis.
- **Risk Scoring:** Analyzes legal clauses and assigns a risk score and label to highlight problematic terms.
- **Stateless Architecture:** No data is stored or persisted, ensuring your sensitive legal documents remain completely private.
- **Modern UI:** Built with React, Tailwind CSS, and Framer Motion for a smooth, responsive user experience.
- **Fast Backend Engine:** Node.js powered backend for parsing and scanning documents efficiently.

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express + Multer (File Uploads) + pdf-parse
- **State Management:** Stateless request/response (No database layer)

## 📋 Prerequisites

Before running this project, make sure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16.0.0 or higher recommended)
- npm (Node Package Manager)

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd "AI project"
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   cp .env.example .env  # Update PORT if needed
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   cp .env.example .env  # Update VITE_API_URL if needed
   ```

## 🚀 How to Run

To run the application locally, you will need two terminal windows.

**Terminal 1: Start the Backend Server**
```bash
cd server
npm run dev
```

**Terminal 2: Start the Frontend Client**
```bash
cd client
npm run dev
```

**Default URLs:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

*(Note: If port 5173 is busy, Vite will automatically select the next available port).*

## 🔌 API Reference

### 1. Scan Plain Text
- **Endpoint:** `POST /api/scan`
- **Body:** `{ "text": "Your legal text here..." }`
- **Response:** `{ "findings": [...], "riskScore": 45, "riskLabel": "Moderate Risk", "color": "yellow", "clauseCount": 10 }`

### 2. Scan PDF Document
- **Endpoint:** `POST /api/scan/pdf`
- **Body:** `multipart/form-data` with a `file` field containing the PDF.
- **Response:** Same format as the `/api/scan` endpoint.

## 🚧 Known Limitations & Constraints

- **No Persistence:** Scan history is not saved.
- **Rule-Based Engine:** The scanner relies on a predefined set of rules in the knowledge base, which may not catch all nuanced legal risks. It does not use Machine Learning inference.
- **No User Accounts:** There is no authentication or authorization layer.

## 🔮 Future Improvements

- Integrate an AI/LLM model for deeper semantic understanding of clauses.
- Add user accounts to save document history securely.
- Export scan results to a PDF report.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
