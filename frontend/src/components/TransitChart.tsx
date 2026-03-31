import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { DailyBoardings, TransitRidership } from '../types';

interface TransitChartProps {
  daily: DailyBoardings[];
  ridership: TransitRidership[];
  loading: boolean;
}

function topStations(ridership: TransitRidership[]) {
  // Sum rides per station across all returned dates
  const totals: Record<string, number> = {};
  for (const r of ridership) {
    totals[r.stationname] = (totals[r.stationname] ?? 0) + Number(r.rides);
  }
  return Object.entries(totals)
    .map(([station, rides]) => ({ station, rides }))
    .sort((a, b) => b.rides - a.rides)
    .slice(0, 8);
}

function formatRides(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: 12,
};

export default function TransitChart({ daily, ridership, loading }: TransitChartProps) {
  const stations = topStations(ridership);

  // Oldest → newest for the area chart
  const chronological = [...daily]
    .reverse()
    .map((d) => ({
      date: d.service_date.split('T')[0],
      // Socrata returns numeric strings; parse for Recharts
      total_rides: Number(d.total_rides),
    }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-chicago-card border border-chicago-border rounded-xl p-5 h-72 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* System-wide daily boardings */}
      <div className="bg-chicago-card border border-chicago-border rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-200 mb-1">CTA Daily Boardings</p>
        <p className="text-xs text-slate-500 mb-4">Bus + Rail combined</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chronological} margin={{ left: 0, right: 16 }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#41B6E6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#41B6E6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(d: string) => d.slice(5)} // MM-DD
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatRides}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [v.toLocaleString(), 'Total rides']}
            />
            <Area
              type="monotone"
              dataKey="total_rides"
              stroke="#41B6E6"
              strokeWidth={2}
              fill="url(#blueGrad)"
              name="Total rides"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top L stations */}
      <div className="bg-chicago-card border border-chicago-border rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-200 mb-1">Top 'L' Stations</p>
        <p className="text-xs text-slate-500 mb-4">By total entries, most recent data</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stations} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatRides}
            />
            <YAxis
              type="category"
              dataKey="station"
              width={110}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: '#334155' }}
              formatter={(v: number) => [v.toLocaleString(), 'Entries']}
            />
            <Bar dataKey="rides" fill="#CC1628" radius={[0, 4, 4, 0]} name="Entries" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
