import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

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

  const login = async (email, password, navigate) => {
    try {
      console.log('Attempting login with:', email);

      if (!auth) {
        throw new Error('Firebase authentication not initialized');
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user);

      // Wait for user state to be fully updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to dashboard after successful login
      navigate('/dashboard', { replace: true });

      // Update user's last login time in Firestore
      if (result.user && result.user.uid) {
        try {
          await setDoc(
            doc(db, "users", result.user.uid),
            {
              lastLogin: new Date(),
            },
            { merge: true }
          );
        } catch (firestoreError) {
          console.error("Failed to update last login time:", firestoreError);
        }
      }

      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      console.error('Translated error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (navigate) => {
    try {
      console.log('Attempting Google login');

      if (!auth) {
        throw new Error('Firebase authentication not initialized');
      }

      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google login successful:', result.user);

      // Wait for user state to be fully updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to update user profile
      try {
        await updateProfile(result.user, {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });
      } catch (profileError) {
        console.error('Failed to update profile:', profileError);
      }

      // Try to update Firestore
      try {
        const userDoc = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userDoc);

        if (!userSnap.exists()) {
          await setDoc(userDoc, {
            name: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            createdAt: new Date(),
            lastLogin: new Date(),
            provider: 'google'
          });
        } else {
          await updateDoc(userDoc, {
            lastLogin: new Date()
          });
        }
      } catch (firestoreError) {
        console.error('Failed to update Firestore:', firestoreError);
      }

      // Navigate to dashboard regardless of Firestore errors
      navigate('/dashboard', { replace: true });
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = getErrorMessage(error);
      console.error('Translated error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (email, password, name, navigate) => {
    try {
      console.log("🔐 Creating user with email and password...");
      const result = await createUserWithEmailAndPassword(auth, email, password);
  
      if (!result.user || !result.user.uid) {
        throw new Error("No user ID returned from Firebase Auth");
      }
  
      console.log("👤 Updating user profile with displayName:", name);
      await updateProfile(result.user, { displayName: name });
  
      try {
        console.log("📝 Writing user data to Firestore...");
        await setDoc(
          doc(db, "users", result.user.uid),
          {
            name,
            email,
            createdAt: new Date(),
            lastLogin: new Date(),
          },
          { merge: true }
        );
      } catch (firestoreError) {
        // If Firestore fails, we still want to redirect to login
        console.error(" Firestore error (but registration successful):", firestoreError);
      }
  
      console.log("✅ Registration successful for:", email);
      // Redirect to login page with success message
      navigate('/login', { 
        state: { 
          successMessage: "Registration successful! Please log in with your credentials." 
        }
      });
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
    loginWithGoogle,
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
