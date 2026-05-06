import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { onSnapshot, doc } from '../lib/db';
import { auth, db } from '../lib/firebase';
=======
import api from '../lib/api';
>>>>>>> f78d82d23904cb31b9212a813995e1b958994366
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  useEffect(() => {
    // Polling check for auth state since we don't have onAuthStateChanged
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (token && userData) {
        setUser(userData);
        
        // Fetch/Listen to profile and org
        const unsubProfile = onSnapshot(doc(db, 'users', userData.id), (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            setProfile(profileData);

            if (profileData.orgId) {
              onSnapshot(doc(db, 'organizations', profileData.orgId), (orgSnap) => {
                if (orgSnap.exists()) {
                  setOrganization(orgSnap.data());
                }
              });
            }
          }
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setUser(null);
        setProfile(null);
=======
  const fetchAuthData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setProfile(null);
      setOrganization(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      setUser({
        uid: userData._id,
        email: userData.email,
        displayName: userData.displayName,
      });
      
      setProfile({
        id: userData._id,
        email: userData.email,
        orgId: userData.orgId?._id || userData.orgId || null,
        role: userData.role,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        setupCompleted: userData.setupCompleted,
      });

      if (userData.orgId) {
        setOrganization(userData.orgId);
      } else {
>>>>>>> f78d82d23904cb31b9212a813995e1b958994366
        setOrganization(null);
      }
<<<<<<< HEAD
=======
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthData();

    // Custom event for login/logout synchronization across tabs
    const handleAuthChange = () => fetchAuthData();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
>>>>>>> f78d82d23904cb31b9212a813995e1b958994366
    };

    checkAuth();
  }, []);

  return { user, profile, organization, loading, refreshAuth: fetchAuthData };
}
