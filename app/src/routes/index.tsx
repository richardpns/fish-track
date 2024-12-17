import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../contexts/ThemeContext';

import { Home } from '../screens/Home';
import { Settings } from '../screens/Settings';
import { Catches } from '../screens/Catches';
import { Weather } from '../screens/Weather';
import { Capture } from '../screens/Capture';


const { Navigator, Screen } = createBottomTabNavigator();

function Navigation() {
    const { isDarkMode } = useTheme();

    return (
        <NavigationContainer>
            <Navigator 
                screenOptions={{
                    tabBarActiveTintColor: isDarkMode ? '#64B5F6' : '#135BDA',
                    tabBarInactiveTintColor: isDarkMode ? '#666666' : 'gray',
                    tabBarLabel: '',
                    tabBarStyle: {
                        backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                        borderTopColor: isDarkMode ? '#333333' : '#DDDDDD',
                    },
                    headerStyle: {
                        backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                    },
                    headerTintColor: isDarkMode ? '#FFFFFF' : '#333333',
                }}
            >
                <Screen
                    name="Home"
                    component={Home}
                    options={{
                        tabBarIcon: ({ size, color }) => <Feather name="map" size={size} color={color} />,
                        headerShown: false,
                    }}
                />

                <Screen
                    name="Catches"
                    component={Catches}
                    options={{
                        tabBarIcon: ({ size, color }) => <Feather name="anchor" size={size} color={color} style={styles.iconSpacing2}  />,
                        
                    }}
                />    

                
                <Screen
                     name="Capture"
                     component={Capture}
                     options={{
                         tabBarIcon: ({ size }) => (
                             <View style={[
                                 styles.captureButton,
                                 { backgroundColor: isDarkMode ? '#64B5F6' : '#135BDA' }
                             ]}>
                                 <Feather name="plus" size={24} color="white" />
                             </View>
                         ),
                         tabBarButton: (props) => (
                             <TouchableOpacity {...props} style={styles.customCaptureButton} />
                         ),
                         headerShown: false,
                     }}
                />        

                <Screen
                    name="Weather"
                    component={Weather}
                    options={{
                        tabBarIcon: ({ size, color }) => <Feather name="sun" size={size} color={color} style={styles.iconSpacing1}  />,
                        // headerShown: false,
                    
                    }}
                />         


                <Screen
                    name="Settings"
                    component={Settings}
                    options={{
                        tabBarIcon: ({ size, color }) => <Feather name="settings" size={size} color={color}  />
                    }}
                />

            </Navigator>
        </NavigationContainer>
    );
}

export function Routes() {
    return (
        <ThemeProvider>
            <Navigation />
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    customCaptureButton: {
        top: -20, // Para centralizar melhor o botão na barra de navegação
    },
    captureButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#135BDA', // Azul semelhante ao da imagem
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Sombra para Android
    },
    iconSpacing1: {
        marginLeft: 30, // Ajusta o espaçamento dos ícones
    },    
    iconSpacing2: {
        marginRight: 30, // Ajusta o espaçamento dos ícones
    },    
});