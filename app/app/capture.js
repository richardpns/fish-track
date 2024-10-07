// app/capture.js
import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CaptureForm from '../components/CaptureForm';

export default function CaptureScreen() {
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permissão para acessar a câmera é necessária!');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduzindo a qualidade da imagem
      });

      if (!result.canceled) {
        setImage(result.uri);
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera: ", error);
      Alert.alert('Erro', 'Houve um erro ao tentar abrir a câmera.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Capturar Peixe" onPress={pickImage} accessibilityLabel="Botão para capturar a imagem de um peixe" />
      {image && (
        <View>
          <Image source={{ uri: image }} style={styles.image} />
          <CaptureForm imageUri={image} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
});
