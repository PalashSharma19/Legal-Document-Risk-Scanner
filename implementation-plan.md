# Legal Document Risk Scanner - Section-Gated Implementation Plan

This plan is designed for step-by-step execution. The agent must complete one section at a time and wait for your approval before starting the next section.

## Execution Protocol (Mandatory)

1. Only one section can be active at a time.
2. After finishing a section, the agent must provide:
- What was implemented
- Files created or changed
- Verification done (run/build/tests/manual checks)
- Any blockers or assumptions
3. The agent must then ask for permission using this exact format:
- `Section <N> complete. Approve moving to Section <N+1>? (yes/no)`
4. The agent can proceed only after your explicit `yes`.
5. If you say `no`, the agent must revise the same section until you approve.

## Section 0 - Project Setup and Guardrails

Goal: Create the project skeleton and enforce non-negotiable constraints from the PRD.

Tasks:
- Initialize root workspace with `client` and `server` folders.
- Initialize npm projects for both apps.
- Configure baseline scripts.
- Add `.env` templates for client and server.
- Add a short `README.md` with run instructions.

Deliverables:
- Root structure matches PRD.
- `server/package.json` and `client/package.json` created.
- `server/.env` with `PORT=5000`.
- `client/.env` with `VITE_API_URL=http://localhost:5000`.

Validation:
- Folder tree matches PRD skeleton.
- `npm install` succeeds in both `client` and `server`.

Approval Gate Prompt:
- `Section 0 complete. Approve moving to Section 1? (yes/no)`

## Section 1 - Backend Core Modules (Expert System)

Goal: Implement the rule-based analysis engine modules in the required order.

Tasks:
- Implement `server/src/knowledgeBase.js` with all 20 rules and `hasKeyword` helper.
- Implement `server/src/clauseSegmenter.js` using the regex from PRD.
- Implement `server/src/inferenceEngine.js` with forward chaining and first-match-per-clause conflict resolution.
- Implement `server/src/riskScorer.js` with weighted scoring and risk labels.

Deliverables:
- Four backend core modules complete.
- Exports are consistent and importable.

Validation:
- Lint-free module imports/exports.
- Quick local node sanity check for sample clauses.

Approval Gate Prompt:
- `Section 1 complete. Approve moving to Section 2? (yes/no)`

## Section 2 - Backend API Layer

Goal: Expose scanning functionality via Express endpoints.

Tasks:
- Implement `server/src/index.js`.
- Configure `cors`, `dotenv`, JSON body parsing, and `multer.memoryStorage()`.
- Add `POST /api/scan` and `POST /api/scan/pdf`.
- Add error handling and expected 400/500 responses.

Deliverables:
- API endpoints return PRD-compliant JSON.
- PDF parsing works through `pdf-parse`.

Validation:
- Manual API tests for valid text, short/empty text, valid PDF, invalid upload.
- Confirm response fields: `findings`, `riskScore`, `riskLabel`, `color`, `clauseCount`.

Approval Gate Prompt:
- `Section 2 complete. Approve moving to Section 3? (yes/no)`

## Section 3 - Frontend Foundation

Goal: Set up React app structure, routing, and shared configuration.

Tasks:
- Set up Vite React app in `client`.
- Configure Tailwind and base styles.
- Implement router in `client/src/App.jsx` with `/` and `/results`.
- Create folder structure for pages, components, hooks.

Deliverables:
- App boots with route navigation foundation.
- Tailwind is active in the app.

Validation:
- `npm run dev` starts client successfully.
- Route navigation works without runtime errors.

Approval Gate Prompt:
- `Section 3 complete. Approve moving to Section 4? (yes/no)`

## Section 4 - Upload Flow and API Hook

Goal: Build intake experience for pasted text and PDF upload.

Tasks:
- Implement `client/src/hooks/useScan.js` with `scanText` and `scanPDF`.
- Build `client/src/pages/Upload.jsx` with:
- textarea path
- PDF upload path
- loading/error states
- disabled buttons until input exists
- navigate to results via `location.state`

Deliverables:
- Upload page fully functional for both text and PDF paths.

Validation:
- Successful scan routes to `/results` with response data.
- API errors render inline red error message.

Approval Gate Prompt:
- `Section 4 complete. Approve moving to Section 5? (yes/no)`

## Section 5 - Results Dashboard Components

Goal: Implement all result visualizations and finding cards.

Tasks:
- Implement `RiskMeter`, `FindingCard`, `SeverityBadge`, `MetricCard` components.
- Build `client/src/pages/Results.jsx` with redirect guard if state missing.
- Sort findings by severity: high, medium, low.
- Add Framer Motion animations per PRD.

Deliverables:
- Results page shows score, metrics, and findings list.
- Empty findings state shows fairness message.

Validation:
- Visual checks for risk color mapping and sorting correctness.
- Animation behavior confirmed on load.

Approval Gate Prompt:
- `Section 5 complete. Approve moving to Section 6? (yes/no)`

## Section 6 - End-to-End Verification and QA

Goal: Verify quality, correctness, and PRD compliance across stack.

Tasks:
- Run backend and frontend together.
- Execute representative text and PDF scans.
- Verify rule firing behavior against sample expected outputs.
- Validate mobile responsiveness and desktop layout.
- Check all error paths and edge cases.

Deliverables:
- QA checklist with pass/fail outcomes.
- Bug fixes for discovered issues.

Validation:
- No blocking runtime errors.
- Core flows complete successfully.

Approval Gate Prompt:
- `Section 6 complete. Approve moving to Section 7? (yes/no)`

## Section 7 - Final Hardening and Handoff

Goal: Prepare project for submission/use.

Tasks:
- Clean code consistency review.
- Confirm no database/auth was added.
- Ensure scripts and setup docs are complete.
- Provide concise handoff summary and known limitations.

Deliverables:
- Final runnable project and documentation.
- Handoff notes with commands and assumptions.

Validation:
- Fresh install run-through instructions verified.

Approval Gate Prompt:
- `Section 7 complete. Project implementation finished. Any final revisions?`

## Section Order Lock

Implementation must follow this strict order:
0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

No parallel section execution unless you explicitly authorize it.
