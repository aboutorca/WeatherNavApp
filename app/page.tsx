'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';
import dynamic from 'next/dynamic';
import { Location, Route, WeatherData } from '@/lib/types';
import { sampleWaypoints } from '@/lib/utils/route-utils';
import SearchPanel from './components/search/SearchPanel';
import WeatherSummary from './components/weather/WeatherSummary';
import RouteDetails from './components/weather/RouteDetails';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('./components/map/MapView'), {
  loading: () => <Skeleton className="w-full h-full" />,
  ssr: false
});

export default function Home() {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  // Mutation for fetching route
  const routeMutation = useMutation({
    mutationFn: async ({
      origin,
      destination,
      departureTime
    }: {
      origin: Location;
      destination: Location;
      departureTime?: Date;
    }) => {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          alternatives: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate route');
      }

      return response.json();
    },
    onSuccess: async (routes: Route[]) => {
      if (routes.length > 0) {
        setRoutes(routes);
        setSelectedRoute(routes[0]);

        // Fetch weather for the primary route
        await fetchWeatherForRoute(routes[0]);
      }
    },
    onError: (error) => {
      toast.error('Failed to calculate route. Please try again.');
      console.error('Route error:', error);
    }
  });

  // Fetch weather data for a route
  const fetchWeatherForRoute = async (route: Route) => {
    try {
      const waypoints = sampleWaypoints(
        route.geometry,
        route.distance,
        route.duration
      );

      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waypoints })
      });

      if (response.ok) {
        const weather = await response.json();
        setWeatherData(weather);

        // Check for severe weather
        const hasSevereWeather = weather.some((w: WeatherData) => w.severity === 'severe');
        if (hasSevereWeather) {
          toast.warning('Severe weather detected along your route. Consider alternative routes or timing.');
        }
      } else {
        toast.error('Unable to fetch weather data');
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast.error('Failed to load weather information');
    }
  };

  const handleSearch = useCallback(
    (origin: Location, destination: Location, departureTime?: Date) => {
      setOrigin(origin);
      setDestination(destination);
      setWeatherData([]);
      routeMutation.mutate({ origin, destination, departureTime });
    },
    [routeMutation]
  );

  const handleAlternativeRoute = useCallback(
    (routeIndex: number) => {
      if (routes[routeIndex]) {
        setSelectedRoute(routes[routeIndex]);
        fetchWeatherForRoute(routes[routeIndex]);
      }
    },
    [routes]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* Left Panel */}
      <div className="w-96 bg-white shadow-lg z-10 overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Weather Nav</h1>
          <p className="text-sm text-gray-600">Smart navigation with weather insights</p>
        </div>

        <div className="p-4 space-y-4">
          <SearchPanel
            onSearch={handleSearch}
            isLoading={routeMutation.isPending}
          />

          {weatherData.length > 0 && (
            <WeatherSummary
              route={selectedRoute || undefined}
              weatherData={weatherData}
            />
          )}

          {selectedRoute && (
            <RouteDetails
              route={selectedRoute}
              weatherData={weatherData}
            />
          )}

          {routes.length > 1 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Alternative Routes</h4>
              <div className="space-y-2">
                {routes.map((route, index) => (
                  <button
                    key={route.id}
                    onClick={() => handleAlternativeRoute(index)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedRoute?.id === route.id
                        ? 'bg-blue-100 border-blue-300 border'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Route {index + 1} • {Math.round(route.distance / 1609.34)} mi •{' '}
                    {Math.round(route.duration / 60)} min
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          origin={origin || undefined}
          destination={destination || undefined}
          route={selectedRoute || undefined}
          weatherData={weatherData}
        />

        {routeMutation.isPending && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm font-medium">Calculating route...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}