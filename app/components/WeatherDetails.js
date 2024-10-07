// WeatherDetails.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const WEATHER_API_KEY = 'bb394aa34f5b6105ec442df49eacd30b'; 
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export default function WeatherDetails({ latitude, longitude }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.error("Erro ao buscar informações climáticas:", err);
      setError('Erro ao carregar informações climáticas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    return () => {
      setWeather(null);
      setLoading(true);
      setError(null);
    };
  }, [latitude, longitude]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando informações climáticas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previsão do Tempo</Text>
      <Text style={styles.info}>Local: {weather.name}</Text>
      <Text style={styles.info}>Temperatura: {weather.main.temp} °C</Text>
      <Text style={styles.info}>Sensação Térmica: {weather.main.feels_like} °C</Text>
      <Text style={styles.info}>Clima: {weather.weather[0].description}</Text>
      <Text style={styles.info}>Humidade: {weather.main.humidity}%</Text>
      <Text style={styles.info}>Vento: {weather.wind.speed} m/s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    marginVertical: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffdddd',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
