// Built for practice after moving from Fort Collins to Chicago — Zach Pickerel
import { useState, useEffect, useCallback } from 'react';
import {
  fetchWeather,
  fetchCrimeStats,
  fetchCrimeIncidents,
  fetchCrimeTypes,
  fetchTransitRidership,
  fetchDailyBoardings,
} from '../api/client';
import {
  WeatherResponse,
  DailyForecast,
  WeatherData,
  CrimeStats,
  CrimeRecord,
  TransitRidership,
  DailyBoardings,
  DateRange,
} from '../types';

import WeatherCard from '../components/WeatherCard';
import StatsCard from '../components/StatsCard';
import FilterBar from '../components/FilterBar';
import CrimeChart from '../components/CrimeChart';
import CrimeTable from '../components/CrimeTable';
import TransitChart from '../components/TransitChart';

export default function Dashboard() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [crimeStats, setCrimeStats] = useState<CrimeStats | null>(null);
  const [incidents, setIncidents] = useState<CrimeRecord[]>([]);
  const [crimesLoading, setCrimesLoading] = useState(true);

  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);

  const [ridership, setRidership] = useState<TransitRidership[]>([]);
  const [daily, setDaily] = useState<DailyBoardings[]>([]);
  const [transitLoading, setTransitLoading] = useState(true);

  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [crimeType, setCrimeType] = useState('ALL');

  useEffect(() => {
    fetchWeather()
      .then((r) => {
        const data = r.data as WeatherResponse;
        setCurrentWeather(data.current);
        setForecast(data.forecast);
      })
      .catch((e) => {
        const msg: string =
          (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Weather unavailable';
        setWeatherError(msg);
      })
      .finally(() => setWeatherLoading(false));

    Promise.all([fetchTransitRidership(), fetchDailyBoardings()])
      .then(([riderRes, dailyRes]) => {
        setRidership(riderRes.data as TransitRidership[]);
        setDaily(dailyRes.data as DailyBoardings[]);
      })
      .catch(console.error)
      .finally(() => setTransitLoading(false));

    fetchCrimeTypes()
      .then((r) => setCrimeTypes(r.data))
      .catch(console.error);
  }, []);

  const loadCrimes = useCallback(async () => {
    setCrimesLoading(true);
    try {
      const [statsRes, incidentsRes] = await Promise.all([
        fetchCrimeStats(dateRange, crimeType),
        fetchCrimeIncidents(dateRange, crimeType),
      ]);
      setCrimeStats(statsRes.data as CrimeStats);
      setIncidents(incidentsRes.data as CrimeRecord[]);
    } catch (e) {
      console.error(e);
    } finally {
      setCrimesLoading(false);
    }
  }, [dateRange, crimeType]);

  useEffect(() => {
    loadCrimes();
  }, [loadCrimes]);

  const arrestRate =
    crimeStats && crimeStats.total > 0
      ? Math.round((crimeStats.arrests / crimeStats.total) * 100)
      : 0;

  const topType = crimeStats?.byType[0]?.primary_type ?? '—';
  const latestDaily = daily[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Weather — full width row */}
      <WeatherCard
        current={currentWeather}
        forecast={forecast}
        loading={weatherLoading}
        error={weatherError}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Incidents"
          value={crimesLoading ? '…' : (crimeStats?.total ?? 0).toLocaleString()}
          subtext={`Last ${dateRange} days from latest data`}
          accent="blue"
          loading={crimesLoading}
        />
        <StatsCard
          label="Arrest Rate"
          value={crimesLoading ? '…' : `${arrestRate}%`}
          subtext={`${(crimeStats?.arrests ?? 0).toLocaleString()} arrests`}
          accent="red"
          loading={crimesLoading}
        />
        <StatsCard
          label="Top Crime"
          value={
            crimesLoading
              ? '…'
              : topType.charAt(0) + topType.slice(1).toLowerCase()
          }
          subtext="Most common type"
          accent="white"
          loading={crimesLoading}
        />
        <StatsCard
          label="CTA Rides"
          value={transitLoading ? '…' : Number(latestDaily?.total_rides ?? 0).toLocaleString()}
          subtext={
            latestDaily
              ? `on ${latestDaily.service_date.split('T')[0]}`
              : 'Latest date'
          }
          accent="blue"
          loading={transitLoading}
        />
      </div>

      <FilterBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        crimeType={crimeType}
        onCrimeTypeChange={setCrimeType}
        crimeTypes={crimeTypes}
        loading={crimesLoading}
        latestDate={crimeStats?.latestDate}
      />

      <section>
        <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Crime Analysis
        </h2>
        <CrimeChart
          byType={crimeStats?.byType ?? []}
          byDay={crimeStats?.byDay ?? []}
          loading={crimesLoading}
        />
      </section>

      <section>
        <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          CTA Transit
        </h2>
        <TransitChart daily={daily} ridership={ridership} loading={transitLoading} />
      </section>

      <section>
        <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Incident Log
        </h2>
        <CrimeTable crimes={incidents} loading={crimesLoading} />
      </section>

      <footer className="text-center text-xs text-slate-600 pb-4">
        Data sourced from Chicago Data Portal &amp; OpenWeatherMap · Built by Zach Pickerel
      </footer>
    </main>
  );
}
