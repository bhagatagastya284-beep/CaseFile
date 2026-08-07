# Casefile

**AI-Powered Self-Evolving Autonomous Research Agent — MVP**

Casefile turns a single research topic into a complete, evidence-backed report with
almost no further user interaction. Give it a topic (and optionally some reference
documents), click **Start Research**, and it will:

1. Break the topic into a structured set of research questions
2. Search the web for relevant sources
3. Read those pages (and any uploaded PDFs/DOCX/TXT) and pull out relevant evidence
4. Synthesize the evidence into an executive summary, findings, conclusion and recommendations
5. Attach a citation (source, URL, retrieved date, confidence score) to every piece of evidence
6. Assemble everything into a final Markdown report, renderable as HTML and exportable as PDF

Everything is saved per-project so a user can come back later, review the plan,
sources, evidence, and report, or re-run the research.

---

## Table of Contents

- [Who it's for](#who-its-for)
- [Feature checklist vs. spec](#feature-checklist-vs-spec)
- [Tech stack & why](#tech-stack--why)
- [High-level architecture](#high-level-architecture)
- [The autonomous research pipeline](#the-autonomous-research-pipeline)
- [Project structure](#project-structure)
- [Database schema](#database-schema-mongodb--mongoose)
- [REST API reference](#rest-api-reference)
- [Frontend pages & components](#frontend-pages--components)
- [Security measures](#security-measures)
- [Environment variables](#environment-variables)
- [Running the project](#running-the-project)
- [Docker](#docker)
- [Suggested demo script](#suggested-demo-script)
- [MVP scope — what's deliberately excluded](#mvp-scope--whats-deliberately-excluded)
- [Troubleshooting](#troubleshooting)

---

## Who it's for

Researchers, students, business analysts, journalists, product teams, and startup
founders who want to go from "I have a question" to "I have a cited report" without
manually opening twenty browser tabs.

## Feature checklist vs. spec

| Spec area | Status | Where |
|---|---|---|
| Auth (register/login/logout/JWT) | ✅ | `backend/src/controllers/authController.js` |
| Dashboard (stats, recent research) | ✅ | `frontend/src/pages/Dashboard.jsx` |
| New Research (topic, description, uploads) | ✅ | `frontend/src/pages/Research.jsx` |
| Research Planner (topic → sub-questions) | ✅ | `ai-engine/planner/planner.js` |
| Web Search (multi-query, dedupe, rank) | ✅ | `ai-engine/search/searchOrchestrator.js` (Tavily) |
| Website Reader (title/author/date/body, strips nav/ads/comments) | ✅ | `ai-engine/parser/websiteReader.js` (cheerio) |
| PDF/DOCX/TXT Reader | ✅ | `ai-engine/parser/documentParser.js` (pdf-parse, mammoth) |
| Research Memory (reopen projects) | ✅ | MongoDB persistence, `GET /api/projects/:id` |
| AI Summarizer (exec summary, findings, conclusion, recommendations) | ✅ | `ai-engine/summarizer/summarizer.js` |
| Citation Generator (source, URL, date, confidence) | ✅ | `ai-engine/citations/citationGenerator.js` |
| Report Generator (Markdown, HTML, PDF) | ✅ | `ai-engine/report/reportGenerator.js` |
| Export (Markdown, PDF) | ✅ | `GET /api/ai/:id/export?format=md|pdf` |
| Security (Helmet, JWT, rate limiting, sanitization, file validation) | ✅ | `backend/src/middleware/*` |
| Logging (Morgan + Winston) | ✅ | `backend/src/utils/logger.js`, `backend/src/app.js` |
| Graceful error handling | ✅ | `backend/src/middleware/errorHandler.js`, AI fallbacks |
| Docker deployment | ✅ | `docker/`, `docker-compose.yml` |

## Tech stack & why

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS | Fast dev server, no build config boilerplate, utility CSS matches the "dark, minimal, blue accent" spec quickly |
| Routing | React Router v6 | Standard SPA routing, nested layouts for auth vs. app shell |
| State | Context API (`AuthContext`) | Auth is the only truly global state needed for an MVP — no need for Redux/Zustand |
| HTTP | Axios | Interceptors handle JWT attach + 401 auto-logout in one place |
| Backend | Node.js + Express | Minimal, unopinionated, matches the spec directly |
| Database | MongoDB + Mongoose | Document shape fits research artifacts (plans, evidence, reports) better than rigid relational tables; matches the "backend use MongoDB" requirement |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) | Stateless, simple, standard for an SPA + REST API |
| AI | OpenAI Chat Completions (JSON mode) | Structured, parseable output for plans/summaries; model is configurable via `OPENAI_MODEL` |
| Web search | Tavily API | Purpose-built for LLM research agents, simple REST, generous free tier |
| HTML parsing | Cheerio | Fast server-side jQuery-like DOM parsing to strip nav/ads/comments and extract article text |
| Document parsing | pdf-parse, mammoth | Lightweight, no native binary dependencies, good enough for MVP text extraction |
| PDF report export | pdfkit | Generates PDFs directly in Node without a headless browser (Puppeteer would add ~300MB and a Chromium download — overkill and fragile for an MVP judged live) |
| Markdown → HTML | markdown-it | Used to render the report preview and for the HTML report artifact |

## High-level architecture

```
┌────────────┐      HTTPS/JSON       ┌─────────────┐      Mongoose        ┌─────────┐
│  frontend  │ ───────────────────▶  │   backend   │ ───────────────────▶ │ MongoDB │
│  (React)   │ ◀─────────────────── │  (Express)  │ ◀─────────────────── │         │
└────────────┘      JWT-authed       └──────┬──────┘                      └─────────┘
                                             │ require()
                                             ▼
                                     ┌───────────────┐      HTTPS      ┌────────────┐
                                     │   ai-engine    │ ──────────────▶ │  OpenAI    │
                                     │ (plain Node    │                 └────────────┘
                                     │  modules, no   │      HTTPS      ┌────────────┐
                                     │  HTTP server)  │ ──────────────▶ │  Tavily    │
                                     └───────┬────────┘                 └────────────┘
                                             │ axios/cheerio
                                             ▼
                                     ┌───────────────┐
                                     │  Live websites │
                                     └───────────────┘
```

`ai-engine` is **not** a microservice — it's a plain set of Node modules that the
backend `require()`s directly (see `backend/src/services/researchOrchestrator.js`).
This keeps the MVP simple to run (one process, no inter-service networking) while
still keeping AI logic cleanly separated from HTTP/DB concerns, matching the spec's
folder layout. It has its own `package.json`/`node_modules` since it sits as a
*sibling* of `backend/`, not a parent.

## The autonomous research pipeline

Triggered by `POST /api/ai/:id/run`, orchestrated in
`backend/src/services/researchOrchestrator.js`. It runs **asynchronously** (the API
responds `202 Accepted` immediately) and updates the `Project` document's
`status`/`stage`/`progress` fields as it advances — the frontend polls
`GET /api/projects/:id` every 3 seconds while a project is running and renders that
as a live timeline + progress bar.

| # | Stage (`project.status`) | What happens | Module |
|---|---|---|---|
| 1 | `planning` | Topic + description sent to OpenAI (JSON mode) to produce 4–6 categorized sub-questions (e.g. Overview, Key Drivers, Competitive Landscape, Risks, Future Outlook). **Falls back** to a fixed 5-category template if `OPENAI_API_KEY` isn't set or the call fails. | `ai-engine/planner/planner.js` |
| 2 | `searching` | Runs one Tavily search per sub-question, merges results, **dedupes by URL** (keeping the highest relevance score), sorts by relevance. Skipped with a logged warning if `TAVILY_API_KEY` isn't set. | `ai-engine/search/searchOrchestrator.js` |
| 3 | `reading` | For every collected source: fetches the page, strips `nav/header/footer/script/style/ads/comments/sidebar/menu` etc. with Cheerio, extracts title/author/published date (from meta tags) and body text. Also parses any uploaded documents (PDF/DOCX/TXT). Both feed into a keyword-overlap evidence extractor that picks the most relevant paragraphs (no embeddings/vector search — deliberately out of MVP scope, see below). | `ai-engine/parser/websiteReader.js`, `ai-engine/parser/documentParser.js`, `ai-engine/evidence/evidenceExtractor.js` |
| 4 | `analyzing` | All evidence snippets + the research questions are sent to OpenAI to produce a structured `{ executiveSummary, findings[], conclusion, recommendations }`. Falls back to a plain listing of the raw evidence if no API key or no evidence was found. | `ai-engine/summarizer/summarizer.js` |
| 5 | `analyzing` → `writing` | Citations are built deterministically per evidence item: source name, URL, retrieved date, and a **confidence score** heuristically blended from the source's search relevance score and extracted-text length (no extra AI call needed — fast and reproducible). | `ai-engine/citations/citationGenerator.js` |
| 6 | `writing` → `completed` | Assembles the final report as Markdown (Title, Introduction, Research Questions, Sources, Evidence, Findings, Recommendations, Conclusion, References), renders it to HTML with markdown-it, and writes a PDF with pdfkit. All three are stored on the `Report` document. | `ai-engine/report/reportGenerator.js` |

If any stage throws, the pipeline catches it, sets `project.status = 'failed'` with
`project.error` populated (shown in the UI), and stops — it never crashes the Node
process. Every stage transition is also written to the `Log` collection.

**Design note:** vector embeddings / semantic search are intentionally not used for
evidence extraction (out of MVP scope). Instead, `evidenceExtractor.js` scores
paragraphs by keyword overlap with the topic + question text — simpler, zero extra
API cost, and "good enough" for an MVP demo. This would be the first thing to
upgrade in a v2.

## Project structure

```
casefile/
├── frontend/                    React + Vite + Tailwind SPA
│   ├── src/
│   │   ├── pages/               Login, Register, Dashboard, Research, ResearchDetails,
│   │   │                        Reports, Profile, Settings, NotFound
│   │   ├── components/          Navbar, Sidebar, ResearchCard, SourceCard, EvidenceCard,
│   │   │                        CitationCard, PlannerTimeline, SearchLoader, ProgressBar,
│   │   │                        MarkdownViewer, UploadBox, ReportPreview, ProtectedRoute
│   │   ├── layouts/              MainLayout (sidebar+navbar shell), AuthLayout
│   │   ├── context/              AuthContext (Context API — user, login, register, logout)
│   │   └── services/              api.js (Axios instance + interceptors), authService.js,
│   │                              projectService.js
│   └── vite.config.js, tailwind.config.js, index.html
│
├── backend/                     Express REST API
│   └── src/
│       ├── config/               env.js, db.js
│       ├── models/               User, Project, ResearchPlan, Source, Evidence, Report,
│       │                         Document, Log (all Mongoose schemas)
│       ├── middleware/           auth (JWT), errorHandler, rateLimiter, upload (Multer)
│       ├── controllers/          authController, projectController, fileController, aiController
│       ├── routes/               authRoutes, projectRoutes, fileRoutes, aiRoutes
│       ├── services/              researchOrchestrator.js — runs the full AI pipeline
│       └── utils/                 logger (Winston), ApiError, asyncHandler, generateToken
│   ├── uploads/                  Uploaded files + generated PDF reports (gitignored)
│   └── logs/                     Winston log files (gitignored)
│
├── ai-engine/                   Standalone Node modules (its own package.json)
│   ├── planner/planner.js
│   ├── search/searchOrchestrator.js
│   ├── parser/websiteReader.js, documentParser.js
│   ├── evidence/evidenceExtractor.js
│   ├── summarizer/summarizer.js
│   ├── citations/citationGenerator.js
│   ├── report/reportGenerator.js
│   ├── prompts/                 planner.md, summarizer.md, citation.md, report.md, research.md
│   └── openaiClient.js          Shared OpenAI wrapper with retry logic
│
├── docker/                      backend.Dockerfile, frontend.Dockerfile, nginx.conf
├── docs/API.md                  Full REST API reference
├── scripts/                     setup.sh / setup.ps1 (install deps + create .env files)
└── docker-compose.yml           mongo + backend + frontend
```

## Database schema (MongoDB / Mongoose)

| Collection | Key fields | Purpose |
|---|---|---|
| **User** | `name, email (unique), password (bcrypt hash, select:false)` | Account/auth |
| **Project** | `title, description, owner (→User), status (draft\|planning\|searching\|reading\|analyzing\|writing\|completed\|failed), stage (string), progress (0-100), error` | One research project; `status/stage/progress` drive the live UI |
| **ResearchPlan** | `projectId (→Project), mainQuestion, questions[{ question, category, order }]` | Output of the planning stage |
| **Source** | `projectId, url, title, author, publishedDate, domain, snippet, relevanceScore, fetchedAt` | One per deduped search result / read page |
| **Evidence** | `projectId, sourceId (→Source, nullable), content, url, source, confidence, retrievedDate` | Extracted snippets, from web sources or uploaded documents (`sourceId: null`) |
| **Report** | `projectId, title, markdown, html, pdfPath, executiveSummary, recommendations, conclusion` | Final generated report artifact |
| **Document** | `projectId, uploadedBy (→User), filename, originalName, mimeType, size, path, extractedText, status (uploaded\|parsed\|failed)` | Uploaded PDF/DOCX/TXT reference files |
| **Log** | `projectId (nullable), level (info\|warn\|error), stage, message, meta` | Pipeline execution audit trail, also mirrored to Winston |

All collections that belong to a project cascade-delete when the project is deleted
(`projectController.deleteProject`).

## REST API reference

Base URL: `http://localhost:5000/api`. All routes except `/auth/register` and
`/auth/login` require `Authorization: Bearer <jwt>`. Full detail also in `docs/API.md`.

### Auth
| Method | Route | Body / Notes |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` → `{ user, token }` |
| POST | `/auth/login` | `{ email, password }` → `{ user, token }` |
| POST | `/auth/logout` | Stateless — client discards the token |
| GET | `/auth/profile` | Current user |
| PUT | `/auth/profile` | `{ name }` |

### Projects
| Method | Route | Notes |
|---|---|---|
| POST | `/projects` | `{ title, description }` — creates in `draft` status |
| GET | `/projects` | Paginated list for the current user (`?page=&limit=`) |
| GET | `/projects/:id` | Returns `{ project, plan, sources, evidence, report, documents }` |
| PUT | `/projects/:id` | Update title/description |
| DELETE | `/projects/:id` | Deletes project + all related plan/sources/evidence/report/documents |
| GET | `/projects/stats/dashboard` | `{ total, completed, inProgress, reports, recent[] }` |

### Files
| Method | Route | Notes |
|---|---|---|
| POST | `/files/upload` | `multipart/form-data`: `projectId`, `file` (PDF/DOCX/TXT, ≤25MB). Text is extracted asynchronously right after upload. |
| GET | `/files?projectId=` | List documents |
| DELETE | `/files/:id` | Deletes the file from disk + DB |

### AI Pipeline
| Method | Route | Notes |
|---|---|---|
| POST | `/ai/:id/run` | Starts the full pipeline in the background. Returns `202` immediately. Rejects `409` if already running. |
| GET | `/ai/:id/citations` | Returns the citation list for a project |
| GET | `/ai/:id/export?format=md\|pdf` | Downloads the report |

## Frontend pages & components

**Pages:** `Login`, `Register` (auth, redirect to dashboard if already logged in) ·
`Dashboard` (stat tiles, recharts pie of completed/in-progress/reports, recent
projects) · `Research` (new-research form: topic, description, drag-drop file
upload, "Start Research") · `ResearchDetails` (live `PlannerTimeline` + `ProgressBar`,
tabs for Plan / Sources / Evidence / Report / Citations, re-run button, MD/PDF
export) · `Reports` (list of all completed projects) · `Profile` (edit name) ·
`Settings` (informational — API keys are backend env vars) · `NotFound` (404).

**Key components:** `Sidebar`/`Navbar` (app shell), `ProtectedRoute` (redirects to
`/login` if unauthenticated), `PlannerTimeline` (6-stage visual tracker),
`ProgressBar`, `UploadBox` (drag/drop + click, file chips), `MarkdownViewer`
(react-markdown + remark-gfm + Tailwind Typography), `ReportPreview` (renders the
report + Markdown/PDF export buttons), `SourceCard`, `EvidenceCard`, `CitationCard`,
`ResearchCard`.

**Auth flow:** `AuthContext` stores the JWT + user in `localStorage`, restores the
session on load via `GET /auth/profile`, and the Axios interceptor in
`services/api.js` attaches the bearer token to every request and force-logs-out on
any `401`.

## Security measures

- **Helmet** — sets standard secure HTTP headers (CSP, HSTS, X-Content-Type-Options, etc.)
- **JWT auth** — stateless tokens, `protect` middleware validates on every protected route, passwords hashed with bcrypt (10 rounds), password field excluded from queries by default (`select: false`)
- **Rate limiting** — global API limiter (300 req/15min) + a stricter auth limiter (20 req/15min) on register/login to slow brute-force attempts
- **NoSQL injection protection** — `express-mongo-sanitize` strips `$`/`.` operators from request bodies/params/query
- **File upload validation** — Multer `fileFilter` allow-lists only PDF/DOCX/TXT MIME types and enforces a 25MB size cap; random filenames prevent path traversal/overwrite
- **CORS** — locked to `FRONTEND_URL`, not wildcard
- **Ownership checks** — every project/file/AI route scopes queries to `owner: req.user._id` / `uploadedBy: req.user._id`, so users cannot read or modify each other's data
- **Centralized error handling** — a single Express error middleware normalizes all errors to `{ success:false, message }`, never leaks stack traces to the client, logs 5xx server-side
- **Compression** — gzip via `compression` middleware

## Environment variables

### `backend/.env` (see `backend/.env.example`)
| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend HTTP port | `5000` |
| `NODE_ENV` | `development` \| `production` | `development` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/casefile` |
| `JWT_SECRET` | Signing secret for auth tokens | *(must be set)* |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `OPENAI_API_KEY` | Enables AI planning/summarization | *(empty = fallback mode)* |
| `OPENAI_MODEL` | Chat model to use | `gpt-4o-mini` |
| `OPENAI_TEMPERATURE` | Sampling temperature | `0.2` |
| `TAVILY_API_KEY` | Enables live web search | *(empty = search skipped)* |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `UPLOAD_PATH` | Where uploaded files/reports are stored | `uploads` |
| `MAX_UPLOAD_MB` | Max upload size | `25` |

### `frontend/.env` (see `frontend/.env.example`)
| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## Running the project

**Prerequisites:** Node.js 18+, MongoDB (local install or Docker).

```bash
# 1. Install everything + create .env files
./scripts/setup.sh          # macOS/Linux/git-bash
./scripts/setup.ps1         # Windows PowerShell

# 2. Edit backend/.env — at minimum set JWT_SECRET;
#    add OPENAI_API_KEY / TAVILY_API_KEY for full AI behavior

# 3. Make sure MongoDB is running, e.g.:
docker compose up -d mongo

# 4. Run both apps (two terminals)
cd backend && npm run dev    # http://localhost:5000
cd frontend && npm run dev   # http://localhost:5173
```

Or step by step manually:

```bash
cd backend && npm install && cp .env.example .env && npm run dev
cd frontend && npm install && cp .env.example .env && npm run dev
```

## Docker

```bash
docker compose up --build
```

Brings up MongoDB (port 27017), the backend API (port 5000), and the frontend served
via nginx (port 5173) as three containers on one network. Pass `OPENAI_API_KEY` /
`TAVILY_API_KEY` / `JWT_SECRET` as environment variables (or edit
`docker-compose.yml` directly) before building.

## Suggested demo script

A ~3 minute walkthrough that hits every feature in the spec:

1. **Register** a new account → land straight on the Dashboard (empty state).
2. **New Research** → topic: *"Impact of AI in Healthcare"*, optionally attach a PDF, click **Start Research**.
3. On the **Research Details** page, watch the `PlannerTimeline` move through Planning → Searching → Reading → Analyzing → Writing → Completed in real time (polled every 3s).
4. Click through the tabs: **Plan** (the generated sub-questions), **Sources** (deduped/ranked search results), **Evidence** (extracted snippets with confidence), **Report** (full Markdown report), **Citations** (source/URL/date/confidence per evidence item).
5. Export the report as **Markdown** and **PDF** from the Report tab.
6. Go to **Dashboard** — the new project now shows up in stats and recent research.
7. Go to **Reports** — see it listed as a completed report, reopen it.
8. Mention the **graceful-degradation story**: even with no `OPENAI_API_KEY`/`TAVILY_API_KEY` configured, the exact same flow still runs end-to-end using a rule-based plan and skips web search cleanly — nothing crashes, which was verified with a live smoke test (register → project → run pipeline → export, against a real MongoDB instance).

## MVP scope — what's deliberately excluded

Per the spec, the following are intentionally **out of scope** for this MVP, so the
team can speak confidently to "what's next" if asked: browser automation
(Playwright), computer control, autonomous self-modification, multi-agent
orchestration, vector databases / embeddings pipelines / long-term semantic memory,
OCR for scanned PDFs, team/real-time collaboration, notifications, email
integration, a plugin ecosystem, model fine-tuning, speech I/O, and a mobile app.

The system is built so it **degrades gracefully** rather than breaking when
`OPENAI_API_KEY` / `TAVILY_API_KEY` are missing — the planner falls back to a fixed
question template and the summarizer explains what's missing instead of crashing,
so the app is fully demoable even without any external API keys.

## Troubleshooting

- **Backend won't start / `MongoDB connection failed`** — make sure MongoDB is running and `DATABASE_URL` in `backend/.env` is correct (`docker compose up -d mongo` is the fastest way to get one locally).
- **`Cannot find module ...` under `ai-engine/`** — `ai-engine` has its own `package.json`; run `npm install` inside `ai-engine/` as well as `backend/` (the setup scripts do this automatically once you re-run them, or run it manually: `cd ai-engine && npm install`).
- **Research gets stuck in `searching`/`analyzing` forever** — check `backend/logs/combined.log` or the console; without API keys these stages log a warning and continue automatically rather than hanging, so a stuck stage usually means a network/firewall issue reaching OpenAI/Tavily.
- **401 redirect loop on the frontend** — the JWT likely expired (`JWT_EXPIRES_IN`); log out and back in, or clear `localStorage`.
- **PDF export looks plain** — `reportGenerator.js` uses `pdfkit` for a lightweight, dependency-free PDF (no headless browser). It's intentionally simple typography for MVP speed/reliability, not a pixel-perfect HTML render.

See `docs/API.md` for the full REST API reference.
