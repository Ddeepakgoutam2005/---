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
- **Database**: MongoDB (with Mongoose)
- **AI Integration**: Google Gemini AI (for news classification)

## 📂 Project Structure

- **client/**: React frontend application.
- **server/**: Express backend API.
- **server/scripts/**: Utility scripts for seeding data, fetching news, and admin tasks.

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas) - *Optional for local dev (uses in-memory DB if missing)*

### Local Setup (Simultaneous)

1.  **Clone the repository**
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    (This installs dependencies for root, client, and server)

3.  **Environment Setup**:
    - Create a `.env` file in the root directory.
    - Copy contents from `.env.example`.
    - *Note: For local development, `MONGO_URI` is optional. If skipped, it uses an in-memory database.*

4.  **Run the App**:
    ```bash
    npm run dev
    ```
    - Server: `http://localhost:5000`
    - Client: `http://localhost:5173`

### Manual / Individual Start

**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

## 🌍 Deployment Guide

### 1. Database (MongoDB Atlas)
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
- Get your connection string (e.g., `mongodb+srv://...`).
- Allow access from anywhere (`0.0.0.0/0`) in Network Access.

### 2. Backend (Render)
- Connect your repo to [Render](https://render.com/).
- Create a **Web Service**.
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_VERSION`: `18`
  - `MONGO_URI`: Your Atlas connection string.
  - `JWT_SECRET`: A secure random string.
  - `GEMINI_API_KEY`: Your Google Gemini API key.
  - `PORT`: `5000` (Render will override this, but good to set).

### 3. Frontend (Vercel)
- Connect your repo to [Vercel](https://vercel.com/).
- **Root Directory**: `client` (Edit the project settings > Root Directory).
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://your-app.onrender.com`).

## 🔄 Workflow & Data Lifecycle

1.  **Initialization**:
    - The app starts with seeded data (ministers/promises) if the DB is empty.
2.  **News Ingestion (Admin)**:
    - Admin triggers news fetch via the dashboard.
    - Backend fetches RSS feeds and uses Gemini AI to classify news as "Related to Promise" or "General Criticism".
3.  **User Interaction**:
    - Users view dashboards, check promise status, and read related news.
    - Users can report issues or ask queries.

## 📝 API Endpoints (Brief)

- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`
- **Ministers**: `GET /api/ministers`, `GET /api/ministers/:id`
- **Promises**: `GET /api/promises`
- **News**: `GET /api/news`
- **Admin**: `POST /api/admin/fetch-news`, `POST /api/import/seed`

## 📜 License

This project is licensed under the MIT License.
