import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, TouchableOpacity, Text, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { captureService, CaptureData } from '../services/firebaseService';
import { auth } from '../config/firebase';
import { CustomAlert } from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

export function Home() {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [region, setRegion] = useState({
        latitude: -23.104510,
        longitude: -48.612896,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
    const [selectedCatch, setSelectedCatch] = useState<CaptureData | null>(null);
    const [captures, setCaptures] = useState<CaptureData[]>([]);
    const [loading, setLoading] = useState(true);
    const { isVisible, config, showAlert, hideAlert } = useCustomAlert();

    useEffect(() => {
        getCurrentLocation();
        
        // Adiciona listener para mudanças no estado de autenticação
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // Se o usuário estiver logado, carrega as capturas
                loadCaptures();
            } else {
                // Se não estiver logado, limpa as capturas e o pin selecionado
                setCaptures([]);
                setSelectedCatch(null);
                setLoading(false);
            }
        });

        // Cleanup do listener quando o componente for desmontado
        return () => unsubscribe();
    }, []);

    const loadCaptures = async () => {
        try {
            console.log('Iniciando carregamento das capturas...');
            const userCaptures = await captureService.getUserCaptures();
            console.log('Capturas carregadas:', userCaptures);
            
            if (userCaptures && userCaptures.length > 0) {
                setCaptures(userCaptures);
                
                // Centraliza o mapa na primeira captura apenas se não houver localização do usuário
                if (!location) {
                    setRegion(prev => ({
                        ...prev,
                        latitude: userCaptures[0].latitude,
                        longitude: userCaptures[0].longitude,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }));
                }
            }
        } catch (error) {
            console.error('Erro ao carregar capturas:', error);
            Alert.alert('Erro', 'Não foi possível carregar as capturas.');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showAlert({
                    type: 'warning',
                    title: 'Permissão necessária',
                    message: 'Precisamos de acesso à localização para mostrar o mapa.',
                    buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                });
                return;
            }

            let userLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = userLocation.coords;

            setLocation({ latitude, longitude });
            setRegion(prev => ({
                ...prev,
                latitude,
                longitude,
            }));
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'Erro',
                message: 'Não foi possível obter sua localização.',
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
        }
    };

    const centerOnUserLocation = () => {
        if (location) {
            setRegion(prev => ({
                ...prev,
                latitude: location.latitude,
                longitude: location.longitude,
            }));
        }
    };

    const toggleMapType = () => {
        setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Carregando...</Text>
                </View>
            ) : (
                <>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        region={region}
                        onRegionChangeComplete={setRegion}
                        mapType={mapType}
                        showsUserLocation
                        showsMyLocationButton={false}
                        showsCompass
                        showsScale
                    >
                        {auth.currentUser && captures.length > 0 && captures.map((catchItem) => {
                            console.log('Renderizando marcador:', catchItem);
                            return (
                                <Marker
                                    key={catchItem.id}
                                    coordinate={{ 
                                        latitude: Number(catchItem.latitude), 
                                        longitude: Number(catchItem.longitude)
                                    }}
                                    onPress={() => setSelectedCatch(catchItem)}
                                >
                                    <MaterialIcons name="location-pin" size={30} color="#2196F3" />
                                    <Callout tooltip>
                                        <View style={styles.calloutContainer}>
                                            <Text style={styles.calloutTitle}>{catchItem.species}</Text>
                                            <Text style={styles.calloutText}>Peso: {catchItem.weight}kg</Text>
                                            <Text style={styles.calloutText}>Tamanho: {catchItem.size}cm</Text>
                                            <Text style={styles.calloutText}>Data: {catchItem.date}</Text>
                                        </View>
                                    </Callout>
                                </Marker>
                            );
                        })}
                    </MapView>

                    {/* Controles do mapa */}
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity 
                            style={styles.controlButton} 
                            onPress={centerOnUserLocation}
                        >
                            <MaterialIcons name="my-location" size={24} color="#2196F3" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.controlButton} 
                            onPress={toggleMapType}
                        >
                            <MaterialIcons 
                                name={mapType === 'standard' ? 'satellite' : 'map'} 
                                size={24} 
                                color="#2196F3" 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Informações da captura selecionada */}
                    {selectedCatch && (
                        <View style={styles.selectedCatchContainer}>
                            <View style={styles.selectedCatchContent}>
                                <TouchableOpacity 
                                    style={styles.closeButton}
                                    onPress={() => setSelectedCatch(null)}
                                >
                                    <MaterialIcons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                                
                                <Image 
                                    source={{ uri: selectedCatch.image }} 
                                    style={styles.catchImage}
                                    resizeMode="cover"
                                />
                                
                                <Text style={styles.selectedCatchTitle}>{selectedCatch.species}</Text>
                                
                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailItem}>
                                        <MaterialIcons name="calendar-today" size={20} color="#666" />
                                        <Text style={styles.detailLabel}>Data</Text>
                                        <Text style={styles.detailValue}>{selectedCatch.date}</Text>
                                    </View>
                                    
                                    <View style={styles.detailItem}>
                                        <MaterialIcons name="straighten" size={20} color="#666" />
                                        <Text style={styles.detailLabel}>Tamanho</Text>
                                        <Text style={styles.detailValue}>{selectedCatch.size}cm</Text>
                                    </View>
                                    
                                    <View style={styles.detailItem}>
                                        <MaterialIcons name="fitness-center" size={20} color="#666" />
                                        <Text style={styles.detailLabel}>Peso</Text>
                                        <Text style={styles.detailValue}>{selectedCatch.weight}kg</Text>
                                    </View>
                                    
                                    <View style={styles.detailItem}>
                                        <MaterialIcons name="wb-sunny" size={20} color="#666" />
                                        <Text style={styles.detailLabel}>Clima</Text>
                                        <Text style={styles.detailValue}>{selectedCatch.weather}</Text>
                                    </View>
                                </View>

                                {selectedCatch.description && (
                                    <View style={styles.descriptionContainer}>
                                        <Text style={styles.descriptionLabel}>Observações</Text>
                                        <Text style={styles.descriptionText}>{selectedCatch.description}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </>
            )}
            <CustomAlert
                visible={isVisible}
                type={config.type}
                title={config.title}
                message={config.message}
                buttons={config.buttons}
                onClose={hideAlert}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    controlsContainer: {
        position: 'absolute',
        right: 16,
        top: 16,
        gap: 8,
    },
    controlButton: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutContainer: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    calloutText: {
        fontSize: 14,
        color: '#666',
    },
    selectedCatchContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxHeight: '60%',
    },
    selectedCatchContent: {
        padding: 16,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 1,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 4,
    },
    catchImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    selectedCatchTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailItem: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
        marginTop: 2,
    },
    descriptionContainer: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
