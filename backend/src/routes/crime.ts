import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();
const SOCRATA_BASE = 'https://data.cityofchicago.org/resource';

// The Chicago Data Portal crime dataset has roughly a 1-week lag.
// Anchoring date ranges to the latest available date (instead of today)
// ensures "last 7 days" always returns actual data.
async function getLatestCrimeDate(): Promise<string> {
  const resp = await axios.get(`${SOCRATA_BASE}/ijzp-q8t2.json`, {
    params: { $select: 'max(date) as max_date' },
  });
  return resp.data[0].max_date as string;
}

function startDate(latestDate: string, days: number): string {
  const end = new Date(latestDate);
  end.setDate(end.getDate() - days);
  // Socrata SoQL format (no trailing Z)
  return end.toISOString().split('.')[0];
}

function buildWhere(fromDate: string, type?: string): string {
  let clause = `date >= '${fromDate}'`;
  if (type && type !== 'ALL') {
    clause += ` AND primary_type = '${type.replace(/'/g, "''")}'`;
  }
  return clause;
}

// Pre-aggregated stats for charts — returns totals, by-type, and by-day
// without hitting the row-limit problem of fetching raw records.
router.get('/stats', async (req: Request, res: Response) => {
  const { days = '30', type } = req.query as { days?: string; type?: string };

  try {
    const latestDate = await getLatestCrimeDate();
    const from = startDate(latestDate, Number(days));
    const where = buildWhere(from, type);

    const [byTypeResp, byDayResp, arrestsResp] = await Promise.all([
      axios.get(`${SOCRATA_BASE}/ijzp-q8t2.json`, {
        params: {
          $select: 'primary_type, count(*) as count',
          $group: 'primary_type',
          $order: 'count DESC',
          $limit: 20,
          $where: where,
        },
      }),
      axios.get(`${SOCRATA_BASE}/ijzp-q8t2.json`, {
        params: {
          $select: 'date_trunc_ymd(date) as day, count(*) as count',
          $group: 'day',
          $order: 'day ASC',
          $limit: 100,
          $where: where,
        },
      }),
      axios.get(`${SOCRATA_BASE}/ijzp-q8t2.json`, {
        params: {
          $select: 'count(*) as count',
          $where: `${where} AND arrest = true`,
        },
      }),
    ]);

    const total = (byTypeResp.data as { count: string }[]).reduce(
      (sum, d) => sum + Number(d.count),
      0
    );

    res.json({
      latestDate,
      total,
      arrests: Number(arrestsResp.data[0]?.count ?? 0),
      byType: byTypeResp.data,
      byDay: byDayResp.data,
    });
  } catch (error) {
    console.error('Crime stats error:', error);
    res.status(500).json({ error: 'Failed to fetch crime stats' });
  }
});

// Raw incidents for the table (most recent 50)
router.get('/incidents', async (req: Request, res: Response) => {
  const { days = '30', type } = req.query as { days?: string; type?: string };

  try {
    const latestDate = await getLatestCrimeDate();
    const from = startDate(latestDate, Number(days));
    const where = buildWhere(from, type);

    const resp = await axios.get(`${SOCRATA_BASE}/ijzp-q8t2.json`, {
      params: {
        $limit: 50,
        $order: 'date DESC',
        $where: where,
      },
    });

    res.json(resp.data);
  } catch (error) {
    console.error('Crime incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Distinct crime types for the filter dropdown
router.get('/types', async (_req: Request, res: Response) => {
  try {
    const resp = await axios.get(`${SOCRATA_BASE}/ijzp-q8t2.json`, {
      params: {
        $select: 'primary_type',
        $group: 'primary_type',
        $order: 'primary_type ASC',
        $limit: 50,
      },
    });

    const types = (resp.data as { primary_type: string }[]).map((d) => d.primary_type);
    res.json(types);
  } catch (error) {
    console.error('Crime types error:', error);
    res.status(500).json({ error: 'Failed to fetch crime types' });
  }
});

export default router;
