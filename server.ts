import express from 'express';
import cors from 'cors';

export const app = express();
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'minimal-isolation-test-passed',
    time: new Date().toISOString()
  });
});

app.get('/api/auth/register', (req, res) => {
  res.json({ message: 'Minimal register endpoint responding' });
});

export default app;
