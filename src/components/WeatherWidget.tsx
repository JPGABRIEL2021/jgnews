import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, MapPin, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  city: string;
}

const weatherCodeMap: Record<number, { icon: React.ReactNode; description: string }> = {
  0: { icon: <Sun className="w-8 h-8 text-yellow-500" />, description: "Céu limpo" },
  1: { icon: <Sun className="w-8 h-8 text-yellow-500" />, description: "Parcialmente limpo" },
  2: { icon: <Cloud className="w-8 h-8 text-gray-400" />, description: "Parcialmente nublado" },
  3: { icon: <Cloud className="w-8 h-8 text-gray-500" />, description: "Nublado" },
  45: { icon: <Cloud className="w-8 h-8 text-gray-400" />, description: "Névoa" },
  48: { icon: <Cloud className="w-8 h-8 text-gray-400" />, description: "Névoa gelada" },
  51: { icon: <CloudRain className="w-8 h-8 text-blue-400" />, description: "Chuvisco leve" },
  53: { icon: <CloudRain className="w-8 h-8 text-blue-400" />, description: "Chuvisco" },
  55: { icon: <CloudRain className="w-8 h-8 text-blue-500" />, description: "Chuvisco forte" },
  61: { icon: <CloudRain className="w-8 h-8 text-blue-400" />, description: "Chuva leve" },
  63: { icon: <CloudRain className="w-8 h-8 text-blue-500" />, description: "Chuva" },
  65: { icon: <CloudRain className="w-8 h-8 text-blue-600" />, description: "Chuva forte" },
  71: { icon: <CloudSnow className="w-8 h-8 text-blue-200" />, description: "Neve leve" },
  73: { icon: <CloudSnow className="w-8 h-8 text-blue-300" />, description: "Neve" },
  75: { icon: <CloudSnow className="w-8 h-8 text-blue-400" />, description: "Neve forte" },
  80: { icon: <CloudRain className="w-8 h-8 text-blue-400" />, description: "Pancadas de chuva" },
  81: { icon: <CloudRain className="w-8 h-8 text-blue-500" />, description: "Pancadas moderadas" },
  82: { icon: <CloudRain className="w-8 h-8 text-blue-600" />, description: "Pancadas fortes" },
  95: { icon: <CloudLightning className="w-8 h-8 text-yellow-400" />, description: "Tempestade" },
  96: { icon: <CloudLightning className="w-8 h-8 text-yellow-500" />, description: "Tempestade com granizo" },
  99: { icon: <CloudLightning className="w-8 h-8 text-yellow-600" />, description: "Tempestade severa" },
};

const getWeatherInfo = (code: number) => {
  return weatherCodeMap[code] || { icon: <Cloud className="w-8 h-8 text-gray-400" />, description: "Tempo variável" };
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        // Fetch weather data from Open-Meteo (free, no API key needed)
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        
        if (!weatherResponse.ok) throw new Error("Falha ao buscar clima");
        
        const weatherData = await weatherResponse.json();
        
        // Reverse geocoding to get city name
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
        );
        
        let cityName = "Sua localização";
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          cityName = geoData.address?.city || geoData.address?.town || geoData.address?.municipality || "Sua localização";
        }

        setWeather({
          temperature: Math.round(weatherData.current.temperature_2m),
          weatherCode: weatherData.current.weather_code,
          humidity: weatherData.current.relative_humidity_2m,
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
          city: cityName,
        });
      } catch (err) {
        setError("Não foi possível carregar o clima");
      } finally {
        setLoading(false);
      }
    };

    const getLocation = () => {
      if (!navigator.geolocation) {
        setError("Geolocalização não suportada");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          // Fallback to São Paulo if geolocation denied
          fetchWeather(-23.5505, -46.6333);
        },
        { timeout: 10000 }
      );
    };

    getLocation();
  }, []);

  if (error) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const weatherInfo = getWeatherInfo(weather.weatherCode);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
      {/* Weather Icon */}
      <div className="shrink-0">
        {weatherInfo.icon}
      </div>

      {/* Temperature & Description */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{weather.temperature}°</span>
          <span className="text-xs text-muted-foreground">C</span>
        </div>
        <span className="text-xs text-muted-foreground">{weatherInfo.description}</span>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border mx-2 hidden sm:block" />

      {/* Location */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="max-w-[100px] sm:max-w-[120px] truncate">{weather.city}</span>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border mx-2 hidden md:block" />

      {/* Extra Info */}
      <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
