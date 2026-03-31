# Chicago Insights Dashboard

A full-stack data dashboard built as a practice project after moving from Fort Collins to Chicago. Pulls live city data from the Chicago Data Portal and OpenWeatherMap, visualizes it with Recharts, and proxies all external API calls through an Express backend to sidestep CORS.

## What's displayed

- **Weather** — current conditions, feels-like, wind, humidity (OpenWeatherMap)
- **Crime stats** — incidents by type (bar chart), trend over time (line chart), paginated incident log with arrest indicator
- **CTA Transit** — system-wide daily boardings area chart, top 'L' stations by ridership (bar chart)
- **Filters** — date range (7 / 30 / 90 days) and crime-type dropdown that refetch live data

## Tech stack

| Layer     | Tools                                          |
|-----------|------------------------------------------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS, Recharts |
| Backend   | Node.js, Express, TypeScript, Axios            |
| Data      | OpenWeatherMap API, Chicago Data Portal (Socrata) |

## Folder structure

```
chicago-data-dashboard/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   └── routes/
│   │       ├── weather.ts
│   │       ├── crime.ts
│   │       └── transit.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── api/client.ts
    │   ├── types/index.ts
    │   └── components/
    │       ├── Header.tsx
    │       ├── WeatherCard.tsx
    │       ├── StatsCard.tsx
    │       ├── FilterBar.tsx
    │       ├── CrimeChart.tsx
    │       ├── CrimeTable.tsx
    │       └── TransitChart.tsx
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── .env.example
```

## How to run locally

### 1. Get a free OpenWeatherMap API key

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Go to **API Keys** in your account dashboard
3. Copy the default key (it activates within ~10 minutes of signup)

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env and paste your OpenWeatherMap key
npm install
npm run dev
# Runs on http://localhost:3001
```

### 3. Set up the frontend

```bash
cd frontend
cp .env.example .env
# .env already points to localhost:3001 — no changes needed
npm install
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** The Chicago Data Portal endpoints (crime, transit) require no API key. Only weather needs one.

## Data sources

| Dataset | Endpoint |
|---------|----------|
| Chicago Crimes | `data.cityofchicago.org/resource/ijzp-q8t2.json` |
| CTA 'L' Station Entries | `data.cityofchicago.org/resource/5neh-572f.json` |
| CTA Daily Boardings | `data.cityofchicago.org/resource/6iiy-9s97.json` |
| Weather | `api.openweathermap.org/data/2.5/weather` |
