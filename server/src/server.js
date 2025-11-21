import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
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
import Minister from './models/Minister.js';
import PromiseModel from './models/Promise.js';

dotenv.config({ path: path.join(process.cwd(), 'server/.env') });
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
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminGeminiRoutes);
app.use('/api/import', importRoutes);
app.use('/api/queries', queryRoutes);

const PORT = process.env.PORT || 5000;

async function seedIfEmpty() {
  const hasMongoUri = !!process.env.MONGO_URI;
  if (hasMongoUri) return; // do not auto-seed when using a real DB
  const count = await Minister.countDocuments();
  if (count > 0) return;
  const ministers = await Minister.insertMany([
    { name: 'Narendra Modi', ministry: 'Prime Minister', party: 'BJP', constituency: 'Varanasi' },
    { name: 'Amit Shah', ministry: 'Home Affairs', party: 'BJP' },
    { name: 'Nirmala Sitharaman', ministry: 'Finance', party: 'BJP' },
  ]);
  const [modi, shah, nirmala] = ministers;
  await PromiseModel.insertMany([
    { minister: modi._id, title: 'Develop smart cities', dateMade: new Date('2019-06-01'), status: 'completed', sourceUrl: 'https://example.com' },
    { minister: shah._id, title: 'Strengthen internal security', dateMade: new Date('2020-01-15'), status: 'pending' },
    { minister: nirmala._id, title: 'Boost MSME sector', dateMade: new Date('2021-08-01'), status: 'completed' },
  ]);
  console.log('Seeded in-memory demo data');
}

connectDB().then(async () => {
  await seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('DB connection failed:', err);
  process.exit(1);
});