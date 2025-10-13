import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    } else {
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log('Connected to in-memory MongoDB');
    }
  } catch (err) {
    console.error('Mongo connection error', err);
    throw err;
  }
}

export async function stopDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}