import express from 'express';

const app = express();
const PORT = process.env.HOSTNAME || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.get('/', (_req, _res) => {
  _res.json({ message: `Hello World from port: ${PORT}` });
});

app.get('/api', async (req, res) => {
  res.json({ message: 'Hello from Docker!' });
});

app.get('/api/db', async (req, res) => {
  res.json({
    database: process.env.DATABASE_URL?.split('@')[1] || 'not configured'
  });
});

app.get('/api/cache', async (req, res) => {
  res.json({
    redis: process.env.REDIS_URL || 'not configured'
  });
});

// server listening on $PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.DATABASE_URL}`);
  console.log(`Redis: ${process.env.REDIS_URL}`);
});
