// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './home'; // Ajuste o caminho se necessário
import Profile from './profile'; // Ajuste o caminho se necessário
import WeatherScreen from './weather'; // Ajuste o caminho se necessário
import MapScreen from './map'; // Importando a tela de mapa
import { Ionicons } from '@expo/vector-icons'; // Biblioteca de ícones (opcional)

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Profile') {
              iconName = 'person';
            } else if (route.name === 'Weather') {
              iconName = 'cloud';
            } else if (route.name === 'Map') { // Adicionando ícone para a tela de mapa
              iconName = 'map';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={Home} options={{ title: 'Início' }} />
        <Tab.Screen name="Profile" component={Profile} options={{ title: 'Perfil' }} />
        <Tab.Screen name="Weather" component={WeatherScreen} options={{ title: 'Clima' }} />
        <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Mapa' }} /> {/* Adicionando a tela de mapa */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
