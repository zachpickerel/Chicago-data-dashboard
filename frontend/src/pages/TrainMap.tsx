import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchTrainPositions } from '../api/client';

interface TrainPosition {
  runNumber: string;
  route: string;
  destination: string;
  nextStation: string;
  lat: number;
  lon: number;
  heading: number;
  isApproaching: boolean;
  isDelayed: boolean;
  arrivalTime: string;
}

const ROUTE_COLORS: Record<string, string> = {
  red:  '#C60C30',
  blue: '#00A1DE',
  brn:  '#62361B',
  g:    '#009B3A',
  org:  '#F9461C',
  p:    '#522398',
  pink: '#E27EA6',
  y:    '#F9E300',
};

const ROUTE_LABELS: Record<string, string> = {
  red:  'Red',
  blue: 'Blue',
  brn:  'Brown',
  g:    'Green',
  org:  'Orange',
  p:    'Purple',
  pink: 'Pink',
  y:    'Yellow',
};

// Custom SVG marker: colored circle with a short heading arrow
function makeTrainIcon(route: string, heading: number) {
  const color = ROUTE_COLORS[route] ?? '#888888';
  const rad = (heading * Math.PI) / 180;
  const arrowX = (10 + 7 * Math.sin(rad)).toFixed(2);
  const arrowY = (10 - 7 * Math.cos(rad)).toFixed(2);

  return L.divIcon({
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
    html: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      <line x1="10" y1="10" x2="${arrowX}" y2="${arrowY}" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  });
}

function formatArrival(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const REFRESH_INTERVAL_MS = 30_000;

export default function TrainMap() {
  const [trains, setTrains] = useState<TrainPosition[]>([]);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);

  const loadPositions = useCallback(async () => {
    try {
      const res = await fetchTrainPositions();
      setTrains(res.data.trains as TrainPosition[]);
      setTimestamp(res.data.timestamp as string);
      setError(null);
      setSecondsUntilRefresh(REFRESH_INTERVAL_MS / 1000);
    } catch (e) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to load train positions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + 30s auto-refresh
  useEffect(() => {
    loadPositions();
    const refreshInterval = setInterval(loadPositions, REFRESH_INTERVAL_MS);
    const countdownInterval = setInterval(
      () => setSecondsUntilRefresh((s) => Math.max(0, s - 1)),
      1000
    );
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [loadPositions]);

  const isMissingKey = error?.includes('CTA_TRAIN_API_KEY');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Train Positions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {timestamp
              ? `Last updated ${new Date(timestamp).toLocaleTimeString()} · refreshes in ${secondsUntilRefresh}s`
              : 'Loading…'}
          </p>
        </div>

        {/* Line legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROUTE_LABELS).map(([key, label]) => (
            <span
              key={key}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: `${ROUTE_COLORS[key]}20`,
                borderColor: `${ROUTE_COLORS[key]}60`,
                color: ROUTE_COLORS[key],
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ROUTE_COLORS[key] }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Error / key setup instructions */}
      {error && (
        <div className="bg-chicago-card border border-chicago-border rounded-xl p-6 text-center space-y-2">
          <p className="text-chicago-red text-sm font-medium">
            {isMissingKey ? 'CTA Train API key not configured' : error}
          </p>
          {isMissingKey && (
            <p className="text-slate-400 text-xs leading-relaxed">
              Register for a free key at{' '}
              <span className="text-chicago-blue">
                transitchicago.com/developers/traintracker.aspx
              </span>
              , then add{' '}
              <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">
                CTA_TRAIN_API_KEY=your_key
              </code>{' '}
              to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">backend/.env</code> and restart the backend.
            </p>
          )}
        </div>
      )}

      {/* Map */}
      {!error && (
        <div
          className="rounded-xl overflow-hidden border border-chicago-border"
          style={{ height: '600px' }}
        >
          {loading ? (
            <div className="h-full bg-chicago-card animate-pulse flex items-center justify-center">
              <p className="text-slate-500 text-sm">Loading train positions…</p>
            </div>
          ) : (
            <MapContainer
              center={[41.8827, -87.6233]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              {/* CartoDB dark tiles match the dashboard's dark theme */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {trains.map((train) => (
                <Marker
                  key={`${train.route}-${train.runNumber}`}
                  position={[train.lat, train.lon]}
                  icon={makeTrainIcon(train.route, train.heading)}
                >
                  <Popup>
                    <div style={{ fontSize: 13, lineHeight: 1.7, minWidth: 160 }}>
                      <strong style={{ color: ROUTE_COLORS[train.route] }}>
                        {ROUTE_LABELS[train.route]} Line
                      </strong>
                      <br />
                      <span style={{ color: '#666' }}>Run #{train.runNumber}</span>
                      <br />
                      <strong>To:</strong> {train.destination}
                      <br />
                      <strong>Next:</strong> {train.nextStation}
                      <br />
                      <strong>Arrives:</strong> {formatArrival(train.arrivalTime)}
                      {train.isApproaching && (
                        <span style={{ color: '#009B3A' }}> · Approaching</span>
                      )}
                      {train.isDelayed && (
                        <span style={{ color: '#F9461C' }}> · Delayed</span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      )}

      {!loading && !error && (
        <p className="text-xs text-slate-500 text-right">
          {trains.length} trains currently active across all lines
        </p>
      )}
    </main>
  );
}
