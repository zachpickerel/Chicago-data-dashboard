import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();
const SOCRATA_BASE = 'https://data.cityofchicago.org/resource';

// CTA 'L' station daily ridership — no date filter because the dataset
// has a ~2-month lag; filtering by "last 30 days from today" returns nothing.
// We grab the most recent available records and let the frontend aggregate by station.
router.get('/ridership', async (_req: Request, res: Response) => {
  try {
    const resp = await axios.get(`${SOCRATA_BASE}/5neh-572f.json`, {
      params: {
        $limit: 500,
        $order: 'date DESC',
      },
    });

    res.json(resp.data);
  } catch (error) {
    console.error('Transit ridership error:', error);
    res.status(500).json({ error: 'Failed to fetch ridership data' });
  }
});

// CTA system-wide daily boardings (bus + rail), last 30 available dates
router.get('/daily', async (_req: Request, res: Response) => {
  try {
    const resp = await axios.get(`${SOCRATA_BASE}/6iiy-9s97.json`, {
      params: {
        $limit: 30,
        $order: 'service_date DESC',
      },
    });

    res.json(resp.data);
  } catch (error) {
    console.error('Transit daily error:', error);
    res.status(500).json({ error: 'Failed to fetch daily transit data' });
  }
});

export default router;
