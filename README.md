# Political Promise Tracker

An end-to-end web application that tracks political promises made by Indian ministers, ingests related news using AI, and presents performance analytics and dashboards.

## 🚀 Features

- **Minister Dashboard**: detailed profiles, promise completion rates, and trend analysis.
- **Promise Tracking**: Categorized by status (Pending, In Progress, Fulfilled).
- **AI-Powered News**: Automatically fetches news, classifies it using Gemini AI, and links it to specific promises.
- **Performance Analytics**: Visual charts for monthly trends and completion statistics.
- **Admin Panel**: Tools for data seeding, news ingestion, and content management.
- **Responsive Design**: Modern UI with dark mode support.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Chart.js, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas or Local)
- **Containerization**: Docker & Docker Compose
- **AI Integration**: Google Gemini AI (for news classification)

---

## 🐳 Running with Docker (Recommended)

The easiest way to run the project after cloning from GitHub.

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Setup Environment Variables
Before building the containers, you **MUST** provide your API keys and secrets.

1. Create a `.env` file in the **root directory**:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and fill in your secrets:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `GEMINI_API_KEY`: Your key from [Google AI Studio](https://aistudio.google.com/).
   - `OPENROUTER_API_KEY`: Your OpenRouter or OpenAI key.
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID for social login.
   - `JWT_SECRET`: A long random string for session security.

> **Note**: These variables will be automatically passed to both the client and server containers during build.

### 3. Build and Start
Run this command in the root directory:
```bash
docker-compose up --build -d
```

### 4. Access the App
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 💻 Running Locally (Manual Setup)

If you prefer not to use Docker:

### 1. Install Dependencies
```bash
npm install
cd client && npm install --legacy-peer-deps
cd ../server && npm install --legacy-peer-deps
```

### 2. Configure Environment
1. Follow the same `.env` setup as described in the Docker section.
2. Ensure you have Node.js (v20+) and MongoDB installed locally.

### 3. Run the Project
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

---

## 📂 Project Structure

- **client/**: React frontend application (Port 3000 in Docker, 5173 locally).
- **server/**: Express backend API (Port 5000).
- **server/scripts/**: Utility scripts for seeding data and fetching news.
- **docker-compose.yml**: Orchestrates the full-stack environment.

## 🏗 Docker Architecture
- **Backend**: Uses `node:20-alpine`.
- **Frontend**: Multi-stage build (Node build -> Nginx serve).
- **Environment**: All keys from the root `.env` are injected into the containers.

## 🔄 Workflow & Data Lifecycle
1. **Seeding**: Initial data can be seeded using `npm run seed` in the server directory.
2. **News Fetching**: The system uses Cron jobs to fetch news automatically.
3. **AI Classification**: News is classified using Google Gemini AI based on minister names.
