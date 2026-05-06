import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Import Models (Removing .ts extensions for Vercel)
import User from './src/models/User';
import Organization from './src/models/Organization';

const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

export const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB Cache
let cached = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false, serverSelectionTimeoutMS: 5000 };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(m => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

const ensureDb = async (req: any, res: any, next: any) => {
  if (!MONGODB_URI) return res.status(500).json({ message: 'MONGODB_URI missing' });
  try {
    await dbConnect();
    next();
  } catch (err: any) {
    res.status(500).json({ message: `DB Connection Error: ${err.message}` });
  }
};

app.get('/api/health', ensureDb, (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

app.post('/api/auth/register', ensureDb, async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password, displayName });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add back more routes later once this is verified...

export default app;
