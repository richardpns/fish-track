import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const exampleCatches = [
    { id: 1, species: "Tucunaré", latitude: -23.104510, longitude: -48.612896, weight: "6.2kg", date: "16/08/2024" },
    { id: 2, species: "Pirarucu", latitude: -23.105510, longitude: -48.613896, weight: "10kg", date: "20/08/2024" },
];

export function Home(){
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [region, setRegion] = useState({
        latitude: -23.104510,  // Coordenadas iniciais padrão
        longitude: -48.612896,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    useEffect(() => {
        (async () => {
            // Solicita permissão para acessar a localização
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à localização para mostrar o mapa.');
                return;
            }

            // Obtém a localização atual do usuário
            let userLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = userLocation.coords;

            // Atualiza o estado com a localização do usuário
            setLocation({ latitude, longitude });
            // Atualiza a região do mapa para centralizar na localização do usuário
            setRegion((prevRegion) => ({
                ...prevRegion,
                latitude,
                longitude,
            }));
        })();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                mapType="satellite"  // Define o modo de exibição para satélite
            >
                {exampleCatches.map((catchItem) => (
                    <Marker
                        key={catchItem.id}
                        coordinate={{ latitude: catchItem.latitude, longitude: catchItem.longitude }}
                        title={catchItem.species}
                        description={`Peso: ${catchItem.weight} - Data: ${catchItem.date}`}
                    />
                ))}
                {/* Marcador para a posição atual do usuário */}
                {location && (
                    <Marker
                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                        title="Você está aqui"
                        pinColor="blue"
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
