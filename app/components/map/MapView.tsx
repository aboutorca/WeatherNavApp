'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, Route, WeatherData } from '@/lib/types';
import { getSeverityColor } from '@/lib/utils/weather-utils';
import WeatherPopup from './WeatherPopup';

interface MapViewProps {
  origin?: Location;
  destination?: Location;
  route?: Route;
  weatherData?: WeatherData[];
  onMapClick?: (location: Location) => void;
}

export default function MapView({
  origin,
  destination,
  route,
  weatherData,
  onMapClick
}: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [selectedWeather, setSelectedWeather] = useState<WeatherData | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4,
    pitch: 0,
    bearing: 0
  });

  // Fit bounds to route when it changes
  useEffect(() => {
    if (route && route.geometry.length > 0 && mapRef.current) {
      const bounds = route.geometry.reduce(
        (bounds, coord) => {
          return {
            minLng: Math.min(bounds.minLng, coord[0]),
            maxLng: Math.max(bounds.maxLng, coord[0]),
            minLat: Math.min(bounds.minLat, coord[1]),
            maxLat: Math.max(bounds.maxLat, coord[1])
          };
        },
        {
          minLng: route.geometry[0][0],
          maxLng: route.geometry[0][0],
          minLat: route.geometry[0][1],
          maxLat: route.geometry[0][1]
        }
      );

      mapRef.current.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat]
        ],
        { padding: 50, duration: 1000 }
      );
    }
  }, [route]);

  const handleMapClick = (event: any) => {
    if (onMapClick) {
      const { lng, lat } = event.lngLat;
      onMapClick({ lat, lng });
    }
  };

  // Create GeoJSON for route line
  const routeGeoJSON = route
    ? {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: route.geometry
        }
      }
    : null;

  // Create weather severity segments for the route
  const weatherSegments = weatherData && route ? createWeatherSegments(route, weatherData) : [];

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      onClick={handleMapClick}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNrNW8wZHF0ZDA2ZGQzZW55MjVhOHFxZGEifQ.demo'}
      style={{ width: '100%', height: '100%' }}
      interactiveLayerIds={['weather-points']}
      collectStats={false}
    >
      <NavigationControl position="top-right" />

      {/* Route line */}
      {routeGeoJSON && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.6
            }}
          />
        </Source>
      )}

      {/* Weather severity segments overlay */}
      {weatherSegments.map((segment, index) => (
        <Source
          key={`weather-segment-${index}`}
          id={`weather-segment-${index}`}
          type="geojson"
          data={segment.geoJSON}
        >
          <Layer
            id={`weather-segment-layer-${index}`}
            type="line"
            paint={{
              'line-color': segment.color,
              'line-width': 6,
              'line-opacity': 0.8
            }}
          />
        </Source>
      ))}

      {/* Origin marker */}
      {origin && (
        <Marker longitude={origin.lng} latitude={origin.lat} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold mb-1">
              Start
            </div>
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg" />
          </div>
        </Marker>
      )}

      {/* Destination marker */}
      {destination && (
        <Marker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold mb-1">
              End
            </div>
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg" />
          </div>
        </Marker>
      )}

      {/* Weather markers */}
      {weatherData?.map((weather, index) => (
        <Marker
          key={`weather-${index}`}
          longitude={weather.location.lng}
          latitude={weather.location.lat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedWeather(weather);
          }}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: getSeverityColor(weather.severity) }}
          >
            {Math.round((weather.temperature * 9/5) + 32)}°
          </div>
        </Marker>
      ))}

      {/* Weather popup */}
      {selectedWeather && (
        <Popup
          longitude={selectedWeather.location.lng}
          latitude={selectedWeather.location.lat}
          anchor="bottom"
          onClose={() => setSelectedWeather(null)}
          closeButton={true}
          closeOnClick={false}
          maxWidth="300px"
        >
          <WeatherPopup weather={selectedWeather} />
        </Popup>
      )}
    </Map>
  );
}

function createWeatherSegments(route: Route, weatherData: WeatherData[]) {
  const segments: { geoJSON: any; color: string }[] = [];

  if (weatherData.length < 2) return segments;

  for (let i = 0; i < weatherData.length - 1; i++) {
    const startWeather = weatherData[i];
    const endWeather = weatherData[i + 1];

    // Find the route points between these weather points
    const startIdx = findClosestPointIndex(route.geometry, [
      startWeather.location.lng,
      startWeather.location.lat
    ]);
    const endIdx = findClosestPointIndex(route.geometry, [
      endWeather.location.lng,
      endWeather.location.lat
    ]);

    if (startIdx < endIdx) {
      const segmentCoords = route.geometry.slice(startIdx, endIdx + 1);
      const worstSeverity = startWeather.severity === 'severe' || endWeather.severity === 'severe'
        ? 'severe'
        : startWeather.severity === 'warning' || endWeather.severity === 'warning'
        ? 'warning'
        : startWeather.severity === 'caution' || endWeather.severity === 'caution'
        ? 'caution'
        : 'clear';

      segments.push({
        geoJSON: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: segmentCoords
          }
        },
        color: getSeverityColor(worstSeverity)
      });
    }
  }

  return segments;
}

function findClosestPointIndex(points: [number, number][], target: [number, number]): number {
  let minDist = Infinity;
  let minIdx = 0;

  for (let i = 0; i < points.length; i++) {
    const dist = Math.sqrt(
      Math.pow(points[i][0] - target[0], 2) + Math.pow(points[i][1] - target[1], 2)
    );
    if (dist < minDist) {
      minDist = dist;
      minIdx = i;
    }
  }

  return minIdx;
}