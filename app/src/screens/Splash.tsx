import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export function Splash() {
    const navigation = useNavigation();

    useEffect(() => {
        // Timer para navegar para a próxima tela após 2 segundos
        const timer = setTimeout(() => {
            navigation.navigate('Home' as never);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/fish.png')} // Certifique-se de que a imagem existe neste caminho
                style={styles.image}
                resizeMode="contain" // Garante que a imagem não distorça
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,  // Preenche toda a tela
        justifyContent: 'center', // Centraliza verticalmente
        alignItems: 'center', // Centraliza horizontalmente
        backgroundColor: '#fff', // Adicione uma cor de fundo se necessário
    },
    image: {
        width: 150,  // Ajuste a largura da imagem
        height: 150, // Ajuste a altura da imagem (manter uma proporção)
    },
});
