import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const auth = getAuth();

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user);
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      
      if (!auth) {
        throw new Error('Firebase authentication not initialized');
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      console.error('Translated error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (email, password, name) => {
    try {
      console.log('Attempting registration with:', email);
      
      if (!auth) {
        throw new Error('Firebase authentication not initialized');
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful:', result.user);
      
      // Update Firebase Auth profile
      await updateProfile(result.user, {
        displayName: name
      });

      // Save to Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        createdAt: new Date()
      });

      console.log('User data saved to Firestore');
      return result.user;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = getErrorMessage(error);
      console.error('Translated error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase authentication not initialized');
      }
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(getErrorMessage(error));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    db
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  console.error('Firebase error code:', error.code);
  
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please check Firebase Console settings.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No user found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      console.error('Unknown error:', error.message);
      return 'An error occurred. Please try again.';
  }
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
