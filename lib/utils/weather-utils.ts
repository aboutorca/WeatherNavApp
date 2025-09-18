import { WeatherData, WeatherSeverity } from '@/lib/types';

export function getWeatherSeverity(weather: WeatherData): WeatherSeverity {
  // Check for alerts first
  if (weather.alerts && weather.alerts.length > 0) {
    return 'severe';
  }

  // Check visibility (in meters)
  if (weather.visibility < 1000) {
    return 'severe';
  }

  // Check precipitation (mm/hour)
  const rain = weather.precipitation || 0;
  if (rain > 10) {
    return 'severe';
  }
  if (rain > 5) {
    return 'warning';
  }
  if (rain > 0) {
    return 'caution';
  }

  // Check wind speed (m/s to mph conversion)
  const windMph = weather.windSpeed * 2.237;
  if (windMph > 40) {
    return 'severe';
  }
  if (windMph > 30) {
    return 'warning';
  }
  if (windMph > 20) {
    return 'caution';
  }

  // Check for specific weather conditions
  const desc = weather.description.toLowerCase();
  if (desc.includes('storm') || desc.includes('tornado') || desc.includes('hurricane')) {
    return 'severe';
  }
  if (desc.includes('snow') || desc.includes('ice') || desc.includes('blizzard')) {
    return 'warning';
  }
  if (desc.includes('rain') || desc.includes('drizzle')) {
    return 'caution';
  }

  return 'clear';
}

export function getSeverityColor(severity: WeatherSeverity): string {
  switch (severity) {
    case 'severe':
      return '#ef4444'; // red
    case 'warning':
      return '#f97316'; // orange
    case 'caution':
      return '#eab308'; // yellow
    case 'clear':
      return '#22c55e'; // green
    default:
      return '#6b7280'; // gray
  }
}

export function getSeverityBgColor(severity: WeatherSeverity): string {
  switch (severity) {
    case 'severe':
      return 'bg-red-500';
    case 'warning':
      return 'bg-orange-500';
    case 'caution':
      return 'bg-yellow-500';
    case 'clear':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

export function formatTemperature(temp: number, unit: 'C' | 'F' = 'F'): string {
  if (unit === 'F') {
    return `${Math.round((temp * 9/5) + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

export function formatWindSpeed(speed: number): string {
  const mph = Math.round(speed * 2.237);
  return `${mph} mph`;
}

export function formatVisibility(visibility: number): string {
  const miles = (visibility / 1609.34).toFixed(1);
  return `${miles} mi`;
}

export function getWeatherIcon(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}