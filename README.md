# Legal Document Risk Scanner

Rule-based legal clause risk scanner for pasted text and uploaded PDFs.

## Stack

- Frontend: React + Vite + Tailwind + Framer Motion
- Backend: Node.js + Express + Multer + pdf-parse
- State: Stateless request/response scanning (no database)

## Repository Layout

- client: frontend app
- server: backend API and inference engine

## Setup

1. Backend dependencies
- `cd server`
- `npm install`

2. Frontend dependencies
- `cd ../client`
- `npm install`

## Run

1. Start backend
- `cd server`
- `npm run dev`

2. Start frontend
- `cd client`
- `npm run dev`

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Note: If port 5173 is busy, Vite auto-selects the next available port.

## Environment Variables

- `server/.env`
  - `PORT=5000`
- `client/.env`
  - `VITE_API_URL=http://localhost:5000`

## Backend API

1. `POST /api/scan`
- Body: `{ "text": "..." }`
- Response: `{ findings, riskScore, riskLabel, color, clauseCount }`

2. `POST /api/scan/pdf`
- Body: multipart form-data with `file`
- Response: same as `/api/scan`

## Quality Checks

- Frontend lint: `cd client && npm run lint`
- Frontend build: `cd client && npm run build`
- Backend start smoke: `cd server && npm run start`

## Scope Constraints

- No database layer
- No authentication or user accounts
- No persistence of scan history
