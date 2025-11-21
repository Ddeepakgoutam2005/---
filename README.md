# Political Promise Tracker

An end‑to‑end web application that tracks political promises made by Indian ministers, ingests related news, and presents performance analytics and dashboards.

## Overview
- Monorepo with `server` (Node/Express/Mongo) and `client` (React/Vite/Tailwind) apps
- Ingests RSS feeds, detects promise‑like articles, links them to ministers/promises, and computes monthly performance metrics
- Supports authentication (JWT) with admin tools to refresh data and run AI‑assisted classification

## Tech Stack
- Backend: `express`, `mongoose`, `rss-parser`, `jsonwebtoken`, `bcryptjs`
- DB: MongoDB; falls back to `mongodb-memory-server` for local/in‑memory runs
- Frontend: `react`, `vite`, `tailwindcss`, `react-router-dom`, `chart.js`, `react-chartjs-2`, `framer-motion`

## Architecture
- API server entry: `server/src/server.js`
  - Connects to DB, sets routes, seeds minimal demo data when using in‑memory DB
  - Routes under `/api/*` for auth, ministers, promises, news, performance, admin, import, queries
- Data models: `server/src/models/*`
  - `Minister`, `Promise`, `NewsUpdate`, `PromiseRelatedNews`, `PerformanceMetric`, `User`, `Query`, `ReviewQueue`
- Frontend entry: `client/src/main.jsx`, app shell in `client/src/App.jsx`
  - Pages for dashboard, ministers, minister detail, promises, news, auth, admin, queries

## Key Files
- Server
  - `server/src/server.js` – API bootstrap and route wiring
  - `server/src/utils/db.js` – Mongo connection with in‑memory fallback
  - `server/src/routes/*.js` – REST endpoints (auth, ministers, promises, news, performance, admin, import, queries)
  - `server/src/routes/adminGemini.js` – RSS ingestion + Gemini classification into `promise` / `critic` / `other`
  - `server/src/models/PromiseRelatedNews.js` – dedicated model for promise‑related criticism news
  - `server/scripts/*` – CLI scripts (seed, fetch news, inspect news, create admin, Gemini import)
  - `server/scripts/seedPromiseRelated.js` – example seeding of criticism items for a minister
- Client
  - `client/src/lib/api.js` – API base URL and helpers
  - `client/src/context/AuthContext.jsx` – JWT token management and current user state
  - `client/src/pages/*` – route pages
  - `client/src/components/*` – charts, cards, modals, protected route

## Data Model
- `Minister` – name, ministry, party, photo, bio, constituency
- `Promise` – minister ref, title, description, category, `dateMade`, optional `deadline`, `status` (`pending|in_progress|completed|broken`), `sourceUrl`
  - Note: `in_progress` is treated as `completed` in responses and analytics
- `NewsUpdate` – headline, summary, source, url, publishedAt, classification flags, linked `promise`
- `PromiseRelatedNews` – criticism/controversy news tied to a minister; links back to `NewsUpdate` via `newsUpdate`
- `PerformanceMetric` – per‑minister monthly metrics: totals, breakdown, rate, score
- `User` – name, email, password hash, role (`viewer|admin`)
- `Query` – user‑submitted report tied to a `news` or `promise`
- `ReviewQueue` – items queued for admin review (e.g., AI classifications)

## Backend API
- Auth: `/api/auth`
  - `POST /signup` – create viewer user
  - `POST /login` – JWT login
  - `GET /me` – current user info
- Ministers: `/api/ministers`
  - `GET /` – list ministers (search with `?q=`)
  - `GET /:id` – minister details
  - `GET /:id/dashboard` – minister, promises, metrics, recent news aggregate
  - `POST /` `PUT /:id` `DELETE /:id` – protected by JWT
- Promises: `/api/promises`
  - `GET /` – list promises; filters: `status`, `minister`
  - `GET /:id` – promise details
  - `POST /` `PUT /:id` `DELETE /:id` – protected by JWT
  - Status normalization: `in_progress` is returned as `completed`
- News: `/api/news`
  - `GET /` – list news (filters: `candidate=true|false`, `related=true|false`, `minister`, `limit`)
  - `POST /fetch` – parse one feed and return enriched items (no save)
  - `POST /fetch-and-save` – parse one feed, enrich, upsert into DB
  - `GET /related` – list promise‑related criticism (`PromiseRelatedNews`) filtered by `minister` and `limit`
- Performance: `/api/performance`
  - `GET /summary` – leaderboard with completion stats
  - `GET /trends?minister=&months=` – monthly breakdown with completion rate
- Admin: `/api/admin`
  - `POST /refresh` – pull multiple RSS feeds, heuristic classify, optional Gemini summarization, recompute metrics
  - `POST /refresh-gemini` – pull RSS feeds and classify each item with Gemini into `promise`, `critic` (promise‑related), or `other`; auto‑attach when confidence passes thresholds
  - `POST /cleanup-promises` – AI/heuristic validation to remove non‑promises
  - `POST /cleanup-news` – unlink weakly scored news from promises
  - `POST /fetch-minister-images` – Wikipedia images into `photoUrl`
- Import: `/api/import`
  - `POST /ministers` – upsert ministers (payload or built‑in dataset)
  - `POST /promises` – upsert promises (payload, Gemini, or heuristic from news)
  - `POST /promises-from-news` – infer promises from recent news
- Queries: `/api/queries`
  - `POST /` – viewer submits a query on `news` or `promise`
  - `GET /my` – current user queries
  - `GET /` – admin list with filters/pagination
  - `PUT /:id/status` – admin mark resolved

## Ingestion & Classification Workflow
1. Fetch feeds via `rss-parser` and store `NewsUpdate` items
2. Detect promise candidates using commitment phrases and minister name proximity heuristics
3. Run Gemini‑based classification to label each item as `promise`, `critic` (promise‑related), or `other`
   - `promise` → create/attach a `Promise` with `title`, `description`, `dateMade`, `deadline?`, `status`, `sourceUrl`, `evidence`
   - `critic` → create/attach a `PromiseRelatedNews` linked to the minister and `NewsUpdate`
   - `other` → remain in `NewsUpdate`
4. Link news to promises by `url` when applicable and update confidence/evidence
5. Recompute monthly `PerformanceMetric` for affected ministers

## Frontend Workflow
- Auth and token persistence via `AuthContext` and `useAuth`
- Pages
  - Dashboard: summary charts and tracker
  - Ministers: filter/search, profiles and badges
  - Minister Detail: profile, promise list, monthly trend, related news, reporting
  - Promises: status filter, related news, reporting
  - News: latest promise‑related items; admin can refresh feeds
  - Auth: signup/login; redirects based on role
  - Admin: login plus actions (refresh feeds, fetch images, run classifier)
  - Admin Queries: manage user reports
  - My Queries: viewer’s submitted reports

## Setup
### Prerequisites
- Node.js 18+
- MongoDB (optional for persistent storage)

### Environment
- Server `.env` (see `server/.env.example`):
  - `PORT` – server port
  - `MONGO_URI` – Mongo connection string; omit to use in‑memory DB
  - `JWT_SECRET` – secret for JWT signing
  - `API_BASE_URL` – used by scripts
  - Gemini: `GEMINI_API_KEY` (required to use `POST /api/admin/refresh-gemini`)
  - Optional prompt overrides: `GEMINI_CLASSIFIER_PROMPT`, `GEMINI_NEWS_TO_PROMISES_PROMPT`, `GEMINI_NEWS_CLASSIFIER_PROMPT`
- Client `.env`:
  - `VITE_API_URL` – API base, e.g., `http://localhost:5000`

### Install
```bash
cd server && npm install
cd ../client && npm install
```

### Run Dev
```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

### Seed & Admin
```bash
cd server
npm run seed           # demo ministers/promises
npm run create:admin   # create/update admin (credentials from .env)
node scripts/seedPromiseRelated.js  # example: seed criticism items for Nitin Gadkari
```

### Optional: Gemini Import
```bash
cd server
npm run import:gemini  # upserts ministers/promises via Gemini or fallback dataset
```

## Conventions & Notes
- Status handling: `in_progress` is surfaced as `completed` in API and charts for simplified reporting
- When `MONGO_URI` is not set, data is ephemeral (in‑memory) and seeded at startup
- Admin endpoints require `Authorization: Bearer <token>` and `role=admin`

## Frontend Navigation
- Top‑level routes are defined in `client/src/App.jsx` and page components under `client/src/pages/*`
- Protected admin views use `PrivateRoute` with role gating

## Troubleshooting
- API says Unauthorized: ensure JWT token is set; login via `/auth`
- No data loaded: run `npm run seed` or `POST /api/admin/refresh` after logging in as admin
- Charts empty: confirm performance endpoints reachable and promises exist
- `POST /api/admin/refresh-gemini` returns error: check `GEMINI_API_KEY` in `server/.env` is set