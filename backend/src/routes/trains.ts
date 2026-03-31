import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const ALL_ROUTES = 'red,blue,brn,g,org,p,pink,y';

interface CtaTrain {
  rn: string;
  destNm: string;
  nextStaNm: string;
  lat: string;
  lon: string;
  heading: string;
  isApp: string;
  isDly: string;
  arrT: string;
}

interface CtaRoute {
  '@name': string;
  train: CtaTrain | CtaTrain[];
}

router.get('/positions', async (_req: Request, res: Response) => {
  const apiKey = process.env.CTA_TRAIN_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'CTA_TRAIN_API_KEY not configured in .env' });
    return;
  }

  try {
    const response = await axios.get(
      'http://lapi.transitchicago.com/api/1.0/ttpositions.aspx',
      {
        params: { key: apiKey, rt: ALL_ROUTES, outputType: 'JSON' },
        timeout: 10000,
      }
    );

    const ctatt = response.data?.ctatt;

    if (!ctatt || ctatt.errCd !== '0') {
      res.status(500).json({ error: ctatt?.errNm ?? 'CTA API returned an error' });
      return;
    }

    // Socrata returns a single object when there's one item, array when there are many
    const routes: CtaRoute[] = Array.isArray(ctatt.route)
      ? ctatt.route
      : [ctatt.route];

    const trains = routes.flatMap((route) => {
      if (!route.train) return [];
      const trainList = Array.isArray(route.train) ? route.train : [route.train];
      return trainList.map((t) => ({
        runNumber: t.rn,
        route: route['@name'],
        destination: t.destNm,
        nextStation: t.nextStaNm,
        lat: parseFloat(t.lat),
        lon: parseFloat(t.lon),
        heading: parseInt(t.heading, 10),
        isApproaching: t.isApp === '1',
        isDelayed: t.isDly === '1',
        arrivalTime: t.arrT,
      }));
    });

    res.json({ timestamp: ctatt.tmst, trains });
  } catch (error) {
    console.error('Train positions error:', error);
    res.status(500).json({ error: 'Failed to fetch train positions' });
  }
});

export default router;
