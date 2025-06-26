import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const auth = getAuth();

// Function to translate Firebase error codes to user-friendly messages
const getErrorMessage = (error) => {
  if (!error.code) return 'An unknown error occurred';

  const errorCode = error.code;
  const message = error.message;

  // Firebase auth error codes
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    default:
      return message;
  }
};

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
      console.log("Calling createUserWithEmailAndPassword");
      const result = await createUserWithEmailAndPassword(auth, email, password);
  
      if (!result.user || !result.user.uid) throw new Error("No user ID returned");
  
      console.log("Updating user profile with name:", name);
      await updateProfile(result.user, { displayName: name });
  
      console.log("Saving user to Firestore");
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        createdAt: new Date(),
        lastLogin: new Date(),
      }, { merge: true });
      
      return result.user;
    } catch (error) {
      console.error("🔥 Registration crash:", error.code, error.message);
      throw new Error(getErrorMessage(error));
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

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
