import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { captureService } from '../services/firebaseService';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { CustomAlert } from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

// Interface para o tipo de captura
interface Capture {
    id: string;
    date: string;
    weather: string;
    weight: number;
    size: number;
    species: string;
    image: string;
}

// Dados mockados para exemplo
const mockCaptures: Capture[] = [
    {
        id: '1',
        date: '10/03/2024',
        weather: 'Ensolarado, 25°C',
        weight: 2.5,
        size: 45,
        species: 'Tilápia',
        image: 'https://oeco.org.br/wp-content/uploads/oeco-migration//images/stories/abr2012/tilapia.jpg', // Substitua por uma imagem real
    },
    // Adicione mais capturas mock conforme necessário
];

export function Catches() {
    const { colors, isDarkMode } = useAppTheme();
    const [captures, setCaptures] = useState<CaptureData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCapture, setEditingCapture] = useState<CaptureData | null>(null);
    const [editForm, setEditForm] = useState({
        species: '',
        size: '',
        weight: '',
        weather: '',
    });
    const navigation = useNavigation();
    const { isVisible, config, showAlert, hideAlert } = useCustomAlert();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // Se o usuário estiver logado, carrega as capturas
                loadCaptures();
            } else {
                // Se não estiver logado, limpa as capturas
                setCaptures([]);
                setLoading(false);
            }
        });

        // Cleanup da inscrição quando o componente for desmontado
        return () => unsubscribe();
    }, []);

    const loadCaptures = async () => {
        try {
            setLoading(true);
            const userCaptures = await captureService.getUserCaptures();
            setCaptures(userCaptures);
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'Erro',
                message: 'Não foi possível carregar as capturas',
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLoginPress = () => {
        navigation.navigate('Settings' as never);
    };

    const handleEdit = (capture: CaptureData) => {
        setEditingCapture(capture);
        setEditForm({
            species: capture.species,
            size: capture.size.toString(),
            weight: capture.weight.toString(),
            weather: capture.weather,
        });
    };

    const handleSaveEdit = async () => {
        if (!editingCapture) return;

        try {
            const updatedCapture = {
                species: editForm.species,
                size: Number(editForm.size),
                weight: Number(editForm.weight),
                weather: editForm.weather,
            };

            await captureService.updateCapture(editingCapture.id!, updatedCapture);
            showAlert({
                type: 'success',
                title: 'Sucesso',
                message: 'Captura atualizada com sucesso!',
                buttons: [{ 
                    text: 'OK', 
                    onPress: () => {
                        hideAlert();
                        loadCaptures();
                    },
                    style: 'default'
                }]
            });
            setEditingCapture(null);
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'Erro',
                message: 'Não foi possível atualizar a captura',
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
        }
    };

    const handleDelete = async (capture: CaptureData) => {
        showAlert({
            type: 'warning',
            title: 'Confirmar exclusão',
            message: 'Tem certeza que deseja excluir esta captura?',
            buttons: [
                {
                    text: 'Cancelar',
                    onPress: hideAlert,
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await captureService.deleteCapture(capture.id!);
                            showAlert({
                                type: 'success',
                                title: 'Sucesso',
                                message: 'Captura excluída com sucesso!',
                                buttons: [{ 
                                    text: 'OK', 
                                    onPress: () => {
                                        hideAlert();
                                        loadCaptures();
                                    },
                                    style: 'default'
                                }]
                            });
                        } catch (error) {
                            showAlert({
                                type: 'error',
                                title: 'Erro',
                                message: 'Não foi possível excluir a captura',
                                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                            });
                        }
                    }
                }
            ]
        });
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} showsHorizontalScrollIndicator={false}>
                <View style={styles.container}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : !auth.currentUser ? (
                        <View style={styles.authContainer}>
                            <MaterialIcons name="lock" size={64} color={colors.textSecondary} />
                            <Text style={[styles.authText, { color: colors.textSecondary }]}>
                                Faça o login para ver suas capturas
                            </Text>
                            <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                                onPress={handleLoginPress}
                            >
                                <MaterialIcons name="login" size={20} color="#FFF" />
                                <Text style={styles.loginButtonText}>Fazer Login</Text>
                            </TouchableOpacity>
                        </View>
                    ) : captures.length > 0 ? (
                        captures.map((capture) => (
                            <View 
                                key={capture.id} 
                                style={[styles.card, { backgroundColor: colors.card }]}
                            >
                                <Image
                                    source={{ uri: capture.image }}
                                    style={styles.cardImage}
                                    defaultSource={require('../../assets/fish-placeholder.png')}
                                />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <Text style={[styles.species, { color: colors.text }]}>{capture.species}</Text>
                                        <Text style={[styles.date, { color: colors.textSecondary }]}>{capture.date}</Text>
                                    </View>

                                    <View style={styles.detailsContainer}>
                                        <View style={styles.detailRow}>
                                            <MaterialIcons name="straighten" size={20} color={colors.textSecondary} />
                                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                                {capture.size} cm
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <MaterialIcons name="fitness-center" size={20} color={colors.textSecondary} />
                                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                                {capture.weight} kg
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <MaterialIcons name="wb-sunny" size={20} color={colors.textSecondary} />
                                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                                {capture.weather}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Botões de ação */}
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.editButton, { backgroundColor: colors.primary }]}
                                            onPress={() => handleEdit(capture)}
                                        >
                                            <MaterialIcons name="edit" size={20} color="#FFF" />
                                            <Text style={styles.actionButtonText}>Editar</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error }]}
                                            onPress={() => handleDelete(capture)}
                                        >
                                            <MaterialIcons name="delete" size={20} color="#FFF" />
                                            <Text style={styles.actionButtonText}>Excluir</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="waves" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Nenhuma captura registrada
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal de Edição */}
            <Modal
                visible={!!editingCapture}
                transparent
                animationType="slide"
                onRequestClose={() => setEditingCapture(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.editFormContainer, { backgroundColor: colors.card }]}>
                        <View style={styles.editFormHeader}>
                            <Text style={[styles.editFormTitle, { color: colors.text }]}>
                                Editar Captura
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setEditingCapture(null)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.editForm}>
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Espécie</Text>
                                <TextInput
                                    style={[styles.input, { 
                                        color: colors.text,
                                        backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                                        borderColor: colors.border
                                    }]}
                                    value={editForm.species}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, species: text }))}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Tamanho (cm)</Text>
                                <TextInput
                                    style={[styles.input, { 
                                        color: colors.text,
                                        backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                                        borderColor: colors.border
                                    }]}
                                    value={editForm.size}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, size: text }))}
                                    keyboardType="numeric"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Peso (kg)</Text>
                                <TextInput
                                    style={[styles.input, { 
                                        color: colors.text,
                                        backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                                        borderColor: colors.border
                                    }]}
                                    value={editForm.weight}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, weight: text }))}
                                    keyboardType="numeric"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Clima</Text>
                                <TextInput
                                    style={[styles.input, { 
                                        color: colors.text,
                                        backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                                        borderColor: colors.border
                                    }]}
                                    value={editForm.weather}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, weather: text }))}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                onPress={handleSaveEdit}
                            >
                                <MaterialIcons name="save" size={20} color="#FFF" />
                                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <CustomAlert
                visible={isVisible}
                type={config.type}
                title={config.title}
                message={config.message}
                buttons={config.buttons}
                onClose={hideAlert}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    species: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    detailsContainer: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
        flex: 0.48, // Para deixar um pequeno espaço entre os botões
    },
    actionButtonText: {
        color: '#FFF',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#ff6b6b',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    editFormContainer: {
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
    },
    editFormHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    editFormTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    editForm: {
        gap: 16,
    },
    formGroup: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        marginTop: 8,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    authContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 32,
    },
    authText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});