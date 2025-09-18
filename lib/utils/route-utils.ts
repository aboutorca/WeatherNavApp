import { Location } from '@/lib/types';

// Calculate distance between two points using Haversine formula
export function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1[1] * Math.PI) / 180;
  const φ2 = (point2[1] * Math.PI) / 180;
  const Δφ = ((point2[1] - point1[1]) * Math.PI) / 180;
  const Δλ = ((point2[0] - point1[0]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Sample waypoints along a route at regular intervals
export function sampleWaypoints(
  routeCoordinates: [number, number][],
  totalDistance: number,
  totalDuration: number
): { point: [number, number]; distance: number; estimatedTime: number }[] {
  const waypoints: { point: [number, number]; distance: number; estimatedTime: number }[] = [];

  // Sample every 50 miles or 30 minutes, whichever is shorter
  const DISTANCE_INTERVAL = 80467; // 50 miles in meters
  const TIME_INTERVAL = 1800; // 30 minutes in seconds

  const avgSpeed = totalDistance / totalDuration; // meters per second
  const effectiveInterval = Math.min(DISTANCE_INTERVAL, avgSpeed * TIME_INTERVAL);

  let accumulatedDistance = 0;
  let accumulatedTime = 0;
  let lastSampledDistance = 0;

  // Always include the start point
  waypoints.push({
    point: routeCoordinates[0],
    distance: 0,
    estimatedTime: 0
  });

  for (let i = 1; i < routeCoordinates.length; i++) {
    const segmentDistance = calculateDistance(routeCoordinates[i - 1], routeCoordinates[i]);
    accumulatedDistance += segmentDistance;
    accumulatedTime += (segmentDistance / avgSpeed);

    if (accumulatedDistance - lastSampledDistance >= effectiveInterval) {
      waypoints.push({
        point: routeCoordinates[i],
        distance: accumulatedDistance,
        estimatedTime: accumulatedTime
      });
      lastSampledDistance = accumulatedDistance;
    }
  }

  // Always include the end point
  const lastPoint = routeCoordinates[routeCoordinates.length - 1];
  const lastWaypoint = waypoints[waypoints.length - 1];

  if (lastWaypoint.point[0] !== lastPoint[0] || lastWaypoint.point[1] !== lastPoint[1]) {
    waypoints.push({
      point: lastPoint,
      distance: totalDistance,
      estimatedTime: totalDuration
    });
  }

  return waypoints;
}

export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) {
    return `${Math.round(meters * 3.28084)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

export function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}