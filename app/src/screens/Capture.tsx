import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { captureService } from '../services/firebaseService';
import { useNavigation } from '@react-navigation/native';
import { CustomAlert } from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

const API_KEY = '3956f52e5e3e4d17bc75a48c3ac48f05';

export function Capture() {
    const { colors, isDarkMode } = useAppTheme();
    const [date, setDate] = useState(''); // Estado para a data
    const [weather, setWeather] = useState(''); // Estado para o clima
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const [species, setSpecies] = useState('');
    const [weight, setWeight] = useState('');
    const [size, setSize] = useState('');
    const navigation = useNavigation();
    const { isVisible, config, showAlert, hideAlert } = useCustomAlert();

    // Busca a data e o clima automaticamente ao carregar a tela
    useEffect(() => {
        // Pega a data atual
        const currentDate = new Date().toLocaleDateString(); // Formato local de data
        setDate(currentDate);

        // Busca o clima
        const fetchWeather = async () => {
            try {
                const locationStatus = await Location.requestForegroundPermissionsAsync();
                if (locationStatus.status !== 'granted') {
                    showAlert({
                        type: 'warning',
                        title: 'Permissão necessária',
                        message: 'Precisamos da localização para buscar o clima.',
                        buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                    });
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${API_KEY}`
                );
                
                const data = await response.json();

                if (response.ok && data.weather && data.weather[0]) {
                    setWeather(`${data.weather[0].description}, ${Math.round(data.main.temp)}°C`);
                } else {
                    console.error('Erro na resposta da API:', data);
                    throw new Error(data.message || 'Erro ao buscar clima');
                }
            } catch (error) {
                showAlert({
                    type: 'error',
                    title: 'Erro',
                    message: 'Não foi possível obter o clima.',
                    buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Função de submissão do formulário
    const handleSubmit = async () => {
        try {
            if (!image) {
                showAlert({
                    type: 'warning',
                    title: 'Atenção',
                    message: 'Por favor, adicione uma imagem da captura.',
                    buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                });
                return;
            }

            if (!species || !weight || !size) {
                showAlert({
                    type: 'warning',
                    title: 'Atenção',
                    message: 'Por favor, preencha todos os campos.',
                    buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                });
                return;
            }

            const location = await Location.getCurrentPositionAsync({});

            const captureData = {
                species,
                weight: Number(weight),
                size: Number(size),
                date,
                weather: weather || 'Clima indisponível',
                image,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            await captureService.addCapture(captureData);
            showAlert({
                type: 'success',
                title: 'Sucesso',
                message: 'Captura registrada com sucesso!',
                buttons: [{ 
                    text: 'OK', 
                    onPress: () => {
                        hideAlert();
                        navigation.navigate('Catches' as never);
                    },
                    style: 'default'
                }]
            });
        } catch (error: any) {
            showAlert({
                type: 'error',
                title: 'Erro',
                message: 'Não foi possível salvar a captura.',
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                Carregando dados...
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={[styles.title, { color: colors.text }]}>Nova Captura</Text>
                            
                            <View style={[styles.imageContainer, { backgroundColor: colors.card }]}>
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.image} />
                                ) : (
                                    <View style={[styles.imagePlaceholder, { 
                                        backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
                                        borderColor: colors.border 
                                    }]}>
                                        <MaterialIcons name="add-a-photo" size={40} color={colors.textSecondary} />
                                        <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                                            Adicionar Foto
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.imageButtons}>
                                    <TouchableOpacity 
                                        style={[styles.button, { backgroundColor: colors.primary }]} 
                                        onPress={pickImage}
                                    >
                                        <MaterialIcons name="photo-library" size={20} color="#FFF" />
                                        <Text style={styles.buttonText}>Galeria</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.button, { backgroundColor: colors.primary }]} 
                                        onPress={takePhoto}
                                    >
                                        <MaterialIcons name="camera-alt" size={20} color="#FFF" />
                                        <Text style={styles.buttonText}>Câmera</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
                                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                                    <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} />
                                    <TextInput
                                        style={[styles.infoInput, { color: colors.text }]}
                                        value={date}
                                        editable={false}
                                    />
                                </View>

                                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                                    <MaterialIcons name="wb-sunny" size={20} color={colors.textSecondary} />
                                    <TextInput
                                        style={[styles.infoInput, { color: colors.text }]}
                                        value={weather}
                                        editable={false}
                                    />
                                </View>

                                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                                    <MaterialIcons name="scale" size={20} color={colors.textSecondary} />
                                    <TextInput 
                                        style={[styles.infoInput, { color: colors.text }]}
                                        placeholder="Peso (kg)"
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="numeric"
                                        value={weight}
                                        onChangeText={setWeight}
                                    />
                                </View>

                                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                                    <MaterialIcons name="straighten" size={20} color={colors.textSecondary} />
                                    <TextInput 
                                        style={[styles.infoInput, { color: colors.text }]}
                                        placeholder="Tamanho (cm)"
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="numeric"
                                        value={size}
                                        onChangeText={setSize}
                                    />
                                </View>

                                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                                    <MaterialIcons name="pets" size={20} color={colors.textSecondary} />
                                    <TextInput 
                                        style={[styles.infoInput, { color: colors.text }]}
                                        placeholder="Espécie"
                                        placeholderTextColor={colors.textSecondary}
                                        value={species}
                                        onChangeText={setSpecies}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitButton, { backgroundColor: colors.success }]} 
                                onPress={handleSubmit}
                            >
                                <MaterialIcons name="save" size={24} color="#FFF" />
                                <Text style={styles.submitButtonText}>Salvar Captura</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
            <CustomAlert
                visible={isVisible}
                type={config.type}
                title={config.title}
                message={config.message}
                buttons={config.buttons}
                onClose={hideAlert}
            />
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
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
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
    },
    imageContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    image: {
        width: 250,
        height: 250,
        borderRadius: 15,
    },
    imagePlaceholder: {
        width: 250,
        height: 250,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    imagePlaceholderText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    imageButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 15,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 8,
        width: '45%',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFF',
        marginLeft: 8,
        fontSize: 16,
    },
    infoContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    infoInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
        padding: 5,
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
