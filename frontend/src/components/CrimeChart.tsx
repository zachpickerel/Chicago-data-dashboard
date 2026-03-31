import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface ByTypeEntry {
  primary_type: string;
  count: string;
}

interface ByDayEntry {
  day: string;
  count: string;
}

interface CrimeChartProps {
  byType: ByTypeEntry[];
  byDay: ByDayEntry[];
  loading: boolean;
}

// Socrata returns counts as strings; coerce them for Recharts
function prepareByType(data: ByTypeEntry[]) {
  return data.map((d) => ({
    type: d.primary_type.charAt(0) + d.primary_type.slice(1).toLowerCase(),
    count: Number(d.count),
  }));
}

function prepareByDay(data: ByDayEntry[]) {
  return data.map((d) => ({
    date: d.day.split('T')[0], // strip time component
    count: Number(d.count),
  }));
}

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: 12,
};

export default function CrimeChart({ byType, byDay, loading }: CrimeChartProps) {
  const typeData = prepareByType(byType);
  const dayData = prepareByDay(byDay);

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

  if (typeData.length === 0) {
    return (
      <div className="bg-chicago-card border border-chicago-border rounded-xl p-5 text-center text-slate-500 text-sm h-40 flex items-center justify-center">
        No crime data available for selected filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Crimes by type */}
      <div className="bg-chicago-card border border-chicago-border rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-200 mb-4">Top Crime Types</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={typeData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="type"
              width={100}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#334155' }} />
            <Bar dataKey="count" fill="#41B6E6" radius={[0, 4, 4, 0]} name="Incidents" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Crimes over time */}
      <div className="bg-chicago-card border border-chicago-border rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-200 mb-4">Incidents Over Time</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dayData} margin={{ left: 0, right: 16 }}>
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
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#CC1628"
              strokeWidth={2}
              dot={false}
              name="Incidents"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
