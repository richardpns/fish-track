// hooks/useWeather.js
import { useEffect, useState } from 'react';
import axios from 'axios';

const WEATHER_API_KEY = 'bb394aa34f5b6105ec442df49eacd30b'; 
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Hook personalizado para obter dados climáticos
export default function useWeather(latitude, longitude) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!latitude || !longitude) {
        setError('Coordenadas inválidas.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(WEATHER_API_URL, {
          params: {
            lat: latitude,
            lon: longitude,
            appid: WEATHER_API_KEY,
            units: 'metric',
          },
        });
        setWeather(response.data);
      } catch (err) {
        console.error("Erro ao obter dados climáticos:", err);
        setError('Erro ao obter dados climáticos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]);

  return { weather, loading, error };
}
