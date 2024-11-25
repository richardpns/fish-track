import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

const API_KEY = '3956f52e5e3e4d17bc75a48c3ac48f05';

export function Weather() {
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [lunarPhase, setLunarPhase] = useState(''); // Novo estado para fase da lua
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState({
        latitude: 0,
        longitude: 0,
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à localização para obter o clima atual.');
                setLoading(false);
                return;
            }
            let userLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = userLocation.coords;
            setLocation({ latitude, longitude });
        })();
    }, []);

    useEffect(() => {
        if (location.latitude !== 0 && location.longitude !== 0) {
            fetchWeather(location.latitude, location.longitude);
            fetchForecast(location.latitude, location.longitude);
        }
    }, [location]);

    const fetchWeather = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${API_KEY}`);
            const result = await response.json();
            setWeatherData(result);
        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
            Alert.alert('Erro', 'Não foi possível obter as informações do clima atual.');
        } finally {
            setLoading(false);
        }
    };

    const fetchForecast = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${API_KEY}`);
            const result = await response.json();
            setForecastData(result.list.slice(0, 5)); // Obtém as previsões para as próximas 5 intervalos de 3 horas

            // Armazena a fase lunar para o primeiro dia da previsão
            setLunarPhase(result.city.sunrise > result.city.sunset ? 'Lua Nova' : 'Lua Cheia'); 
        } catch (error) {
            console.error("Erro ao buscar dados da API de previsão:", error);
            Alert.alert('Erro', 'Não foi possível obter as informações de previsão do tempo.');
        }
    };

    // Função para analisar se o clima e a fase lunar são favoráveis para pesca
    const analisarClimaParaPesca = () => {
        if (!weatherData) return '';

        const temp = weatherData.main.temp;
        const humidity = weatherData.main.humidity;
        const windSpeed = weatherData.wind.speed;
        const condition = weatherData.weather[0].main;

        const faseFavoravel = lunarPhase === 'Lua Cheia' || lunarPhase === 'Lua Nova';

        if (temp > 15 && temp < 30 && humidity < 80 && windSpeed < 5 && condition !== 'Rain' && faseFavoravel) {
            return 'Clima e fase da lua favoráveis para pesca';
        } else {
            return 'Condições desfavoráveis para pesca';
        }
    };

    return (
        <View style={styles.container}>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : weatherData ? (
                <View style={styles.weatherContainer}>
                    <Text style={styles.city}>{weatherData.name}</Text>
                    <Text style={styles.temperature}>{weatherData.main.temp}°C</Text>
                    <Text style={styles.condition}>{weatherData.weather[0].description}</Text>
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Clima</Text>
                        <Text style={styles.details}>Sensação Térmica: {weatherData.main.feels_like}°C</Text>
                        <Text style={styles.details}>Umidade: {weatherData.main.humidity}%</Text>
                        <Text style={styles.details}>Pressão: {weatherData.main.pressure} hPa</Text>
                        <Text style={styles.details}>Vento: {weatherData.wind.speed} m/s</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Previsão</Text>
                        {forecastData.map((forecast, index) => (
                            <View key={index} style={styles.forecastItem}>
                                <Text style={styles.forecastTime}>
                                    {new Date(forecast.dt * 1000).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                                <Text style={styles.forecastTemp}>{forecast.main.temp}°C</Text>
                                <Text style={styles.forecastDescription}>{forecast.weather[0].description}</Text>
                                <Text style={styles.forecastRain}>
                                    Chuva: {forecast.rain ? `${forecast.rain["3h"]} mm` : '0 mm'}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Seção para a fase lunar e condições de pesca */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Fase Lunar</Text>
                        <Text style={styles.details}>{lunarPhase}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Condições para Pesca</Text>
                        <Text style={styles.details}>{analisarClimaParaPesca()}</Text>
                    </View>
                </View>
            ) : (
                <Text>Não foi possível carregar os dados do clima.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    header: {
        padding: 15,
        backgroundColor: '#3a86ff',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    weatherContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    city: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    temperature: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    condition: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
        marginBottom: 20,
    },
    section: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#3a86ff',
    },
    details: {
        fontSize: 16,
        color: '#444',
        marginTop: 5,
    },
    forecastItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    forecastTime: {
        fontSize: 16,
        color: '#333',
    },
    forecastTemp: {
        fontSize: 16,
        color: '#3a86ff',
        fontWeight: 'bold',
    },
    forecastDescription: {
        fontSize: 16,
        color: '#777',
    },
    forecastRain: {
        fontSize: 16,
        color: '#333',
    },
});
