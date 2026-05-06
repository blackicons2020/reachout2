import { useState, useEffect } from 'react';
import { onSnapshot, doc, getDoc } from '../lib/db';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (token && userData) {
        setUser(userData);
        
        try {
          // Initial fetch to verify token and get profile
          const profileSnap = await getDoc(doc(db, 'users', userData.id));
          if (profileSnap.exists()) {
            const profileData = profileSnap.data() as UserProfile;
            setProfile(profileData);

            if (profileData.orgId) {
              const orgSnap = await getDoc(doc(db, 'organizations', profileData.orgId));
              if (orgSnap.exists()) {
                setOrganization(orgSnap.data());
              }
            }
          } else {
            // User doesn't exist in DB anymore
            throw new Error('User profile not found');
          }
        } catch (err) {
          console.error('Auth initialization failed:', err);
          // If it's a 401/403 or profile not found, clear auth
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setProfile(null);
        } finally {
          setLoading(false);
        }

        // Start snapshot for real-time updates after initial load
        const unsubProfile = onSnapshot(doc(db, 'users', userData.id), (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            setProfile(profileData);
          }
        });

        return () => unsubProfile();
      } else {
        setUser(null);
        setProfile(null);
        setOrganization(null);
        setLoading(false);
      }
    };

    window.addEventListener('auth-change', checkAuth);
    checkAuth();
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  return { user, profile, organization, loading };
}
