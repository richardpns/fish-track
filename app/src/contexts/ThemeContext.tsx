import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextData {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    async function loadTheme() {
        try {
            const savedTheme = await AsyncStorage.getItem('@FishTrack:theme');
            if (savedTheme) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
        } catch (error) {
            console.log('Erro ao carregar tema:', error);
        }
    }

    async function toggleTheme() {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            await AsyncStorage.setItem('@FishTrack:theme', JSON.stringify(newTheme));
        } catch (error) {
            console.log('Erro ao salvar tema:', error);
        }
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 