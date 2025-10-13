import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, stopDB } from '../src/utils/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function run() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Site Admin';
  await connectDB();
  let user = await User.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 10);
  if (!user) {
    user = await User.create({ name, email, passwordHash, role: 'admin' });
    console.log(JSON.stringify({ created: true, email }, null, 2));
  } else {
    await User.updateOne({ _id: user._id }, { $set: { role: 'admin', passwordHash } });
    console.log(JSON.stringify({ created: false, updated: true, email }, null, 2));
  }
  await stopDB();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});