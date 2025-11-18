# Political Promise Tracker – Project Comparison Document

This document mirrors the structure and intent of your existing `POLITICAL_PROMISE_TRACKER_PROMPT.md`, but describes the current repository’s implementation for side‑by‑side comparison. It highlights technologies used, architecture, endpoints, schemas, client pages/components, AI integration, environment, and roadmap.

## 🚀 Overview
- Purpose: Track political promises by Indian ministers, ingest related news, and compute performance metrics.
- Style: React SPA front end with an Express API, MongoDB (or in‑memory) persistence, optional Gemini‑powered imports/summaries.

## 🧩 Technologies Used
- Backend: `Node.js`, `Express`, `cors`, `morgan`, `dotenv`
- Auth: `bcryptjs` (password hashing), `jsonwebtoken` (JWT), role‑based middleware
- Database: `mongoose` (MongoDB ODM), `mongodb-memory-server` (fallback in-memory DB for dev)
- News ingestion: `rss-parser`
- AI integration: `@google/generative-ai` (Gemini), custom strict‑JSON prompts
- Frontend: `React 19`, `Vite 7`, `react-router-dom`, `Tailwind CSS`, `PostCSS` + `autoprefixer`
- UI/UX: `AOS` (scroll animations), `Framer Motion` (animations), `react-icons`
- Charts: `Chart.js`, `react-chartjs-2`
- Tooling: `ESLint` with React Hooks & Refresh plugins, `@vitejs/plugin-react`, `nodemon`

## 🏗️ Technical Architecture

**Backend & API**
- `Express` app with JSON body parsing and CORS
- Authentication via `JWT` (`/api/auth/login`, role stored on token)
- Admin‑guarded routes using middleware (`requireAuth`, `requireAdmin`)
- DB connection chooses `MONGO_URI` if set, else spins up in‑memory MongoDB

**Frontend**
- `React` SPA created with `Vite`
- Routing via `react-router-dom`
- Styling via `Tailwind` classes and a small set of custom components
- Charts and analytics rendered client‑side using `Chart.js`

**AI Integration**
- Optional Gemini usage for importing ministers/promises and summarizing news
- Strict JSON prompts (no prose) to match server schemas

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api` (configurable via `.env` and client `VITE_API_URL`)

**Auth**
- `POST /auth/signup` – register viewer user
- `POST /auth/login` – returns JWT and user info
- `GET /auth/me` – returns authenticated user info (via token)

**Ministers**
- `GET /ministers` – list; optional `?q=` search
- `GET /ministers/:id` – detail
- `GET /ministers/:id/dashboard` – aggregate: profile, promises, metrics, recent news
- `POST /ministers` – create (auth required)
- `PUT /ministers/:id` – update (auth required)
- `DELETE /ministers/:id` – delete (auth required)

**Promises**
- `GET /promises` – list; optional `?status=&minister=`
- `GET /promises/:id` – detail
- `POST /promises` – create (auth required)
- `PUT /promises/:id` – update (auth required)
- `DELETE /promises/:id` – delete (auth required)

**News**
- `GET /news` – (internals managed via admin refresh and import routes)

**Performance**
- `GET /performance/summary` – minister rankings (completion rate etc.)
- `GET /performance/trends?minister=&months=12` – monthly buckets by status

**Admin**
- `POST /admin/refresh` – admin‑only; fetch RSS feeds, optionally summarize via Gemini, recompute monthly metrics

**Import**
- `POST /import/ministers` – admin‑only; import from payload or built‑in dataset (or AI)
- `POST /import/promises` – admin‑only; import from payload or AI, upserts promises
- `POST /import/promises-from-news` – admin‑only; infer promises from recent news items, link and recompute metrics

## 🗄️ Database Schema (Mongoose)

**User**
- `name` string (required)
- `email` string (required, unique)
- `passwordHash` string (required)
- `role` enum `admin|viewer` (default `viewer`)

**Minister**
- `name` string (required)
- `ministry` string (required)
- `portfolio` string
- `photoUrl` string
- `bio` string
- `party` string
- `constituency` string
- `termStart` date
- `termEnd` date
- `socialMedia` object

**Promise**
- `minister` ObjectId → `Minister` (required)
- `title` string (required)
- `description` string
- `category` string
- `dateMade` date (required)
- `deadline` date
- `status` enum `pending|in_progress|completed|broken` (default `pending`)
- `sourceUrl` string
- `verificationUrl` string
- `priority` enum `low|medium|high` (default `medium`)
- `tags` array of strings
- `evidence` string (verbatim commitment language, where available)

**NewsUpdate**
- `promise` ObjectId → `Promise` (optional)
- `headline` string (required)
- `summary` string
- `source` string
- `url` string (unique index)
- `sentiment` string
- `relevanceScore` number
- `publishedAt` date

**PerformanceMetric**
- `minister` ObjectId → `Minister` (required)
- `monthYear` date
- `totalPromises` number
- `completedPromises` number
- `brokenPromises` number
- `completionRate` number
- `ranking` number
- `score` number

## 🖥️ Frontend Pages & Components

**Pages**
- `Dashboard` – charts, stats, leaderboard, distribution
- `Ministers` – searchable list
- `MinisterDetail` – profile, promises, metrics, recent news
- `Promises` – list with filters
- `News` – latest ingested items
- `Admin` – login and manual actions
- `Privacy` – data and privacy notes

**Layout & UI Components**
- `Navbar`, `Hero`, `Footer`, `GlassCard`
- Charts: `CompletionChart`, `MonthlyTrendChart`, `StatusDistributionChart`
- Data views: `PromiseTracker`, `Leaderboard`, `StatsGrid`

## 🔄 Data Flow & E2E Ops
- Admin creates/updates an admin account via script: `npm run --prefix server create:admin`
- Admin logs in (`/api/auth/login`) and uses JWT in client `apiPost`
- Seed/import ministers and promises via `/api/import/*` endpoints
- Refresh news (`/api/admin/refresh`) to ingest RSS and compute metrics
- Optionally use Gemini scripts: `npm run --prefix server import:gemini`

## ⚙️ Environment & Config
- Server `.env`:
  - `MONGO_URI` – Mongo connection; if unset, in‑memory DB is used
  - `JWT_SECRET` – JWT signing
  - `PORT` – API port (default `5000`)
  - `GEMINI_API_KEY` – enable Gemini features
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` – scripts
  - `API_BASE_URL` – scripts base URL
- Client `.env`:
  - `VITE_API_URL` – API base, defaults to `http://localhost:5000`

## 🚢 Deployment Notes
- Back end: Node + MongoDB (Atlas or managed)
- Front end: Vite build → static hosting (Netlify, Vercel, etc.)
- Environment: set `MONGO_URI`, `JWT_SECRET`, `VITE_API_URL` per environment

## 📊 Analytics & Visualization
- Completion rate leaderboard (`/api/performance/summary` → Dashboard)
- Status distribution and monthly trend charts
- Minister dashboard aggregates promises, metrics, and recent news

## 🤖 AI Integration Details
- Strict JSON prompts for ministers and promises
- Optional Gemini summarization of recent news in admin refresh
- `promises-from-news` includes heuristic extraction; AI‑sourced imports require evidence text

## 🔍 Comparison to Original Prompt Document
- Previous plan: `Next.js 14` + App Router, SSR/ISR, SSE/WebSockets envisioned
- Current build: `Express API` + `React (Vite)` SPA; no SSR by default
- Real‑time: not implemented; metrics recomputed on admin actions
- AI: Gemini optional; scripts and admin route support strict JSON ingestion
- Data sources: RSS feeds of Indian news outlets; no scraping in core
- Charts: `Chart.js` (instead of Recharts); animations via `AOS` + `Framer Motion`

## 🗺️ Roadmap (to align closer to the original plan)
- Add SSR or server components (migrate to Next.js) if needed
- Implement real‑time updates (SSE/WebSockets) for live status changes
- Expand AI extraction and validation pipeline; add source credibility scoring
- Introduce role‑based UI for admin vs viewer
- Harden error handling and add tests; CI lint/build checks
- Add SEO, accessibility checks, and production monitoring

## 🎯 Success Metrics
- API response time under 500ms for typical list views
- Stable ingestion from configured RSS feeds
- Accurate minister‑promise linking and metric computation
- Frontend performance: fast, mobile‑friendly rendering

## 🔗 Useful Scripts
- `server`: `dev`, `start`, `seed`, `fetch:news`, `inspect:news`, `create:admin`, `import:gemini`
- `client`: `dev`, `build`, `preview`, `lint`