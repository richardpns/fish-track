import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, ScrollView, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { captureService } from '../services/firebaseService';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { CustomAlert } from '../components/CustomAlert';

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
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
        buttons?: any[];
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
    });

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
                    Alert.alert('Permissão necessária', 'Precisamos da localização para buscar o clima.');
                    setLoading(false);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error('Erro na resposta da API');
                }

                const data = await response.json();
                const weatherDescription = `${data.weather[0].description}, ${Math.round(data.main.temp)}°C`;
                setWeather(weatherDescription);
            } catch (error) {
                console.error('Erro ao buscar clima:', error);
                Alert.alert('Erro', 'Não foi possível obter o clima.');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const requestCameraPermission = async () => {
        const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
        
        if (existingStatus === 'granted') {
            return true;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos da sua permissão para usar a câmera. Por favor, ative a permissão nas configurações do seu dispositivo.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'Configurações', 
                        onPress: () => Linking.openSettings() 
                    }
                ]
            );
            return false;
        }
        return true;
    };

    const requestGalleryPermission = async () => {
        const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
        
        if (existingStatus === 'granted') {
            return true;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos da sua permissão para acessar a galeria. Por favor, ative a permissão nas configurações do seu dispositivo.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'Configurações', 
                        onPress: () => Linking.openSettings() 
                    }
                ]
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert(
                'Erro',
                'Não foi possível selecionar a imagem da galeria. Tente novamente.'
            );
        }
    };

    const takePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert(
                'Erro',
                'Não foi possível capturar a foto. Tente novamente.'
            );
        }
    };

    // Função helper para mostrar alertas
    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, buttons?: any[]) => {
        setAlertConfig({
            visible: true,
            type,
            title,
            message,
            buttons,
        });
    };

    // Função de submissão do formulário
    const handleSubmit = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                showAlert('error', 'Erro', 'Você precisa estar logado para registrar uma captura.');
                return;
            }

            if (!image) {
                showAlert('warning', 'Atenção', 'Por favor, adicione uma imagem da captura.');
                return;
            }

            if (!species || !weight || !size) {
                showAlert('warning', 'Atenção', 'Por favor, preencha todos os campos.');
                return;
            }

            // Obter localização atual
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showAlert('error', 'Erro', 'Precisamos da permissão de localização para salvar a captura.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});

            const captureData = {
                userId: currentUser.uid,
                species,
                weight: Number(weight),
                size: Number(size),
                date,
                weather,
                image,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            await captureService.addCapture(captureData);
            navigation.navigate('Catches' as never);
            
            setTimeout(() => {
                showAlert('success', 'Sucesso!', 'Captura registrada com sucesso!');
            }, 100);

        } catch (error: any) {
            console.error('Erro ao salvar captura:', error);
            showAlert('error', 'Erro', 'Não foi possível salvar a captura.');
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
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
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
