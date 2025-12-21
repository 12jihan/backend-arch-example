import express from 'express';
import { collectDefaultMetrics, register } from 'prom-client';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
collectDefaultMetrics()
// const collectDefailtMetrics = client.collectDefailtMetrics;
// collectDefaultMetrics({ register: client.register })

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
  _res.json({ message: 'Hello from Docker!' });
});

// API routes
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex)
  }
});

app.get('/api', async (req, res) => {
  res.json({ message: `Hello World from port: ${PORT} in ${process.env.HOSTNAME}` });
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
  console.log(`Server ${process.env.HOSTNAME ? process.env.HOSTNAME : "is"} running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.DATABASE_URL}`);
  console.log(`Redis: ${process.env.REDIS_URL}`);
});
