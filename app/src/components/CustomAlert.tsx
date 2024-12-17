import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';

interface CustomAlertProps {
    visible: boolean;
    type?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    buttons?: {
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }[];
    onClose?: () => void;
}

export function CustomAlert({ 
    visible, 
    type = 'info', 
    title, 
    message, 
    buttons,
    onClose 
}: CustomAlertProps) {
    const { colors, isDarkMode } = useAppTheme();

    const getIconName = () => {
        switch (type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            default:
                return 'info';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return colors.success;
            case 'error':
                return colors.error;
            case 'warning':
                return '#FFA500';
            default:
                return colors.primary;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[
                    styles.alertContainer,
                    { backgroundColor: isDarkMode ? colors.card : '#FFF' }
                ]}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons
                            name={getIconName()}
                            size={48}
                            color={getIconColor()}
                        />
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>
                        {title}
                    </Text>

                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                        {message}
                    </Text>

                    <View style={styles.buttonContainer}>
                        {buttons?.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === 'destructive' && styles.destructiveButton,
                                    button.style === 'cancel' && styles.cancelButton,
                                    { backgroundColor: button.style === 'default' ? colors.primary : undefined }
                                ]}
                                onPress={button.onPress}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    button.style === 'cancel' && { color: colors.text }
                                ]}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: Dimensions.get('window').width * 0.85,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    iconContainer: {
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    destructiveButton: {
        backgroundColor: '#FF4444',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 