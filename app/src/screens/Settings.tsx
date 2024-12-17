import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, Alert, ScrollView, Linking } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { authService } from '../services/firebaseService';
import { CustomAlert } from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

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
    const { isVisible, config, showAlert, hideAlert } = useCustomAlert();
    const [showPassword, setShowPassword] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            try {
                const userData = await authService.getUserData(currentUser.uid);
                if (userData) {
                    setUserNickname(userData.nickname);
                    setIsLoggedIn(true);
                    setEmail(currentUser.email || '');
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        } else {
            setIsLoggedIn(false);
            setUserNickname(null);
            setEmail('');
        }
    };

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                showAlert({
                    type: 'warning',
                    title: 'Atenção',
                    message: 'Por favor, preencha todos os campos.',
                    buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                });
                return;
            }

            await authService.login(email, password);
            
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                const userData = await authService.getUserData(currentUser.uid);
                if (userData) {
                    setUserNickname(userData.nickname);
                    setIsLoggedIn(true);
                    setPassword('');
                    
                    showAlert({
                        type: 'success',
                        title: 'Bem-vindo!',
                        message: `Login realizado com sucesso!\nBem-vindo, ${userData.nickname}!`,
                        buttons: [{ 
                            text: 'OK', 
                            onPress: () => {
                                hideAlert();
                                loadUserData();
                            }, 
                            style: 'default' 
                        }]
                    });
                }
            }
        } catch (error: any) {
            showAlert({
                type: 'error',
                title: 'Erro no login',
                message: error.message,
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
        }
    };

    const handleLogout = async () => {
        showAlert({
            type: 'warning',
            title: 'Confirmar saída',
            message: 'Tem certeza que deseja sair?',
            buttons: [
                {
                    text: 'Cancelar',
                    onPress: hideAlert,
                    style: 'cancel'
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
                            clearFields();
                            
                            showAlert({
                                type: 'success',
                                title: 'Sucesso',
                                message: 'Logout realizado com sucesso!',
                                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                            });
                        } catch (error) {
                            showAlert({
                                type: 'error',
                                title: 'Erro',
                                message: 'Não foi possível realizar o logout.',
                                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                            });
                        }
                    }
                }
            ]
        });
    };

    const handleRegister = async () => {
        try {
            if (!email || !password || !fullName || !nickname) {
                showAlert({
                    type: 'warning',
                    title: 'Atenção',
                    message: 'Por favor, preencha todos os campos.',
                    buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                });
                return;
            }

            if (password !== confirmPassword) {
                showAlert({
                    type: 'error',
                    title: 'Erro',
                    message: 'As senhas não coincidem',
                    buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                });
                return;
            }

            await authService.register(email, password, fullName, nickname);
            showAlert({
                type: 'success',
                title: 'Sucesso',
                message: 'Registro realizado com sucesso!',
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
            setIsRegistering(false);
            clearFields();
        } catch (error: any) {
            showAlert({
                type: 'error',
                title: 'Erro no registro',
                message: error.message,
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
        }
    };

    const handleResetPassword = async () => {
        try {
            if (!email) {
                showAlert({
                    type: 'warning',
                    title: 'Atenção',
                    message: 'Por favor, informe seu email.',
                    buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                });
                return;
            }

            await authService.resetPassword(email);
            showAlert({
                type: 'success',
                title: 'Email enviado',
                message: 'Verifique sua caixa de entrada para redefinir sua senha.',
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
        } catch (error: any) {
            showAlert({
                type: 'error',
                title: 'Erro',
                message: 'Não foi possível enviar o email de recuperação.',
                buttons: [{ text: 'OK', onPress: hideAlert, style: 'default' }]
            });
        }
    };

    const clearFields = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setNickname('');
        setConfirmPassword('');
    };

    const getInputContainerStyle = () => ({
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
        borderColor: colors.border,
    });

    const renderAuthForm = () => {
        if (isLoggedIn) {
            return (
                <View style={[styles.userHeader, { backgroundColor: colors.card }]}>
                    <View style={styles.userHeaderContent}>
                        <View style={styles.userAvatarContainer}>
                            <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                                <Text style={styles.avatarText}>
                                    {userNickname ? userNickname[0].toUpperCase() : 'U'}
                                </Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userNickname, { color: colors.text }]}>
                                    {userNickname}
                                </Text>
                                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                                    {email}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.headerButtons}>
                            <TouchableOpacity 
                                style={[styles.headerButton, { backgroundColor: colors.card }]}
                                onPress={() => setShowUserInfo(!showUserInfo)}
                            >
                                <MaterialIcons 
                                    name={showUserInfo ? "expand-less" : "expand-more"} 
                                    size={24} 
                                    color={colors.text} 
                                />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.headerButton, { backgroundColor: colors.error }]}
                                onPress={handleLogout}
                            >
                                <MaterialIcons name="logout" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showUserInfo && (
                        <View style={styles.userDetailsContainer}>
                            <View style={styles.userDetailItem}>
                                <MaterialIcons name="person" size={20} color={colors.textSecondary} />
                                <View style={styles.userDetailText}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                        Nome de Usuário
                                    </Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>
                                        {userNickname}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.userDetailItem}>
                                <MaterialIcons name="email" size={20} color={colors.textSecondary} />
                                <View style={styles.userDetailText}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                        Email
                                    </Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>
                                        {email}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            );
        }

        if (isRegistering) {
            return (
                <>
                    <View style={getInputContainerStyle()}>
                        <MaterialIcons name="person" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Nome Completo"
                            placeholderTextColor={colors.textSecondary}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={getInputContainerStyle()}>
                        <MaterialIcons name="face" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Apelido"
                            placeholderTextColor={colors.textSecondary}
                            value={nickname}
                            onChangeText={setNickname}
                        />
                    </View>

                    <View style={getInputContainerStyle()}>
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

                    <View style={getInputContainerStyle()}>
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
                            style={styles.eyeButton}
                        >
                            <MaterialIcons 
                                name={showPassword ? "visibility" : "visibility-off"} 
                                size={20} 
                                color={colors.textSecondary} 
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={getInputContainerStyle()}>
                        <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Confirmar Senha"
                            placeholderTextColor={colors.textSecondary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity 
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
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
                <View style={getInputContainerStyle()}>
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

                <View style={getInputContainerStyle()}>
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
                        style={styles.eyeButton}
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
                    style={styles.forgotPasswordButton}
                    onPress={handleResetPassword}
                >
                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                        Esqueceu sua senha?
                    </Text>
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
                visible={isVisible}
                type={config.type}
                title={config.title}
                message={config.message}
                buttons={config.buttons}
                onClose={hideAlert}
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
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        paddingVertical: 8,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
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
    eyeButton: {
        padding: 8,
    },
    forgotPasswordButton: {
        alignSelf: 'center',
        marginTop: 16,
        padding: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    userHeader: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    userHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    userAvatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    userInfo: {
        marginLeft: 12,
    },
    userNickname: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerButton: {
        padding: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userDetailsContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    userDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    userDetailText: {
        marginLeft: 12,
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 2,
    },
});
