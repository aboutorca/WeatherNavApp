export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface WeatherData {
  location: Location;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  description: string;
  icon: string;
  precipitation?: number;
  severity: 'clear' | 'caution' | 'warning' | 'severe';
  alerts?: WeatherAlert[];
  timestamp?: string;
}

export interface WeatherAlert {
  event: string;
  start: Date;
  end: Date;
  description: string;
  severity: string;
}

export interface Route {
  id: string;
  origin: Location;
  destination: Location;
  distance: number; // meters
  duration: number; // seconds
  geometry: [number, number][];
  weatherPoints?: WeatherData[];
  instructions?: RouteInstruction[];
  alternativeRoutes?: Route[];
}

export interface RouteInstruction {
  text: string;
  distance: number;
  duration: number;
  type: string;
}

export interface TripPlan {
  id: string;
  origin: Location;
  destination: Location;
  departureTime: Date;
  route?: Route;
  savedAt: Date;
}

export interface SearchResult {
  place_name: string;
  center: [number, number];
  place_type: string[];
  address?: string;
}

export type WeatherSeverity = 'clear' | 'caution' | 'warning' | 'severe';