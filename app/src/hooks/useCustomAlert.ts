import { useState } from 'react';

interface AlertConfig {
    type?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    buttons?: {
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }[];
}

export function useCustomAlert() {
    const [isVisible, setIsVisible] = useState(false);
    const [config, setConfig] = useState<AlertConfig>({
        title: '',
        message: '',
    });

    const showAlert = (alertConfig: AlertConfig) => {
        setConfig(alertConfig);
        setIsVisible(true);
    };

    const hideAlert = () => {
        setIsVisible(false);
    };

    return {
        isVisible,
        config,
        showAlert,
        hideAlert,
    };
} 