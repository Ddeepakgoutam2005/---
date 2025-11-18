import dotenv from 'dotenv';
import { connectDB, stopDB } from '../src/utils/db.js';
import Minister from '../src/models/Minister.js';
import PromiseModel from '../src/models/Promise.js';

dotenv.config();

async function run() {
  await connectDB();
  await Minister.deleteMany({});
  await PromiseModel.deleteMany({});

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

  console.log('Seeded demo data');
  await stopDB();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});