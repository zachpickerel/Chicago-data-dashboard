interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: 'blue' | 'red' | 'white';
  loading?: boolean;
}

export default function StatsCard({
  label,
  value,
  subtext,
  accent = 'blue',
  loading = false,
}: StatsCardProps) {
  const accentClass = {
    blue: 'text-chicago-blue',
    red: 'text-chicago-red',
    white: 'text-white',
  }[accent];

  return (
    <div className="bg-chicago-card border border-chicago-border rounded-xl p-5">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      {loading ? (
        <div className="h-8 w-24 bg-slate-700 rounded animate-pulse mt-1" />
      ) : (
        <p className={`text-3xl font-bold ${accentClass}`}>{value}</p>
      )}
      {subtext && (
        <p className="text-xs text-slate-500 mt-1">{subtext}</p>
      )}
    </div>
  );
}
