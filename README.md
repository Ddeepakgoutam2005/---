# Political Promise Tracker

An end-to-end web application to track political promises by Indian ministers, fetch related news from RSS feeds, and visualize completion performance over time.

## Overview

- Frontend: React + Vite + Tailwind CSS UI with charts and routing.
- Backend: Node.js + Express with JWT authentication and admin-only operations.
- Database: MongoDB via Mongoose models (in-memory fallback for development).
- Data: RSS feeds ingested for news; ministers, promises, and performance metrics persisted.

## Technologies

- Client
  - `react`, `react-dom`, `react-router-dom` for SPA routing
  - `vite` for dev server/build
  - `tailwindcss` + `postcss` + `autoprefixer` for styling
  - Animations: `aos`, `framer-motion`
  - Charts: `chart.js`, `react-chartjs-2`
  - Linting: `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`

- Server
  - `express` for API server
  - `cors`, `morgan` for CORS and request logging
  - `dotenv` for environment configuration
  - `jsonwebtoken` for JWT auth
  - `bcryptjs` for password hashing
  - `mongoose` for ODM
  - `rss-parser` for RSS ingestion
  - Dev tooling: `nodemon`
  - Dev DB: `mongodb-memory-server` for no-config local development

## Project Structure

```
client/               # React app
  src/
    pages/            # Dashboard, Ministers, MinisterDetail, Promises, News, Admin
    components/       # Charts, Leaderboard, Stats
    lib/api.js        # API helpers (GET/POST, token storage)
server/               # Express API
  src/
    routes/           # auth, admin, ministers, promises, news, performance, import
    models/           # User, Minister, Promise, PerformanceMetric
    middleware/       # requireAuth, requireAdmin
    utils/db.js       # Mongo connection & in-memory fallback
  scripts/            # seed, fetchNews, inspectNews, createAdmin
```

## Environment Variables

Server `.env` (see `server/.env.example`):

- `PORT` – API server port (default `5000`)
- `MONGO_URI` – MongoDB connection string. If omitted, an in-memory DB starts.
- `JWT_SECRET` – Secret for signing JWT tokens

Client `.env.development` (optional):

- `VITE_API_URL` – Base URL for API (defaults to `http://localhost:5000` in `api.js` if not set)

## Database

- Default database name: `political_promise_tracker` (from `.env.example`)
- Collections and key fields:
  - `users`
    - `name`, `email` (unique), `passwordHash`, `role` (`admin` | `viewer`)
  - `ministers`
    - `name`, `ministry`, `portfolio?`, `photoUrl?`, `bio?`, `party?`, `constituency?`, `termStart?`, `termEnd?`, `socialMedia?`
  - `promises`
    - `minister` (ref `ministers`), `title`, `description?`, `category?`, `dateMade`, `deadline?`, `status` (`pending` | `in_progress` | `completed` | `broken`), `sourceUrl?`, `verificationUrl?`, `priority` (`low` | `medium` | `high`), `tags[]`
  - `performancemetrics`
    - `minister` (ref `ministers`), `monthYear`, `totalPromises`, `completedPromises`, `brokenPromises`, `completionRate`, `ranking?`, `score?`

## API Endpoints

Base: `http://localhost:<PORT>/api`

- Auth (`/auth`)
  - `POST /signup` – Register user
  - `POST /login` – Login and get JWT; returns `{ token, user }`
  - `GET /me` – Validate token and return user info

- Admin (`/admin`) – requires `Authorization: Bearer <token>` and `role=admin`
  - `POST /refresh` – Fetch RSS feeds and optionally recompute monthly metrics
    - Body: `{ feeds?: string[], saveNews?: boolean, recomputeMetrics?: boolean }`

- Import (`/import`) – requires admin
  - `POST /ministers` – Seed or upsert ministers with basic profile, photo, bio
    - Body: `{ ministers?: Minister[] }` (optional; defaults to embedded dataset)

- Ministers (`/ministers`)
  - `GET /` – List ministers (optional query `q` for name filter)
  - `GET /:id` – Get minister by ID
  - `GET /:id/dashboard` – Aggregate profile, promises, metrics, recent news
  - `POST /` – Create minister (auth required)
  - `PUT /:id` – Update minister (auth required)
  - `DELETE /:id` – Delete minister (auth required)

- Promises (`/promises`)
  - `GET /` – List promises (filters: `status`, `minister`)
  - `GET /:id` – Get promise by ID
  - `POST /` – Create promise (auth required)
  - `PUT /:id` – Update promise (auth required)
  - `DELETE /:id` – Delete promise (auth required)

- News (`/news`)
  - `GET /` – List saved news items
  - `POST /fetch` – Fetch articles from a feed (no save)
  - `POST /fetch-and-save` – Fetch from feed and upsert to DB

- Performance (`/performance`)
  - `GET /summary` – Ranked completion rates per minister
  - `GET /trends` – Monthly trend with completion rate, optional `minister` and `months`

## Authentication & Authorization

- JWT-based auth; token is obtained via `POST /api/auth/login`
- Client stores token using `client/src/lib/api.js` (`setToken`, `getToken`)
- Protected routes use `requireAuth`, admin-only routes additionally use `requireAdmin`

## Setup & Development

1. Server
   - `cd server`
   - Create `.env` (or edit `.env.example`)
   - Install deps: `npm install`
   - Create an admin user: `npm run create:admin` (defaults: name `Admin`, email `admin@example.com`, password `admin123`, role `admin`)
   - Start server: `npm run dev` (nodemon) or `npm start`

2. Client
   - `cd client`
   - Install deps: `npm install`
   - Start dev: `npm run dev` (Vite). Open the printed `http://localhost:517x/` URL.

3. Seed data (optional)
   - With real `MONGO_URI`, use `server/scripts/seed.js` or Admin page `Import Ministers` to upsert seeded ministers with photos and bios.

## Admin Workflow

- Visit `/admin` to login (email/password)
  - Toggle dark/light mode using the navbar switch.
  - Sticky, blurred navbar and glassmorphism cards are enabled.
- Use controls:
  - `Refresh Data` – calls `/api/admin/refresh` with selected options
  - `Import Ministers` – calls `/api/import/ministers` (admin-only)

## Frontend Pages

- `/` Dashboard – overview stats and charts
- `/ministers` – searchable directory with photos and bio snippets
- `/ministers/:id` – minister profile, performance cards, monthly trends, promises
- `/promises` – list of promises
- `/news` – latest saved news; admin-only refresh button appears when logged in
- `/admin` – login and admin controls

## Scripts

- `server/scripts/createAdmin.js` – create/promote an admin user
- `server/scripts/seed.js` – seed demo ministers and promises
- `server/scripts/fetchNews.js` – fetch RSS programmatically
- `server/scripts/inspectNews.js` – inspect saved news
 - `server/scripts/geminiImport.js` – import ministers and promises using Gemini (optional)

### Gemini Import (optional)

- Configure environment in `server/.env`:
  - `API_BASE_URL` (e.g., `http://localhost:5000`)
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (used for script auth)
  - `GEMINI_API_KEY` (your Google Generative Language API key)
  - Optional: `GEMINI_MINISTERS_PROMPT`, `GEMINI_PROMISES_PROMPT`
- Run: `cd server && npm run import:gemini`
- The script will:
  - Login (or auto-signup) an admin and get a token
  - Generate JSON with Gemini; if unavailable, fallback to built-in datasets
  - Upsert ministers and promises via `/api/import/ministers` and `/api/import/promises`

## Notes

- Without `MONGO_URI`, the server uses an in-memory MongoDB for quick starts.
- JWT secret falls back to `dev_secret` if `JWT_SECRET` is not set (development only).
- RSS feeds default to BBC World and Times of India; can be overridden via request body.