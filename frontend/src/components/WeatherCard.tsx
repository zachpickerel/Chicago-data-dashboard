import { WeatherData, DailyForecast } from '../types';

interface WeatherCardProps {
  current: WeatherData | null;
  forecast: DailyForecast[];
  loading: boolean;
  error: string | null;
}

function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function dayLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

export default function WeatherCard({ current, forecast, loading, error }: WeatherCardProps) {
  return (
    <div className="bg-chicago-card border border-chicago-border rounded-xl p-5 col-span-2 sm:col-span-4">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
        Chicago Weather
      </p>

      {loading && (
        <div className="flex gap-6">
          <div className="space-y-2 flex-1">
            <div className="h-14 w-36 bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 flex-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-1 h-24 bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <p className="text-chicago-red text-sm">
          {error.includes('API key') || error.includes('Invalid') ? (
            <>
              Invalid or missing OpenWeatherMap API key — update{' '}
              <code className="bg-slate-800 px-1 rounded">backend/.env</code>
            </>
          ) : (
            error
          )}
        </p>
      )}

      {current && !loading && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Today's conditions ── */}
          <div className="flex items-start gap-4 lg:w-64 shrink-0">
            <img
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
              alt={current.weather[0].description}
              className="w-16 h-16 -mt-1 -ml-1"
            />
            <div>
              <p className="text-5xl font-bold text-white leading-none">
                {Math.round(current.main.temp)}°
              </p>
              <p className="text-slate-300 text-sm mt-1 capitalize">
                {current.weather[0].description}
              </p>
              <p className="text-slate-500 text-xs mt-2">
                H:{Math.round(current.main.temp_max)}° · L:{Math.round(current.main.temp_min)}°
              </p>
            </div>
          </div>

          {/* ── Detail strip ── */}
          <div className="flex gap-5 text-sm lg:border-l lg:border-chicago-border lg:pl-6 flex-wrap">
            <div>
              <p className="text-slate-500 text-xs">Feels like</p>
              <p className="text-slate-200 font-medium mt-0.5">
                {Math.round(current.main.feels_like)}°F
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Humidity</p>
              <p className="text-slate-200 font-medium mt-0.5">{current.main.humidity}%</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Wind</p>
              <p className="text-slate-200 font-medium mt-0.5">
                {Math.round(current.wind.speed)} mph {windDirection(current.wind.deg)}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Visibility</p>
              <p className="text-slate-200 font-medium mt-0.5">
                {(current.visibility / 1609).toFixed(1)} mi
              </p>
            </div>
          </div>

          {/* ── 5-day forecast ── */}
          {forecast.length > 0 && (
            <div className="flex gap-2 lg:ml-auto overflow-x-auto pb-1">
              {forecast.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1 bg-slate-800/60 rounded-lg px-3 py-2.5 min-w-[60px]"
                >
                  <p className="text-xs font-medium text-slate-400">{dayLabel(day.date)}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.description}
                    className="w-8 h-8"
                    title={day.description}
                  />
                  <p className="text-xs font-semibold text-white">{day.high}°</p>
                  <p className="text-xs text-slate-500">{day.low}°</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
