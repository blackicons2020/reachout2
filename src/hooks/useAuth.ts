import { useState, useEffect } from 'react';
import api from '../lib/api';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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
        setOrganization(null);
      }
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
    };
  }, []);

  return { user, profile, organization, loading, refreshAuth: fetchAuthData };
}
