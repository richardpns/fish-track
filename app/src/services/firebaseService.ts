import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    User,
    sendPasswordResetEmail
} from 'firebase/auth';
import { 
    collection, 
    addDoc, 
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Interface para as capturas
export interface CaptureData {
    id?: string;
    userId: string;
    species: string;
    weight: number;
    size: number;
    date: string;
    weather: string;
    image: string;
    latitude: number;
    longitude: number;
    description?: string;
    createdAt: string;
}

export const authService = {
    // Registro de novo usuário
    register: async (email: string, password: string, name: string, nickname: string) => {
        try {
            // Verifica se o nickname já existe
            const nicknameQuery = query(
                collection(db, 'users'),
                where('nickname', '==', nickname)
            );
            const nicknameSnapshot = await getDocs(nicknameQuery);
            
            if (!nicknameSnapshot.empty) {
                throw new Error('Este apelido já está em uso');
            }

            // Cria o usuário no Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Salva informações adicionais no Firestore
            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                email,
                name,
                nickname,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            return user;
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Este email já está cadastrado');
            }
            throw error;
        }
    },

    // Login
    login: async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Busca informações adicionais do usuário
            const userQuery = query(
                collection(db, 'users'),
                where('uid', '==', userCredential.user.uid)
            );
            const userSnapshot = await getDocs(userQuery);
            
            if (userSnapshot.empty) {
                console.log('Usuário autenticado mas dados não encontrados no Firestore');
                throw new Error('Dados do usuário não encontrados');
            }

            const userData = userSnapshot.docs[0].data();
            console.log('Login bem sucedido:', {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                userData
            });
            
            return {
                user: userCredential.user,
                userData
            };
        } catch (error: any) {
            console.log('Erro no login:', error.code, error.message);
            
            switch (error.code) {
                case 'auth/invalid-email':
                    throw new Error('Email inválido');
                case 'auth/user-not-found':
                    throw new Error('Usuário não encontrado');
                case 'auth/wrong-password':
                    throw new Error('Senha incorreta');
                case 'auth/invalid-credential':
                    throw new Error('Email ou senha incorretos');
                default:
                    throw new Error(`Erro no login: ${error.message}`);
            }
        }
    },

    // Logout
    logout: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw new Error('Erro ao fazer logout');
        }
    },

    // Recuperação de senha
    resetPassword: async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw new Error('Erro ao enviar email de recuperação');
        }
    },

    // Atualizar perfil do usuário
    updateUserProfile: async (userId: string, data: { name?: string; nickname?: string }) => {
        try {
            if (data.nickname) {
                // Verifica se o novo nickname já existe
                const nicknameQuery = query(
                    collection(db, 'users'),
                    where('nickname', '==', data.nickname),
                    where('uid', '!=', userId)
                );
                const nicknameSnapshot = await getDocs(nicknameQuery);
                
                if (!nicknameSnapshot.empty) {
                    throw new Error('Este apelido já está em uso');
                }
            }

            const userQuery = query(
                collection(db, 'users'),
                where('uid', '==', userId)
            );
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                await updateDoc(doc(db, 'users', userDoc.id), {
                    ...data,
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            throw error;
        }
    },

    // Obter usuário atual
    getCurrentUser: (): User | null => {
        return auth.currentUser;
    },

    // Obter dados do usuário
    getUserData: async (uid: string) => {
        try {
            const userQuery = query(
                collection(db, 'users'),
                where('uid', '==', uid)
            );
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
                return userSnapshot.docs[0].data();
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
}; 

// Serviço de Capturas
export const captureService = {
    // Adicionar nova captura
    addCapture: async (data: Omit<CaptureData, 'id' | 'createdAt'>) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('Usuário não autenticado');
            }

            // Adiciona a captura ao Firestore
            const captureRef = await addDoc(collection(db, 'captures'), {
                ...data,
                userId: currentUser.uid,
                createdAt: new Date().toISOString()
            });

            return captureRef.id;
        } catch (error) {
            console.error('Erro ao adicionar captura:', error);
            throw error;
        }
    },

    // Buscar capturas do usuário
    getUserCaptures: async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('Usuário não autenticado');
            }

            console.log('Buscando capturas para o usuário:', currentUser.uid);

            const capturesQuery = query(
                collection(db, 'captures'),
                where('userId', '==', currentUser.uid)
            );
            
            const querySnapshot = await getDocs(capturesQuery);
            const captures: CaptureData[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                captures.push({ 
                    id: doc.id,
                    ...data,
                    latitude: Number(data.latitude),
                    longitude: Number(data.longitude),
                    weight: Number(data.weight),
                    size: Number(data.size)
                } as CaptureData);
            });

            console.log('Capturas encontradas:', captures);
            return captures;
        } catch (error) {
            console.error('Erro ao buscar capturas:', error);
            throw error;
        }
    },

    // Atualizar captura
    updateCapture: async (captureId: string, data: Partial<CaptureData>) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('Usuário não autenticado');
            }

            // Verifica se a captura pertence ao usuário
            const captureRef = doc(db, 'captures', captureId);
            const captureSnap = await getDocs(query(
                collection(db, 'captures'),
                where('userId', '==', currentUser.uid)
            ));

            if (captureSnap.empty) {
                throw new Error('Captura não encontrada ou sem permissão');
            }

            await updateDoc(captureRef, {
                ...data,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Erro ao atualizar captura:', error);
            throw error;
        }
    },

    // Deletar captura
    deleteCapture: async (captureId: string) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('Usuário não autenticado');
            }

            // Verifica se a captura pertence ao usuário
            const captureRef = doc(db, 'captures', captureId);
            const captureSnap = await getDocs(query(
                collection(db, 'captures'),
                where('userId', '==', currentUser.uid)
            ));

            if (captureSnap.empty) {
                throw new Error('Captura não encontrada ou sem permissão');
            }

            await deleteDoc(captureRef);
        } catch (error) {
            console.error('Erro ao deletar captura:', error);
            throw error;
        }
    }
}; 