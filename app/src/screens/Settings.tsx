import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';

export function Settings() {
  // Estados para armazenar os dados de login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Função para simular o login (você pode expandir com lógica real de autenticação)
  const handleLogin = () => {
    if (username === 'user' && password === '12345') {
      Alert.alert('Login', 'Login bem-sucedido!', [{ text: 'OK' }]);
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos', [{ text: 'Tentar novamente' }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Campo para o usuário */}
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
      />

      {/* Campo para a senha */}
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Botão de login */}
      <Button title="Entrar" onPress={handleLogin} />

      {/* Se necessário, você pode adicionar links ou outros botões */}
      <Text style={styles.link}>Esqueceu sua senha?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  link: {
    marginTop: 10,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
