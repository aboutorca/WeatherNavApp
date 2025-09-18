# Weather Nav - Smart Navigation with Weather Insights

A weather-integrated navigation web application that provides real-time weather data along your entire route, enabling safer and more informed road trip planning.

## Features

✅ **A-to-B Driving Navigation** - Get turn-by-turn directions for your journey
✅ **Weather Integration** - See weather conditions at waypoints along your entire route
✅ **Weather-Based Route Intelligence** - Receive alerts for severe weather conditions
✅ **Trip Planning** - Plan trips up to 5 days in advance with weather forecasts
✅ **Alternative Routes** - View multiple route options when available
✅ **Interactive Map** - Powered by Mapbox GL JS with weather overlay visualization
✅ **Weather Severity Indicators** - Color-coded route segments based on weather conditions

## Tech Stack

- **Framework**: Next.js 15.0.0 with React 19
- **UI Components**: shadcn/ui v3.2.1
- **Map**: Mapbox GL JS with react-map-gl v8.1.0
- **State Management**: TanStack Query v5.87.4
- **Styling**: Tailwind CSS
- **Forms**: react-hook-form with zod validation
- **Notifications**: Sonner

## Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
cd weather-nav-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file with your API keys:

```env
# Map API (Required)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Weather API (Optional - app works with mock data if not provided)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Routing API (Optional - app works with fallback routing if not provided)
OPENROUTE_API_KEY=your_openroute_api_key_here
```

### Getting API Keys (Free Tiers Available)

1. **Mapbox**: Sign up at [mapbox.com](https://www.mapbox.com/) for a free token
2. **OpenWeatherMap**: Get a free API key at [openweathermap.org](https://openweathermap.org/api)
3. **OpenRouteService**: Register at [openrouteservice.org](https://openrouteservice.org/dev/)

### Running the Application

Development mode:
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

Production build:
```bash
npm run build
npm start
```

## How to Use

1. **Enter Your Route**
   - Type your starting point in the "Origin" field
   - Type your destination in the "Destination" field
   - Optionally set a departure time (up to 5 days in advance)

2. **Get Directions**
   - Click "Get Directions" to calculate your route
   - The map will display your route with weather indicators

3. **Review Weather Information**
   - Check the Weather Summary panel for overall conditions
   - View the Weather Timeline to see conditions at each waypoint
   - Look for color-coded severity indicators:
     - 🟢 Green: Clear conditions
     - 🟡 Yellow: Caution (light rain)
     - 🟠 Orange: Warning (heavy rain/snow)
     - 🔴 Red: Severe (storms/ice)

4. **Explore Alternative Routes**
   - If available, alternative routes will appear in the left panel
   - Click on an alternative to view it on the map

## Weather Severity Classification

The app classifies weather conditions into four severity levels:

- **Clear**: Good driving conditions
- **Caution**: Light precipitation, moderate wind
- **Warning**: Heavy rain/snow, poor visibility
- **Severe**: Storms, ice, extreme conditions

## API Rate Limits

When using free API tiers:
- Mapbox: 100,000 requests/month
- OpenWeatherMap: 1,000 calls/day
- OpenRouteService: 2,000 requests/day

## Deployment

The app is optimized for deployment on Vercel:

```bash
npm run build
```

Deploy to Vercel:
1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel settings
4. Deploy

## Troubleshooting

### Map not loading
- Verify your Mapbox token is correct and active
- Check browser console for errors
- Ensure the token is prefixed with `NEXT_PUBLIC_`

### No weather data
- The app will show mock weather data if API keys are missing
- Check that OpenWeatherMap API key is valid
- Verify you haven't exceeded API rate limits

### Routing errors
- The app will fall back to basic routing if APIs are unavailable
- Try using well-known city names for better geocoding results

## Development

### Project Structure
```
app/
├── api/           # API route handlers
├── components/    # React components
│   ├── map/      # Map-related components
│   ├── search/   # Search and input components
│   └── weather/  # Weather display components
├── lib/          # Utilities and types
└── page.tsx      # Main application page
```

### Key Commands
```bash
npm run dev        # Start development server
npm run build      # Create production build
npm run lint       # Run linter
npm run type-check # Check TypeScript types
```

## Contributing

This is an MVP prototype. Future enhancements could include:
- Native mobile apps
- Voice navigation
- Real-time traffic integration
- Multiple waypoint support
- Weather radar overlay
- Historical weather patterns

## License

MIT

---

Built with ❤️ for safer road trips