import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

interface ForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: Array<{ description: string; icon: string }>;
  dt_txt: string;
}

// Group 3-hour forecast intervals into per-day summaries
function buildDailyForecast(items: ForecastItem[]) {
  const days: Record<
    string,
    { highs: number[]; lows: number[]; icons: string[]; descriptions: string[] }
  > = {};

  for (const item of items) {
    const day = item.dt_txt.split(' ')[0]; // "YYYY-MM-DD"
    if (!days[day]) days[day] = { highs: [], lows: [], icons: [], descriptions: [] };
    days[day].highs.push(item.main.temp_max);
    days[day].lows.push(item.main.temp_min);
    // Prefer daytime icons (ending in 'd') for the day's representative icon
    days[day].icons.push(item.weather[0].icon);
    days[day].descriptions.push(item.weather[0].description);
  }

  return Object.entries(days).map(([date, data]) => {
    const dayIcon =
      data.icons.find((i) => i.endsWith('d')) ?? data.icons[0];
    // Pick the description that matches the chosen icon
    const iconIdx = data.icons.indexOf(dayIcon);
    return {
      date,
      high: Math.round(Math.max(...data.highs)),
      low: Math.round(Math.min(...data.lows)),
      icon: dayIcon,
      description: data.descriptions[iconIdx] ?? data.descriptions[0],
    };
  });
}

router.get('/', async (_req: Request, res: Response) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'OPENWEATHER_API_KEY not configured in .env' });
    return;
  }

  const params = { q: 'Chicago,US', appid: apiKey, units: 'imperial' };

  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get('https://api.openweathermap.org/data/2.5/weather', { params }),
      axios.get('https://api.openweathermap.org/data/2.5/forecast', { params }),
    ]);

    const forecast = buildDailyForecast(forecastRes.data.list as ForecastItem[]);

    res.json({ current: currentRes.data, forecast });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

export default router;
