import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

export function useAppTheme() {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return {
        isDarkMode,
        theme,
        colors: theme.colors,
    };
} 