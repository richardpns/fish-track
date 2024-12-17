import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAppTheme } from '../hooks/useAppTheme';

interface WeatherData {
    name: string;
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
    };
    weather: Array<{
        description: string;
        main: string;
    }>;
    wind: {
        speed: number;
    };
}

interface ForecastData {
    dt: number;
    main: {
        temp: number;
    };
    weather: Array<{
        description: string;
        icon: string;
        main: string;
    }>;
    rain?: {
        "3h": number;
    };
}

const API_KEY = '3956f52e5e3e4d17bc75a48c3ac48f05';

export function Weather() {
    const { colors, isDarkMode } = useAppTheme();
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [lunarPhase, setLunarPhase] = useState('');
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

    const fetchWeather = async (latitude: number, longitude: number) => {
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

    const fetchForecast = async (latitude: number, longitude: number) => {
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

    const getChartData = () => {
        if (!forecastData.length) return null;

        const hours = forecastData.map(forecast => 
            new Date(forecast.dt * 1000).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
            })
        );

        const temperatures = forecastData.map(forecast => Math.round(forecast.main.temp));
        const rainfall = forecastData.map(forecast => forecast.rain ? forecast.rain["3h"] : 0);
        const descriptions = forecastData.map(forecast => forecast.weather[0].description);

        return (
            <View style={[styles.forecastContainer, { backgroundColor: colors.card }]}>
                <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                            Temperatura (°C)
                        </Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                            Chuva (mm)
                        </Text>
                    </View>
                </View>

                <LineChart
                    data={{
                        labels: hours,
                        datasets: [
                            {
                                data: temperatures,
                                color: (opacity = 1) => isDarkMode 
                                    ? `rgba(100, 181, 246, ${opacity})`
                                    : `rgba(33, 150, 243, ${opacity})`,
                                strokeWidth: 2,
                            },
                            {
                                data: rainfall,
                                color: (opacity = 1) => isDarkMode 
                                    ? `rgba(129, 199, 132, ${opacity})`
                                    : `rgba(76, 175, 80, ${opacity})`,
                                strokeWidth: 2,
                            }
                        ],
                        legend: ["Temperatura", "Chuva"]
                    }}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: colors.card,
                        backgroundGradientFrom: colors.card,
                        backgroundGradientTo: colors.card,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '51, 51, 51'}, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '51, 51, 51'}, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                        },
                        propsForBackgroundLines: {
                            strokeDasharray: '',
                            stroke: isDarkMode ? '#333333' : '#e3e3e3',
                            strokeWidth: 1,
                        },
                        propsForLabels: {
                            fontSize: 11,
                        },
                    }}
                    bezier
                    style={styles.chart}
                    withDots={true}
                    withShadow={false}
                    withInnerLines={true}
                    withOuterLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    segments={4}
                />

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.descriptionsScroll}>
                    {descriptions.map((desc, index) => (
                        <View key={index} style={[styles.descriptionCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.descriptionTime, { color: colors.text }]}>{hours[index]}h</Text>
                            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{desc}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                Carregando dados do clima...
                            </Text>
                        </View>
                    ) : weatherData ? (
                        <>
                            <View style={[styles.mainWeatherCard, { backgroundColor: colors.primary }]}>
                                <Text style={styles.city}>{weatherData.name}</Text>
                                <Text style={styles.temperature}>
                                    {Math.round(weatherData.main.temp)}°C
                                </Text>
                                <Text style={styles.condition}>
                                    {weatherData.weather[0].description}
                                </Text>
                                
                                <View style={styles.weatherDetailsGrid}>
                                    <View style={styles.weatherDetail}>
                                        <MaterialIcons name="opacity" size={24} color="#fff" />
                                        <Text style={styles.weatherDetailLabel}>Umidade</Text>
                                        <Text style={styles.weatherDetailText}>
                                            {weatherData.main.humidity}%
                                        </Text>
                                    </View>
                                    <View style={styles.weatherDetail}>
                                        <MaterialIcons name="air" size={24} color="#fff" />
                                        <Text style={styles.weatherDetailLabel}>Vento</Text>
                                        <Text style={styles.weatherDetailText}>
                                            {weatherData.wind.speed} km/h
                                        </Text>
                                    </View>
                                    <View style={styles.weatherDetail}>
                                        <MaterialIcons name="compress" size={24} color="#fff" />
                                        <Text style={styles.weatherDetailLabel}>Pressão</Text>
                                        <Text style={styles.weatherDetailText}>
                                            {weatherData.main.pressure} hPa
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {getChartData()}

                            <View style={[styles.card, { backgroundColor: colors.card }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    <MaterialIcons name="nights-stay" size={24} color={colors.primary} /> 
                                    Fase Lunar
                                </Text>
                                <Text style={[styles.details, { color: colors.textSecondary }]}>
                                    {lunarPhase}
                                </Text>
                            </View>

                            <View style={[styles.card, styles.lastCard, { backgroundColor: colors.card }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    <MaterialIcons name="waves" size={24} color={colors.primary} /> 
                                    Condições para Pesca
                                </Text>
                                <Text style={[styles.details, { color: colors.textSecondary }]}>
                                    {analisarClimaParaPesca()}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.errorContainer}>
                            <MaterialIcons name="error-outline" size={48} color={colors.error} />
                            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                                Não foi possível carregar os dados do clima.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    mainWeatherCard: {
        backgroundColor: '#2196F3',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    city: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    temperature: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
    },
    condition: {
        fontSize: 18,
        color: '#fff',
        textTransform: 'capitalize',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lastCard: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailsContainer: {
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 5,
    },
    details: {
        fontSize: 16,
        color: '#444',
        flex: 1,
    },
    forecastContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        paddingRight: 15,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        gap: 20,
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    descriptionsScroll: {
        marginTop: 10,
    },
    descriptionCard: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
        marginRight: 10,
        minWidth: 100,
        alignItems: 'center',
    },
    descriptionTime: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
    weatherDetailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    weatherDetail: {
        alignItems: 'center',
        flex: 1,
    },
    weatherDetailLabel: {
        color: '#fff',
        fontSize: 14,
        marginTop: 5,
        opacity: 0.9,
    },
    weatherDetailText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 2,
    },
});
