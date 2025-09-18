import { NextRequest, NextResponse } from 'next/server';
import { decodePolyline } from '@/lib/utils/route-utils';

const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, alternatives = false } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    // Try Mapbox Directions API first if token available
    if (MAPBOX_TOKEN) {
      const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
      const params = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        geometries: 'geojson',
        overview: 'full',
        steps: 'true',
        alternatives: alternatives ? 'true' : 'false'
      });

      const response = await fetch(`${mapboxUrl}?${params}`);

      if (response.ok) {
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routes = data.routes.map((route: any, index: number) => ({
            id: `route-${index}`,
            origin,
            destination,
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry.coordinates,
            instructions: route.legs[0]?.steps?.map((step: any) => ({
              text: step.maneuver.instruction,
              distance: step.distance,
              duration: step.duration,
              type: step.maneuver.type
            })) || []
          }));

          return NextResponse.json(routes);
        }
      }
    }

    // Fallback to OpenRouteService
    if (OPENROUTE_API_KEY) {
      const openrouteUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';
      const openrouteBody = {
        coordinates: [[origin.lng, origin.lat], [destination.lng, destination.lat]],
        alternative_routes: alternatives ? { target_count: 2 } : undefined
      };

      const response = await fetch(openrouteUrl, {
        method: 'POST',
        headers: {
          'Authorization': OPENROUTE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(openrouteBody)
      });

      if (response.ok) {
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routes = data.routes.map((route: any, index: number) => {
            // Decode the polyline geometry if needed
            const geometry = route.geometry.coordinates ||
              decodePolyline(route.geometry);

            return {
              id: `route-${index}`,
              origin,
              destination,
              distance: route.summary.distance,
              duration: route.summary.duration,
              geometry,
              instructions: route.segments[0]?.steps?.map((step: any) => ({
                text: step.instruction,
                distance: step.distance,
                duration: step.duration,
                type: step.type?.toString()
              })) || []
            };
          });

          return NextResponse.json(routes);
        }
      }
    }

    // Fallback: Create a simple straight-line route for demo purposes
    const demoRoute = {
      id: 'demo-route',
      origin,
      destination,
      distance: calculateDistance([origin.lng, origin.lat], [destination.lng, destination.lat]),
      duration: 3600, // 1 hour estimate
      geometry: generateStraightPath(origin, destination, 10),
      instructions: [{
        text: 'Head toward destination',
        distance: 0,
        duration: 0,
        type: 'depart'
      }, {
        text: 'Arrive at destination',
        distance: 0,
        duration: 0,
        type: 'arrive'
      }]
    };

    return NextResponse.json([demoRoute]);
  } catch (error) {
    console.error('Routing error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate route' },
      { status: 500 }
    );
  }
}

function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const R = 6371e3;
  const φ1 = (point1[1] * Math.PI) / 180;
  const φ2 = (point2[1] * Math.PI) / 180;
  const Δφ = ((point2[1] - point1[1]) * Math.PI) / 180;
  const Δλ = ((point2[0] - point1[0]) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function generateStraightPath(
  origin: { lng: number; lat: number },
  destination: { lng: number; lat: number },
  numPoints: number
): [number, number][] {
  const path: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    const lat = origin.lat + (destination.lat - origin.lat) * t;
    path.push([lng, lat]);
  }

  return path;
}