import React, { useState, useEffect, useRef } from 'react';
import { onSnapshot, doc, getDoc } from '../lib/db';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const unsubRef = useRef<any>(null);
  
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && userData) {
      setUser(userData);
      
      try {
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

          if (!unsubRef.current) {
            unsubRef.current = onSnapshot(doc(db, 'users', userData.id), (docSnap) => {
              if (docSnap.exists()) {
                const updatedProfile = docSnap.data() as UserProfile;
                setProfile(prev => ({ ...prev, ...updatedProfile }));
              }
            });
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setProfile(null);
      setOrganization(null);
      setLoading(false);
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('auth-change', checkAuth);
    checkAuth();
    
    return () => {
      window.removeEventListener('auth-change', checkAuth);
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, []);

  return { user, profile, organization, loading, refreshAuth: checkAuth };
}
