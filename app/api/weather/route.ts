import { NextRequest, NextResponse } from 'next/server';
import { getWeatherSeverity } from '@/lib/utils/weather-utils';
import { WeatherData } from '@/lib/types';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { waypoints, forecast = false } = body;

    if (!waypoints || !Array.isArray(waypoints)) {
      return NextResponse.json(
        { error: 'Waypoints array is required' },
        { status: 400 }
      );
    }

    const weatherData: WeatherData[] = [];

    // If we have an API key, fetch real weather data
    if (OPENWEATHER_API_KEY) {
      const weatherPromises = waypoints.map(async (waypoint: any) => {
        const { point, estimatedTime } = waypoint;
        const [lng, lat] = point;

        let url: string;
        if (forecast && estimatedTime) {
          // Use forecast API for future times
          url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        } else {
          // Use current weather API
          url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        }

        try {
          const response = await fetch(url);
          const data = await response.json();

          let weatherItem: any;
          if (forecast && data.list) {
            // Find the closest forecast time
            const targetTime = Date.now() + (estimatedTime * 1000);
            weatherItem = data.list.reduce((prev: any, curr: any) => {
              const prevDiff = Math.abs(prev.dt * 1000 - targetTime);
              const currDiff = Math.abs(curr.dt * 1000 - targetTime);
              return currDiff < prevDiff ? curr : prev;
            });
          } else {
            weatherItem = data;
          }

          const weather: WeatherData = {
            location: { lat, lng },
            temperature: weatherItem.main.temp,
            feelsLike: weatherItem.main.feels_like,
            humidity: weatherItem.main.humidity,
            windSpeed: weatherItem.wind.speed,
            windDirection: weatherItem.wind.deg || 0,
            visibility: weatherItem.visibility || 10000,
            description: weatherItem.weather[0].description,
            icon: weatherItem.weather[0].icon,
            precipitation: weatherItem.rain?.['1h'] || weatherItem.rain?.['3h'] || 0,
            severity: 'clear', // Will be calculated below
            timestamp: new Date(weatherItem.dt * 1000).toISOString()
          };

          // Calculate severity
          weather.severity = getWeatherSeverity(weather);

          return weather;
        } catch (error) {
          console.error('Error fetching weather for waypoint:', error);
          return generateMockWeather(lat, lng);
        }
      });

      const results = await Promise.all(weatherPromises);
      weatherData.push(...results);
    } else {
      // Generate mock weather data for demo
      for (const waypoint of waypoints) {
        const [lng, lat] = waypoint.point;
        weatherData.push(generateMockWeather(lat, lng));
      }
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

function generateMockWeather(lat: number, lng: number): WeatherData {
  // Generate varied mock weather based on coordinates
  const seed = Math.abs(lat + lng) % 4;
  const conditions = [
    {
      description: 'clear sky',
      icon: '01d',
      precipitation: 0,
      windSpeed: 3,
      visibility: 10000,
      severity: 'clear' as const
    },
    {
      description: 'light rain',
      icon: '10d',
      precipitation: 2,
      windSpeed: 5,
      visibility: 8000,
      severity: 'caution' as const
    },
    {
      description: 'heavy rain',
      icon: '09d',
      precipitation: 8,
      windSpeed: 8,
      visibility: 5000,
      severity: 'warning' as const
    },
    {
      description: 'thunderstorm',
      icon: '11d',
      precipitation: 15,
      windSpeed: 12,
      visibility: 2000,
      severity: 'severe' as const
    }
  ];

  const condition = conditions[Math.floor(seed)];

  return {
    location: { lat, lng },
    temperature: 20 + Math.random() * 10,
    feelsLike: 22 + Math.random() * 8,
    humidity: 40 + Math.random() * 40,
    windSpeed: condition.windSpeed + Math.random() * 3,
    windDirection: Math.random() * 360,
    visibility: condition.visibility,
    description: condition.description,
    icon: condition.icon,
    precipitation: condition.precipitation,
    severity: condition.severity,
    timestamp: new Date().toISOString()
  };
}