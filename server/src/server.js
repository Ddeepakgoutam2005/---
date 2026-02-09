import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './utils/db.js';
import authRoutes from './routes/auth.js';
import ministerRoutes from './routes/ministers.js';
import promiseRoutes from './routes/promises.js';
import newsRoutes from './routes/news.js';
import performanceRoutes from './routes/performance.js';
import adminRoutes from './routes/admin.js';
import adminGeminiRoutes from './routes/adminGemini.js';
import importRoutes from './routes/import.js';
import queryRoutes from './routes/queries.js';
import chatbotRoutes from './routes/chatbot.js';
import Minister from './models/Minister.js';
import PromiseModel from './models/Promise.js';
import { indianMinisters } from './data/indianMinisters.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Political Promise Tracker API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ministers', ministerRoutes);
app.use('/api/promises', promiseRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/performance', performanceRoutes);

// ... (existing routes)
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminGeminiRoutes);
app.use('/api/import', importRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Serve static files from the React app in production
const clientBuildPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuildPath) && (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true')) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

async function seedIfEmpty() {
  // Removed hasMongoUri check to ensure data is seeded if missing, even on real DB
  
  const ministerCount = await Minister.countDocuments();
  let ministers;
  
  if (ministerCount === 0) {
    ministers = await Minister.insertMany(indianMinisters);
    console.log(`Seeded ${ministers.length} ministers`);
  } else {
    ministers = await Minister.find({});
  }
  
  const promiseCount = await PromiseModel.countDocuments();
  if (promiseCount > 0) return;

  // Seed random promises for all ministers to populate trends
  const sampleTitles = [
    'Improve healthcare infrastructure', 'New education policy implementation', 'Road safety measures',
    'Digital literacy campaign', 'Clean water for all', 'Renewable energy adoption',
    'Farmers support scheme', 'Urban transport modernization', 'Women safety initiative',
    'Skill development program'
  ];
  
  const promises = [];
  for (const m of ministers) {
     const numPromises = Math.floor(Math.random() * 3) + 2; // 2 to 4 promises
     for(let i=0; i<numPromises; i++) {
        const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
        const monthsAgo = Math.floor(Math.random() * 11); // 0 to 10 months ago
        const dateMade = new Date();
        dateMade.setMonth(dateMade.getMonth() - monthsAgo);
        
        promises.push({
           minister: m._id,
           title: `${title}`,
           dateMade: dateMade,
           status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
           sourceUrl: 'https://example.com'
        });
     }
  }
  
  if (promises.length > 0) {
    await PromiseModel.insertMany(promises);
  }

  console.log('Seeded in-memory demo data with ' + ministers.length + ' ministers and ' + promises.length + ' promises');
}

import { startScheduler } from './cron/scheduler.js'; // Import scheduler

connectDB().then(async () => {
  await seedIfEmpty();
  startScheduler(); // Start the cron job
  app.listen(PORT, () => {

    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('DB connection failed:', err);
  process.exit(1);
});