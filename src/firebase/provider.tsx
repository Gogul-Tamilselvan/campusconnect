'use client';
import React, { createContext, useContext } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXacMrzHsD7kCI6RNoJELsHIcZKwFAhOA",
  authDomain: "campusconnect-1318a.firebaseapp.com",
  projectId: "campusconnect-1318a",
  storageBucket: "campusconnect-1318a.appspot.com",
  messagingSenderId: "1001319904361",
  appId: "1:1001319904361:web:43295a60b18c9d35205ef8"
};


interface FirebaseContextValue {
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    
    return (
        <FirebaseContext.Provider value={{ app, firestore, auth }}>
            {children}
        </FirebaseContext.Provider>
    );
};

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

export const useFirebaseApp = () => useFirebase().app;
export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;
