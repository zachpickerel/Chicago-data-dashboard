import { DateRange } from '../types';

interface FilterBarProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  crimeType: string;
  onCrimeTypeChange: (type: string) => void;
  crimeTypes: string[];
  loading: boolean;
  latestDate?: string; // latest date available in the crime dataset
}

const DATE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FilterBar({
  dateRange,
  onDateRangeChange,
  crimeType,
  onCrimeTypeChange,
  crimeTypes,
  loading,
  latestDate,
}: FilterBarProps) {
  return (
    <div className="bg-chicago-card border border-chicago-border rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Filters
        </p>

        {/* Date range toggle */}
        <div className="flex rounded-lg overflow-hidden border border-chicago-border">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDateRangeChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                dateRange === opt.value
                  ? 'bg-chicago-blue text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Crime type dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="crime-type" className="text-xs text-slate-400">
            Crime type
          </label>
          <select
            id="crime-type"
            value={crimeType}
            onChange={(e) => onCrimeTypeChange(e.target.value)}
            disabled={loading}
            className="bg-slate-800 border border-chicago-border text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-chicago-blue disabled:opacity-50"
          >
            <option value="ALL">All types</option>
            {crimeTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data lag notice */}
      {latestDate && (
        <p className="text-xs text-slate-500">
          <span className="text-slate-400 font-medium">Data current as of {formatDate(latestDate)}</span>
          {' '}— the Chicago Data Portal publishes crime records with a ~1 week delay.
          Date ranges are counted back from this date, not today.
        </p>
      )}
    </div>
  );
}
