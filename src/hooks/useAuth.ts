import { useState, useEffect } from 'react';
import { onSnapshot, doc } from '../lib/db';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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
        setOrganization(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, profile, organization, loading };
}
