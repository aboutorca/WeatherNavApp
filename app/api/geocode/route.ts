import { NextRequest, NextResponse } from 'next/server';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!MAPBOX_TOKEN) {
      // Fallback to Nominatim if no Mapbox token
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=5`;

      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'WeatherNavApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      // Transform Nominatim response to match our format
      const results = data.map((item: any) => ({
        place_name: item.display_name,
        center: [parseFloat(item.lon), parseFloat(item.lat)],
        place_type: [item.type || 'place'],
        address: item.display_name
      }));

      return NextResponse.json(results);
    }

    // Use Mapbox Geocoding API
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}&limit=5`;

    const response = await fetch(mapboxUrl);

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    return NextResponse.json(data.features || []);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}