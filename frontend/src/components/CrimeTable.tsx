import { CrimeRecord } from '../types';

interface CrimeTableProps {
  crimes: CrimeRecord[];
  loading: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CrimeTable({ crimes, loading }: CrimeTableProps) {
  return (
    <div className="bg-chicago-card border border-chicago-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-chicago-border flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Recent Incidents</p>
        {!loading && (
          <p className="text-xs text-slate-500">
            {crimes.length} most recent
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-chicago-border text-left">
              {['Date', 'Type', 'Description', 'Location', 'Arrest'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-chicago-border/50">
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-slate-700 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : crimes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-chicago-border/40 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(c.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-chicago-blue/10 text-chicago-blue text-xs font-medium px-2 py-0.5 rounded">
                        {c.primary_type.charAt(0) + c.primary_type.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs max-w-[200px] truncate">
                      {c.description}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[180px] truncate">
                      {c.location_description || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {/* arrest is a real boolean from the API, not the string "true" */}
                      <span
                        className={`font-medium ${
                          c.arrest ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {c.arrest ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
