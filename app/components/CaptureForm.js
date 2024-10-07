// components/CaptureForm.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function CaptureForm({ imageUri }) {
  const [species, setSpecies] = useState('');
  const [sizeWeight, setSizeWeight] = useState('');

  const handleSubmit = () => {
    if (!species || !sizeWeight) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Aqui você pode adicionar lógica para salvar a captura
    Alert.alert('Sucesso', 'Captura salva com sucesso!');
    // Limpa os campos após o envio
    setSpecies('');
    setSizeWeight('');
  };

  return (
    <View style={styles.formContainer}>
      <TextInput 
        placeholder="Espécie" 
        style={styles.input} 
        value={species}
        onChangeText={setSpecies}
        accessibilityLabel="Espécie"
      />
      <TextInput 
        placeholder="Tamanho / Peso" 
        style={styles.input} 
        value={sizeWeight}
        onChangeText={setSizeWeight}
        accessibilityLabel="Tamanho / Peso"
      />
      <Button title="Salvar Captura" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 5,
    padding: 8,
  },
});
