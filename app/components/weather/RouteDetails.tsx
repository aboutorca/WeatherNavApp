'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, WeatherData } from '@/lib/types';
import { formatDistance, formatDuration } from '@/lib/utils/route-utils';
import { formatTemperature, getWeatherIcon, getSeverityBgColor } from '@/lib/utils/weather-utils';
import { Navigation, Clock, MapPin } from 'lucide-react';

interface RouteDetailsProps {
  route: Route;
  weatherData: WeatherData[];
}

export default function RouteDetails({ route, weatherData }: RouteDetailsProps) {
  const [activeTab, setActiveTab] = useState<'directions' | 'weather'>('directions');

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Route Details</h3>
        <div className="flex gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {formatDistance(route.distance)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDuration(route.duration)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'directions'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('directions')}
        >
          <Navigation className="w-4 h-4 inline mr-1" />
          Directions
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'weather'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('weather')}
        >
          Weather Timeline
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'directions' ? (
          <DirectionsList instructions={route.instructions || []} />
        ) : (
          <WeatherTimeline weatherData={weatherData} />
        )}
      </div>
    </Card>
  );
}

function DirectionsList({ instructions }: { instructions: any[] }) {
  if (instructions.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        Turn-by-turn directions will appear here once available.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {instructions.map((instruction, index) => (
        <li key={index} className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm">{instruction.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistance(instruction.distance)} • {formatDuration(instruction.duration)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function WeatherTimeline({ weatherData }: { weatherData: WeatherData[] }) {
  if (weatherData.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        Weather information will appear here once your route is calculated.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {weatherData.map((weather, index) => {
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
          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={getWeatherIcon(weather.icon)}
              alt={weather.description}
              className="w-12 h-12"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    Waypoint {index + 1}
                    {index === 0 && ' (Start)'}
                    {index === weatherData.length - 1 && ' (End)'}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
                  {timeString && (
                    <p className="text-xs text-gray-500 mt-1">
                      Arrival: {timeString} {dateString}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatTemperature(weather.temperature)}</p>
                  <Badge
                    className={`${getSeverityBgColor(weather.severity)} text-white text-xs`}
                  >
                    {weather.severity}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                <span>Wind: {Math.round(weather.windSpeed * 2.237)} mph</span>
                <span>Humidity: {weather.humidity}%</span>
                {weather.precipitation && weather.precipitation > 0 && (
                  <span>Rain: {weather.precipitation.toFixed(1)} mm/h</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}