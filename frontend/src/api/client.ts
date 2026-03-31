import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 15000,
});

export const fetchWeather = () => api.get('/weather');

export const fetchCrimeStats = (days: string, type?: string) =>
  api.get('/crime/stats', {
    params: { days, ...(type && type !== 'ALL' ? { type } : {}) },
  });

export const fetchCrimeIncidents = (days: string, type?: string) =>
  api.get('/crime/incidents', {
    params: { days, ...(type && type !== 'ALL' ? { type } : {}) },
  });

export const fetchCrimeTypes = () => api.get<string[]>('/crime/types');

export const fetchTransitRidership = () => api.get('/transit/ridership');

export const fetchDailyBoardings = () => api.get('/transit/daily');

export const fetchTrainPositions = () => api.get('/trains/positions');
