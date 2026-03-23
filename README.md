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

## 📂 Project Structure

- **client/**: React frontend application.
- **server/**: Express backend API.
- **server/scripts/**: Utility scripts for seeding data, fetching news, and admin tasks.
- **docker-compose.yml**: Orchestrates both services.

---

## 🐳 Running with Docker (Recommended)

The easiest way to run the project is using Docker. This ensures all dependencies are correctly configured.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Setup & Run
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ddeepakgoutam2005/---.git
   cd Capstone
   ```

2. **Configure Environment**:
   - Create a `.env` file in the root directory.
   - Use `.env.example` as a template:
     ```bash
     cp .env.example .env
     ```
   - Update `MONGO_URI` with your MongoDB Atlas connection string.

3. **Build and Start**:
   ```bash
   docker-compose up --build -d
   ```

4. **Access the App**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

5. **Stop Containers**:
   ```bash
   docker-compose down
   ```

---

## 💻 Running Locally (Manual Setup)

If you prefer not to use Docker, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [MongoDB](https://www.mongodb.com/) (Atlas or Local)

### Setup & Run
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ddeepakgoutam2005/---.git
   cd Capstone
   ```

2. **Install Dependencies**:
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install --legacy-peer-deps

   # Install server dependencies
   cd ../server && npm install --legacy-peer-deps
   ```

3. **Configure Environment**:
   - Create a `.env` file in the root directory.
   - Populate it using `.env.example`.

4. **Run the Project**:
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

5. **Access the App**:
   - **Frontend**: `http://localhost:5173` (Vite default)
   - **Backend**: `http://localhost:5000`

---

## 🔄 Workflow & Data Lifecycle

1. **Seeding**: Initial data can be seeded using `npm run seed` in the server directory.
2. **News Fetching**: The system uses Cron jobs to fetch news, or you can run `npm run fetch:news` manually.
3. **AI Classification**: News is automatically classified using Google Gemini AI based on minister names and promise indicators.
