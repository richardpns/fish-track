import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, Modal, Button, StyleSheet, TextInput, Image, Platform } from 'react-native';
import { RNCamera } from 'react-native-camera'; // Importando a câmera
import * as Location from 'expo-location'; // Acesso à localização
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'; // Usando a biblioteca react-native-permissions

export function Capture() {
    // const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    // const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
    // const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    // const cameraRef = useRef<RNCamera | null>(null);
    // const [photo, setPhoto] = useState<string | null>(null);
    // const [showModal, setShowModal] = useState(false);
    // const [weight, setWeight] = useState('');
    // const [size, setSize] = useState('');
    // const [species, setSpecies] = useState('');
    // const [date, setDate] = useState('');

    // // Solicitar permissões para câmera e localização
    // useEffect(() => {
    //     (async () => {
    //         // Solicitar permissões de câmera
    //         if (Platform.OS === 'android') {
    //             // Para Android, usamos react-native-permissions para a câmera
    //             const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA);
    //             setHasCameraPermission(cameraStatus === RESULTS.GRANTED);
    //         } else {
    //             // Para iOS, usamos a permissão de câmera nativa diretamente com react-native-permissions
    //             const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
    //             setHasCameraPermission(cameraStatus === RESULTS.GRANTED);
    //         }

    //         // Solicitar permissões de localização
    //         const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    //         if (locationStatus === 'granted') {
    //             const loc = await Location.getCurrentPositionAsync({});
    //             setLocation(loc.coords);
    //         } else {
    //             Alert.alert('Permissão necessária', 'Precisamos de acesso à localização para registrar a captura.');
    //         }
    //         setHasLocationPermission(locationStatus === 'granted');
    //     })();
    // }, []);

    // // Função para tirar a foto
    // const takePicture = async () => {
    //     if (cameraRef.current) {
    //         const data = await cameraRef.current.takePictureAsync();
    //         setPhoto(data.uri);  // Armazena a URL da foto
    //         setShowModal(true); // Exibe o modal para adicionar as informações
    //     }
    // };

    // return (
    //     <View style={styles.container}>
    //         {/* Renderização condicional para exibir a câmera */}
    //         {hasCameraPermission === null ? (
    //             <Text>Solicitando permissão para acessar a câmera...</Text>
    //         ) : hasCameraPermission === false ? (
    //             <Text>Permissão de câmera negada.</Text>
    //         ) : (
    //             <RNCamera
    //                 ref={cameraRef}
    //                 style={styles.camera}
    //                 type={RNCamera.Constants.Type.back} // Tipo da câmera
    //                 flashMode={RNCamera.Constants.FlashMode.on} // Flash ativado (pode ser ajustado conforme necessário)
    //             >
    //                 <View style={styles.buttonContainer}>
    //                     <Button title="Tirar Foto" onPress={takePicture} />
    //                 </View>
    //             </RNCamera>
    //         )}

    //         {/* Exibe a foto capturada, se disponível */}
    //         {photo && (
    //             <View style={styles.imageContainer}>
    //                 <Text style={styles.imageText}>Foto Capturada</Text>
    //                 <Image source={{ uri: photo }} style={styles.image} />
    //             </View>
    //         )}

    //         {/* Modal para inserir informações */}
    //         <Modal visible={showModal} transparent={true} animationType="slide">
    //             <View style={styles.modalContainer}>
    //                 <Text style={styles.modalTitle}>Informações da Captura</Text>
    //                 <TextInput
    //                     style={styles.input}
    //                     placeholder="Peso (kg)"
    //                     value={weight}
    //                     onChangeText={setWeight}
    //                     keyboardType="numeric"
    //                 />
    //                 <TextInput
    //                     style={styles.input}
    //                     placeholder="Tamanho (cm)"
    //                     value={size}
    //                     onChangeText={setSize}
    //                     keyboardType="numeric"
    //                 />
    //                 <TextInput
    //                     style={styles.input}
    //                     placeholder="Espécie"
    //                     value={species}
    //                     onChangeText={setSpecies}
    //                 />
    //                 <TextInput
    //                     style={styles.input}
    //                     placeholder="Data (dd/mm/aaaa)"
    //                     value={date}
    //                     onChangeText={setDate}
    //                 />
    //                 <Text style={styles.locationText}>
    //                     Localização: {location ? `${location.latitude}, ${location.longitude}` : 'Obtendo...'}
    //                 </Text>
    //                 <Button title="Salvar" onPress={() => setShowModal(false)} />
    //                 <Button title="Fechar" onPress={() => setShowModal(false)} color="red" />
    //             </View>
    //         </Modal>
    //     </View>
    // );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    buttonContainer: {
        backgroundColor: 'transparent',
        alignSelf: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    imageText: {
        color: 'black',
        marginBottom: 10,
        fontSize: 16,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        width: '80%',
    },
    locationText: {
        color: 'white',
        marginVertical: 10,
    },
});
