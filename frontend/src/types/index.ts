export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

export interface DailyForecast {
  date: string;       // "YYYY-MM-DD"
  high: number;
  low: number;
  icon: string;
  description: string;
}

export interface WeatherResponse {
  current: WeatherData;
  forecast: DailyForecast[];
}

// arrest and domestic come back as real booleans from the Socrata API
export interface CrimeRecord {
  id: string;
  case_number: string;
  date: string;
  primary_type: string;
  description: string;
  location_description: string;
  arrest: boolean;
  domestic: boolean;
  community_area: string;
  year: string;
  latitude?: string;
  longitude?: string;
}

// Pre-aggregated response from /api/crime/stats
export interface CrimeStats {
  latestDate: string;
  total: number;
  arrests: number;
  byType: Array<{ primary_type: string; count: string }>;
  byDay: Array<{ day: string; count: string }>;
}

export interface TransitRidership {
  station_id: string;
  stationname: string;
  date: string;
  daytype: string;
  rides: string;
}

export interface DailyBoardings {
  service_date: string;
  day_type: string;
  bus: string;
  rail_boardings: string;
  total_rides: string;
}

export type DateRange = '7' | '30' | '90';
