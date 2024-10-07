// app/profile.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import WeatherDetails from '../components/WeatherDetails';
import useWeather from '../hooks/useWeather';

export default function Profile() {
  const [error, setError] = useState(null);
  const weather = useWeather();

  useEffect(() => {
    // Lógica para verificar se houve erro ao buscar os dados do clima
    if (weather.error) {
      setError(weather.error);
    }
  }, [weather]);

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>Erro ao carregar clima: {error}</Text>}
      {!weather && !error ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <WeatherDetails weather={weather} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
});
