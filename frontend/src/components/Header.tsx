import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="border-b border-chicago-border bg-chicago-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Chicago flag star motif */}
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-chicago-red text-lg leading-none">
                ✦
              </span>
            ))}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Chicago Insights Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Live city data — weather, crime &amp; transit
            </p>
          </div>
        </div>

        {/* Page navigation */}
        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-chicago-blue text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/trains"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-chicago-blue text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`
            }
          >
            Live Trains
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
