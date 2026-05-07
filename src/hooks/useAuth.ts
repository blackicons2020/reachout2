import { useState, useEffect } from 'react';
import api from '../lib/api';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !userData) {
      setUser(null);
      setProfile(null);
      setOrganization(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      const dbUser = res.data.user;
      
      if (dbUser) {
        // Update user state with fresh data from DB
        const updatedUser = { 
          id: dbUser._id, 
          email: dbUser.email, 
          displayName: dbUser.displayName, 
          orgId: dbUser.orgId?._id || dbUser.orgId, 
          role: dbUser.role 
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        const newProfile: UserProfile = {
          id: dbUser._id,
          email: dbUser.email,
          displayName: dbUser.displayName,
          role: dbUser.role,
          orgId: dbUser.orgId?._id || dbUser.orgId,
          setupCompleted: dbUser.setupCompleted,
          organizationType: dbUser.organizationType
        };
        setProfile(newProfile);

        if (dbUser.orgId && typeof dbUser.orgId === 'object') {
          setOrganization(dbUser.orgId);
        } else if (dbUser.orgId) {
          try {
            const orgRes = await api.get(`/organizations/${dbUser.orgId}`);
            setOrganization(orgRes.data);
          } catch (orgErr) {
            console.error('Failed to fetch organization details:', orgErr);
          }
        }
      }
    } catch (err) {
      console.error('Auth synchronization failed:', err);
      if ((err as any).response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setProfile(null);
        setOrganization(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  return { 
    user, 
    profile, 
    organization, 
    loading, 
    refreshAuth: checkAuth 
  };
}
