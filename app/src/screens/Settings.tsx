import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, Alert, ScrollView, Linking } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { authService } from '../services/firebaseService';
import { CustomAlert } from '../components/CustomAlert';

const XIcon = ({ size, color }: { size: number, color: string }) => (
    <Text style={{ fontSize: size, color, fontWeight: 'bold' }}>𝕏</Text>
);

export function Settings() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { colors } = useAppTheme();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [nickname, setNickname] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userNickname, setUserNickname] = useState<string | null>(null);
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
        buttons?: any[];
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            // Buscar dados adicionais do usuário no Firestore
            const userData = await authService.getUserData(currentUser.uid);
            if (userData) {
                setUserNickname(userData.nickname);
                setIsLoggedIn(true);
                setEmail(currentUser.email || '');
            }
        }
    };

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, buttons?: any[]) => {
        setAlertConfig({
            visible: true,
            type,
            title,
            message,
            buttons,
        });
    };

    const handleLogin = async () => {
        try {
            const { user, userData } = await authService.login(email, password);
            setUserNickname(userData.nickname);
            setIsLoggedIn(true);
            showAlert('success', 'Bem-vindo!', 'Login realizado com sucesso!');
        } catch (error: any) {
            showAlert('error', 'Erro no Login', error.message);
        }
    };

    const handleLogout = async () => {
        // Primeiro mostra o alerta de confirmação
        showAlert('warning', 'Confirmar Saída', 'Tem certeza que deseja sair da sua conta?', [
            {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => {} // Não faz nada, apenas fecha o alerta
            },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await authService.logout();
                        setIsLoggedIn(false);
                        setEmail('');
                        setPassword('');
                        setUserNickname(null);
                        showAlert('success', 'Até logo!', 'Logout realizado com sucesso!');
                    } catch (error) {
                        showAlert('error', 'Erro', 'Erro ao fazer logout');
                    }
                }
            }
        ]);
    };

    const handleRegister = async () => {
        if (!fullName || !nickname || !email || !password || !confirmPassword) {
            showAlert('warning', 'Atenção', 'Por favor, preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('error', 'Erro', 'As senhas não coincidem');
            return;
        }

        try {
            await authService.register(email, password, fullName, nickname);
            showAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso!');
            setIsRegistering(false);
            clearFields();
        } catch (error: any) {
            showAlert('error', 'Erro no Cadastro', error.message);
        }
    };

    const clearFields = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setNickname('');
        setConfirmPassword('');
    };

    const renderAuthForm = () => {
        if (isLoggedIn) {
            return (
                <View style={styles.loggedInContainer}>
                    <Text style={[styles.emailText, { color: colors.text }]}>{email}</Text>
                    <TouchableOpacity 
                        style={[styles.logoutButton, { backgroundColor: colors.error }]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>Sair</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (isRegistering) {
            return (
                <>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="person" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Nome Completo"
                            placeholderTextColor={colors.textSecondary}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="face" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Apelido"
                            placeholderTextColor={colors.textSecondary}
                            value={nickname}
                            onChangeText={setNickname}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Email"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Senha"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity 
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons 
                                name={showPassword ? "visibility" : "visibility-off"} 
                                size={20} 
                                color={colors.textSecondary} 
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Confirmar Senha"
                            placeholderTextColor={colors.textSecondary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity 
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons 
                                name={showConfirmPassword ? "visibility" : "visibility-off"} 
                                size={20} 
                                color={colors.textSecondary} 
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={[styles.loginButton, { backgroundColor: colors.primary }]}
                        onPress={handleRegister}
                    >
                        <Text style={styles.loginButtonText}>Cadastrar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.registerContainer}
                        onPress={() => {
                            setIsRegistering(false);
                            clearFields();
                        }}
                    >
                        <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                            Já tem uma conta?{' '}
                            <Text style={[styles.registerLink, { color: colors.primary }]}>
                                Faça login
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </>
            );
        }

        return (
            <>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Email"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Senha"
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <MaterialIcons 
                            name={showPassword ? "visibility" : "visibility-off"} 
                            size={20} 
                            color={colors.textSecondary} 
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.loginButton, { backgroundColor: colors.primary }]}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginButtonText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.registerContainer}
                    onPress={() => {
                        setIsRegistering(true);
                        clearFields();
                    }}
                >
                    <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                        Não tem uma conta?{' '}
                        <Text style={[styles.registerLink, { color: colors.primary }]}>
                            Cadastre-se
                        </Text>
                    </Text>
                </TouchableOpacity>
            </>
        );
    };

    const socialLinks = {
        instagram: 'https://instagram.com/fishtrack',
        facebook: 'https://facebook.com/fishtrack',
        twitter: 'https://twitter.com/fishtrack',
    };

    const handleSocialPress = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Seção Modo Escuro */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <MaterialIcons 
                            name={isDarkMode ? "dark-mode" : "light-mode"} 
                            size={24} 
                            color={colors.text} 
                        />
                        <Text style={[styles.settingText, { color: colors.text }]}>
                            Modo Escuro
                        </Text>
                    </View>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
                    />
                </View>
            </View>

            {/* Seção do Usuário */}
            {isLoggedIn && userNickname && (
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <View style={styles.userInfo}>
                        <MaterialIcons name="account-circle" size={40} color={colors.primary} />
                        <View style={styles.userTextContainer}>
                            <Text style={[styles.nickname, { color: colors.text }]}>{userNickname}</Text>
                            <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Seção de Autenticação */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {isLoggedIn ? 'Minha Conta' : (isRegistering ? 'Criar Conta' : 'Login')}
                </Text>
                {renderAuthForm()}
            </View>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.card }]}>
                <View style={styles.socialSection}>
                    <Text style={[styles.footerTitle, { color: colors.text }]}>
                        Siga-nos nas redes sociais
                    </Text>
                    <View style={styles.socialButtons}>
                        <TouchableOpacity 
                            style={styles.socialButton}
                            onPress={() => handleSocialPress(socialLinks.instagram)}
                        >
                            <FontAwesome5 name="instagram" size={22} color={colors.primary} />
                            <Text style={[styles.socialText, { color: colors.text }]}>Instagram</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.socialButton}
                            onPress={() => handleSocialPress(socialLinks.facebook)}
                        >
                            <FontAwesome5 name="facebook" size={22} color={colors.primary} />
                            <Text style={[styles.socialText, { color: colors.text }]}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.socialButton}
                            onPress={() => handleSocialPress(socialLinks.twitter)}
                        >
                            <XIcon size={22} color={colors.primary} />
                            <Text style={[styles.socialText, { color: colors.text }]}>X</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.legalSection}>
                    <Text style={[styles.footerTitle, { color: colors.text }]}>
                        Informações Legais
                    </Text>
                    
                    <TouchableOpacity style={styles.legalButton}>
                        <Text style={[styles.legalText, { color: colors.textSecondary }]}>
                            Termos de Uso
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.legalButton}>
                        <Text style={[styles.legalText, { color: colors.textSecondary }]}>
                            Política de Privacidade
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.legalButton}>
                        <Text style={[styles.legalText, { color: colors.textSecondary }]}>
                            Sobre o App
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.copyrightSection}>
                    <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
                        © 2024 FishTrack. Todos os direitos reservados.
                    </Text>
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                        Versão 1.0.0
                    </Text>
                </View>
            </View>

            <CustomAlert
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingBottom: 80,
    },
    section: {
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        marginLeft: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 16,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    loginButton: {
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    registerText: {
        fontSize: 14,
    },
    registerLink: {
        fontWeight: 'bold',
    },
    loggedInContainer: {
        alignItems: 'center',
    },
    emailText: {
        fontSize: 16,
        marginBottom: 16,
    },
    logoutButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userTextContainer: {
        marginLeft: 12,
    },
    nickname: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 14,
    },
    footer: {
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    socialSection: {
        padding: 8,
    },
    footerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        marginTop: 4,
    },
    socialButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 50,
    },
    socialText: {
        fontSize: 11,
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 12,
    },
    legalSection: {
        padding: 8,
    },
    legalButton: {
        paddingVertical: 6,
        alignItems: 'center',
    },
    legalText: {
        fontSize: 12,
    },
    copyrightSection: {
        padding: 8,
        alignItems: 'center',
    },
    copyrightText: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 2,
    },
    versionText: {
        fontSize: 10,
        opacity: 0.7,
    },
    eyeIcon: {
        padding: 8,
    },
});
