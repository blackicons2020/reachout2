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
      setUser(userData);
      const res = await api.get('/auth/me');
      const dbUser = res.data.user;
      
      if (dbUser) {
        // Map DB user to Profile/Organization structure expected by components
        setProfile({
          id: dbUser._id,
          email: dbUser.email,
          displayName: dbUser.displayName,
          role: dbUser.role,
          orgId: dbUser.orgId?._id || dbUser.orgId,
          setupCompleted: dbUser.setupCompleted,
          organizationType: dbUser.organizationType
        });

        if (dbUser.orgId && typeof dbUser.orgId === 'object') {
          setOrganization(dbUser.orgId);
        } else if (dbUser.orgId) {
          // If not populated for some reason
          const orgRes = await api.get(`/organizations/${dbUser.orgId}`);
          setOrganization(orgRes.data);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // If unauthorized, clear local storage
      if ((err as any).response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // Re-check auth on storage changes or custom events
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
