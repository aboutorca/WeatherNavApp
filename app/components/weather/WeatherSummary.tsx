import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WeatherData, Route } from '@/lib/types';
import { getSeverityBgColor, formatTemperature } from '@/lib/utils/weather-utils';
import { AlertTriangle, Cloud, Droplets, Wind } from 'lucide-react';

interface WeatherSummaryProps {
  route?: Route;
  weatherData: WeatherData[];
}

export default function WeatherSummary({ route, weatherData }: WeatherSummaryProps) {
  if (!route || weatherData.length === 0) {
    return null;
  }

  // Analyze weather data for the trip
  const worstWeather = weatherData.reduce((worst, current) => {
    const severityOrder = ['clear', 'caution', 'warning', 'severe'];
    return severityOrder.indexOf(current.severity) > severityOrder.indexOf(worst.severity)
      ? current
      : worst;
  }, weatherData[0]);

  const avgTemp =
    weatherData.reduce((sum, w) => sum + w.temperature, 0) / weatherData.length;

  const maxPrecipitation = Math.max(...weatherData.map(w => w.precipitation || 0));
  const maxWind = Math.max(...weatherData.map(w => w.windSpeed));

  const hasAlerts = weatherData.some(w => w.alerts && w.alerts.length > 0);
  const alertCount = weatherData.reduce((count, w) => count + (w.alerts?.length || 0), 0);

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <Cloud className="w-5 h-5" />
        Trip Weather Summary
      </h3>

      {hasAlerts && (
        <Alert className="mb-3 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Weather Alerts</AlertTitle>
          <AlertDescription>
            {alertCount} weather {alertCount === 1 ? 'alert' : 'alerts'} along your route.
            Check weather details for more information.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-600 mb-1">Overall Conditions</div>
          <Badge className={`${getSeverityBgColor(worstWeather.severity)} text-white`}>
            {worstWeather.severity.toUpperCase()}
          </Badge>
          <p className="text-sm text-gray-600 mt-1 capitalize">
            Worst: {worstWeather.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Temperature Range</div>
            <div className="font-medium">
              {formatTemperature(Math.min(...weatherData.map(w => w.temperature)))} -{' '}
              {formatTemperature(Math.max(...weatherData.map(w => w.temperature)))}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Avg Temperature</div>
            <div className="font-medium">{formatTemperature(avgTemp)}</div>
          </div>
        </div>

        {maxPrecipitation > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              Max Precipitation
            </div>
            <div className="font-medium">{maxPrecipitation.toFixed(1)} mm/h</div>
          </div>
        )}

        <div>
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Wind className="w-4 h-4" />
            Max Wind Speed
          </div>
          <div className="font-medium">{Math.round(maxWind * 2.237)} mph</div>
        </div>

        {worstWeather.severity !== 'clear' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Consider checking alternative routes or adjusting departure time for better conditions.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}