import { WeatherData } from '@/lib/types';
import {
  formatTemperature,
  formatWindSpeed,
  formatVisibility,
  getWeatherIcon,
  getSeverityBgColor
} from '@/lib/utils/weather-utils';
import { Badge } from '@/components/ui/badge';

interface WeatherPopupProps {
  weather: WeatherData;
}

export default function WeatherPopup({ weather }: WeatherPopupProps) {
  const arrivalTime = weather.timestamp ? new Date(weather.timestamp) : null;
  const timeString = arrivalTime?.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const isToday = arrivalTime?.toDateString() === new Date().toDateString();
  const dateString = !isToday && arrivalTime ?
    arrivalTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <div className="p-3 min-w-[200px]">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-lg">
            {formatTemperature(weather.temperature)}
          </h3>
          <p className="text-sm text-gray-600">
            Feels like {formatTemperature(weather.feelsLike)}
          </p>
          {timeString && (
            <p className="text-xs text-gray-500 mt-1">
              {timeString} {dateString}
            </p>
          )}
        </div>
        <img
          src={getWeatherIcon(weather.icon)}
          alt={weather.description}
          className="w-12 h-12"
        />
      </div>

      <Badge className={`${getSeverityBgColor(weather.severity)} text-white mb-2`}>
        {weather.severity.toUpperCase()}
      </Badge>

      <p className="text-sm capitalize mb-3">{weather.description}</p>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Wind:</span>
          <span>{formatWindSpeed(weather.windSpeed)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Humidity:</span>
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Visibility:</span>
          <span>{formatVisibility(weather.visibility)}</span>
        </div>
        {weather.precipitation && weather.precipitation > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Precipitation:</span>
            <span>{weather.precipitation.toFixed(1)} mm/h</span>
          </div>
        )}
      </div>

      {weather.alerts && weather.alerts.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-semibold text-red-600">
            ⚠️ Weather Alert
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {weather.alerts[0].event}
          </p>
        </div>
      )}
    </div>
  );
}