/**
 * ReachOut Mobile MongoDB Bridge
 * Replaces Firebase with MongoDB API calls.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reachout2.onrender.com';

export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Basic auth check
    callback(null);
    return () => {};
  },
  signOut: async () => {}
};

export const db = {
  collection: (path: string) => ({ path }),
  doc: (path: string) => ({ path }),
};

// Minimal Firestore-like functions for mobile
export const getFirestore = () => db;
export const getAuth = () => auth;
export const initializeApp = () => ({});
