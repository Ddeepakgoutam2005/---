# Political Promise Tracker

A full-stack application that tracks political promises made by ministers and leaders, correlates them with news, and visualizes performance trends and completion rates.

## Overview
- Server: Express API with MongoDB (or in-memory Mongo for local dev), JWT auth, RSS ingestion, optional Gemini AI summarization/classification.
- Client: React (Vite) frontend with routing, charts, and dashboards.
- Data: Ministers, Promises, News Updates, Performance Metrics.

## Features
- Browse ministers, view profiles, portfolios, and basic badges.
- Track promises by status with minister associations and sources.
- Ingest Indian political news via RSS; deduplicate by URL; mark promise-related items.
- Admin actions to refresh news, import ministers, and infer promises from news.
- Performance analytics: summary leaderboard, status distribution, monthly trends.

## Tech Stack
- Server: `express`, `mongoose`, `jsonwebtoken`, `rss-parser`, `dotenv`, `mongodb-memory-server` (dev fallback).
- Client: `react`, `vite`, `react-router-dom`, `chart.js` with `react-chartjs-2`, `tailwindcss`, `framer-motion`, `aos`.

## Repository Structure
```
Capstone/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/          # Dashboard, Ministers, Promises, News, Admin, Privacy
│   │   ├── components/     # Charts and UI components
│   │   └── lib/api.js      # API helper and auth token store
│   └── .env(.development)  # VITE_API_URL
├── server/                 # Express API server
│   ├── src/
│   │   ├── routes/         # auth, ministers, promises, news, performance, admin, import
│   │   ├── models/         # User, Minister, Promise, NewsUpdate, PerformanceMetric
│   │   ├── utils/db.js     # Mongo connection (supports in-memory dev)
│   │   └── server.js       # App bootstrap
│   ├── scripts/            # Admin/CLI utilities
│   └── .env.example        # Server env template
└── README.md               # You are here
```

## Quick Start
Prerequisites:
- Node.js 18+
- MongoDB (optional for dev; the server uses in-memory Mongo if `MONGO_URI` is not set)

1) Install dependencies
```
cd server && npm install
cd ../client && npm install
```

2) Configure environment
- Server: copy `server/.env.example` to `server/.env` and adjust:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/political_promise_tracker
JWT_SECRET=<generate-a-strong-secret>
API_BASE_URL=http://localhost:5000
# Optional Gemini config
# GEMINI_API_KEY=
# GEMINI_MINISTERS_PROMPT=
# GEMINI_PROMISES_PROMPT=
```
- Client: ensure `client/.env` contains:
```
VITE_API_URL=http://localhost:5000
```

3) Run in development
```
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```
- Server: `http://localhost:5000/` (API root)
- Client: Vite dev server (typically `http://localhost:5173/`)

4) Seed demo data (optional)
- In-memory mode auto-seeds a few ministers and promises on startup.
- For a real MongoDB, you can seed:
```
cd server
npm run seed
```

## Admin Setup
- Create Admin via script:
```
cd server
npm run create:admin
```
- Defaults: `ADMIN_EMAIL=admin@example.com`, `ADMIN_PASSWORD=admin123` (configurable via server `.env`).
- Login on the client at `/admin`, then use Admin actions:
  - Refresh Data (News + Metrics)
  - Import Ministers
  - Import Promises from News

## Client Application
Routes:
- `/` Dashboard: stats, completion charts, status distribution, leaderboard, tracker.
- `/ministers` List: search/filter by name, ministry, party; link to detail.
- `/ministers/:id` Detail: profile, counts, monthly trends, promises.
- `/promises` List: filter by status; shows recent promise-related news.
- `/news` Latest political news: admin can fetch and save; shows summaries.
- `/admin` Admin controls: login and data management actions.
- `/privacy` Static privacy page.

API usage helper (`client/src/lib/api.js`):
- `API_URL` from `VITE_API_URL` (default `http://localhost:5000`).
- `apiGet(path)`: JSON GET.
- `apiPost(path, body)`: JSON POST with optional `Authorization: Bearer <token>`.
- `setToken(token)`: stored in-memory in the client runtime.

## Server API
Root:
- `GET /` → `{ status: 'ok', message: 'Political Promise Tracker API' }`

Auth (`/api/auth`):
- `POST /signup` `{ name, email, password }` → create user.
- `POST /login` `{ email, password }` → `{ token, user }`.
- `GET /me` `Authorization: Bearer` → current user info.

Ministers (`/api/ministers`):
- `GET /` search via `?q=...` (regex on `name`).
- `GET /:id` minister by id.
- `GET /:id/dashboard` aggregated profile, promises, metrics, recent news.
- `POST /` (auth) create.
- `PUT /:id` (auth) update.
- `DELETE /:id` (auth) delete.

Promises (`/api/promises`):
- `GET /` filter via `?status=pending|completed|broken&minister=<id>`.
  - Note: backend and models normalize `in_progress` as `completed` in responses.
- `GET /:id` with populated `minister`.
- `POST /` (auth) create.
- `PUT /:id` (auth) update.
- `DELETE /:id` (auth) delete.

News (`/api/news`):
- `GET /` latest 50 `NewsUpdate` sorted by `createdAt`.
- `POST /fetch` `{ feed }` → fetch RSS and return filtered relevant articles.
- `POST /fetch-and-save` `{ feed }` → fetch RSS and upsert relevant articles.

Performance (`/api/performance`):
- `GET /summary` per-minister totals, completed (merges `in_progress`), broken, completion rate; sorted ranking.
- `GET /trends?minister=<id>&months=12` monthly buckets with derived completion rate.

Admin (`/api/admin`) [requires `Authorization: Bearer` with `role=admin`]:
- `POST /refresh` `{ feeds?, saveNews?, recomputeMetrics?, geminiSummarize? }` → batch fetch RSS across defaults, optional Gemini summarization, recompute metrics.
- `POST /cleanup-promises` `{ dryRun?, limit?, useAI?, minConfidence?, minister? }` → remove non-genuine promises; optional AI validation; recompute monthly metrics.

Import (`/api/import`) [admin-only]:
- `POST /ministers` `{ ministers? }` → upsert ministers (payload or embedded dataset).
- `POST /promises` `{ promises? }` → upsert promises (payload → Gemini → samples).
- `POST /promises-from-news` `{ limit? }` → infer promises from recent news (Gemini or heuristic), upsert, and update metrics.

## Data Models
User:
- `name`, `email` (unique), `passwordHash`, `role` in `['admin','viewer']`.

Minister:
- `name`, `ministry`, optional: `portfolio`, `photoUrl`, `bio`, `party`, `constituency`, `termStart`, `termEnd`, `socialMedia`.

Promise:
- `minister` (ref), `title`, optional: `description`, `category`, `dateMade`, `deadline`, `status` in `['pending','in_progress','completed','broken']`, `sourceUrl`, `verificationUrl`, `priority`, `tags[]`.
- Serialization transforms normalize `in_progress` to `completed` for consistency in UI.

NewsUpdate:
- `promise` (optional ref), `headline`, `summary`, `source`, `url` (unique), `sentiment`, `relevanceScore`, `publishedAt`, optional classification flags.

PerformanceMetric:
- `minister` (ref), `monthYear`, `totalPromises`, `completedPromises`, `brokenPromises`, `completionRate`, `ranking`, `score`.

## Scripts (server)
From `server/`:
- `npm run seed` → clear and seed demo ministers/promises.
- `npm run fetch:news` → fetch RSS feed and upsert items.
- `npm run inspect:news` → print latest saved news.
- `npm run create:admin` → create or update admin user.
- `npm run import:gemini` → login admin, call Gemini to import ministers and promises (fallback to dataset if missing).

## Configuration
- `MONGO_URI`: if omitted, the server uses `mongodb-memory-server` (non-persistent, good for local dev/demo).
- `JWT_SECRET`: required for production; a strong random string.
- `API_BASE_URL`: base URL used by `scripts/geminiImport.js`.
- `GEMINI_API_KEY`: optional; enables AI summarization/classification/import.
- `GEMINI_MINISTERS_PROMPT`, `GEMINI_PROMISES_PROMPT`: optional; override default prompts.
- Client `VITE_API_URL`: must point to the running API (default `http://localhost:5000`).

## Deployment Notes
- Use a real MongoDB and set `MONGO_URI`.
- Set a strong `JWT_SECRET` and create an admin account.
- Serve client build (`client/npm run build`) behind a web server; point `VITE_API_URL` to the deployed API.
- Disable in-memory DB in production by providing `MONGO_URI`.

## Known Behaviors & Limitations
- Status normalization: `in_progress` is treated as `completed` in responses/analytics.
- RSS relevance: simple keyword heuristic filters Indian political news; may include/exclude edge cases.
- Promise inference: AI requires `GEMINI_API_KEY`; without it, heuristics attempt fuzzy matching and commitment phrase detection.
- In-memory DB: great for demo but non-persistent; use real Mongo in production.

## Privacy & Security
- JWT-based auth with `requireAuth` and `requireAdmin` middleware protects write/admin routes.
- News URLs are indexed unique to avoid duplicates.
- Avoid committing secrets; use `.env` files.

## Contributing
- Open issues/PRs with clear descriptions.
- Keep changes focused and aligned with existing style.
- Add/update documentation when changing APIs or data models.