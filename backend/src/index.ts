// Built for practice after moving from Fort Collins to Chicago — Zach Pickerel
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import weatherRouter from './routes/weather';
import crimeRouter from './routes/crime';
import transitRouter from './routes/transit';
import trainsRouter from './routes/trains';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);
app.use(express.json());

app.use('/api/weather', weatherRouter);
app.use('/api/crime', crimeRouter);
app.use('/api/transit', transitRouter);
app.use('/api/trains', trainsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Chicago Dashboard API running' });
});

app.listen(PORT, () => {
  console.log(`Chicago Dashboard API running on http://localhost:${PORT}`);
});
