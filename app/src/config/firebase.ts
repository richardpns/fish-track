import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB4XciFBRZlEbNetvX22y-HV0xt3dkkfL8",
  authDomain: "fishtrack-4182c.firebaseapp.com",
  projectId: "fishtrack-4182c",
  storageBucket: "fishtrack-4182c.appspot.com",
  messagingSenderId: "340314266530",
  appId: "1:340314266530:web:86fdbcea11d6d65ac770fb"
};

const app = initializeApp(firebaseConfig);

// Inicializa Auth com persistência
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

