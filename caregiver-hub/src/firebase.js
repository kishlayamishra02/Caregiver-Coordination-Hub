import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Firebase configuration
const firebaseConfig = {
  apiKey: isProduction ? process.env.VITE_FIREBASE_API_KEY : import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: isProduction ? process.env.VITE_FIREBASE_AUTH_DOMAIN : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: isProduction ? process.env.VITE_FIREBASE_PROJECT_ID : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: isProduction ? process.env.VITE_FIREBASE_STORAGE_BUCKET : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: isProduction ? process.env.VITE_FIREBASE_MESSAGING_SENDER_ID : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: isProduction ? process.env.VITE_FIREBASE_APP_ID : import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: isProduction ? process.env.VITE_FIREBASE_MEASUREMENT_ID : import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing. Please check your environment variables.');
  throw new Error('Firebase configuration is missing');
}

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  return !!auth && !!db;
};

export { messaging, getToken, onMessage, db, auth, isFirebaseInitialized };
export default app;

console.log("Firebase config:", firebaseConfig);
