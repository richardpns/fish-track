import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, TouchableOpacity, Text, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { captureService, CaptureData } from '../services/firebaseService';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../config/firebase';

export function Home() {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [region, setRegion] = useState({
        latitude: -23.104510,
        longitude: -48.612896,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
    const [selectedCapture, setSelectedCapture] = useState<CaptureData | null>(null);
    const [userCaptures, setUserCaptures] = useState<CaptureData[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            getCurrentLocation();
            loadUserCaptures();
        }, [])
    );

    const loadUserCaptures = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                setUserCaptures([]);
                return;
            }

            const captures = await captureService.getUserCaptures();
            console.log('Capturas carregadas:', captures);
            setUserCaptures(captures);
        } catch (error) {
            console.error('Erro ao carregar capturas:', error);
            setUserCaptures([]);
        }
    };

    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à localização para mostrar o mapa.');
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
            Alert.alert('Erro', 'Não foi possível obter sua localização.');
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
                {userCaptures && userCaptures.length > 0 && userCaptures.map((capture) => (
                    <Marker
                        key={capture.id}
                        coordinate={{ 
                            latitude: capture.latitude, 
                            longitude: capture.longitude 
                        }}
                        onPress={() => setSelectedCapture(capture)}
                    >
                        <MaterialIcons name="location-pin" size={30} color="#2196F3" />
                        <Callout tooltip>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{capture.species}</Text>
                                <Text style={styles.calloutText}>Peso: {capture.weight}kg</Text>
                                <Text style={styles.calloutText}>Data: {capture.date}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Controles do mapa */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity 
                    style={styles.controlButton} 
                    onPress={getCurrentLocation}
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
            {selectedCapture && (
                <View style={styles.selectedCaptureContainer}>
                    <View style={styles.selectedCaptureContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setSelectedCapture(null)}
                        >
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        
                        <Image 
                            source={{ uri: selectedCapture.image }} 
                            style={styles.catchImage}
                            resizeMode="cover"
                        />
                        
                        <Text style={styles.selectedCatchTitle}>{selectedCapture.species}</Text>
                        
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <MaterialIcons name="calendar-today" size={20} color="#666" />
                                <Text style={styles.detailLabel}>Data</Text>
                                <Text style={styles.detailValue}>{selectedCapture.date}</Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <MaterialIcons name="straighten" size={20} color="#666" />
                                <Text style={styles.detailLabel}>Tamanho</Text>
                                <Text style={styles.detailValue}>{selectedCapture.size}cm</Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <MaterialIcons name="fitness-center" size={20} color="#666" />
                                <Text style={styles.detailLabel}>Peso</Text>
                                <Text style={styles.detailValue}>{selectedCapture.weight}kg</Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <MaterialIcons name="wb-sunny" size={20} color="#666" />
                                <Text style={styles.detailLabel}>Clima</Text>
                                <Text style={styles.detailValue}>{selectedCapture.weather}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
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
    selectedCaptureContainer: {
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
    selectedCaptureContent: {
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
});

