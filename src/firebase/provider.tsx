'use client';
import React, { createContext, useContext } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyB8ahNcHBe4tTBi1mrJINcXcl_QQXt3OYo",
  authDomain: "campusconnectz.firebaseapp.com",
  projectId: "campusconnectz",
  storageBucket: "campusconnectz.firebasestorage.app",
  messagingSenderId: "620187555067",
  appId: "1:620187555067:web:60dadc881f97b1a31e4c5e"
};

interface FirebaseContextValue {
    app: FirebaseApp;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return (
        <FirebaseContext.Provider value={{ app }}>
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
