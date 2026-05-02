import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to ensure loading doesn't hang forever
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization timed out - forcing ready state");
        setLoading(false);
      }
    }, 10000);

    let unsubProfile: (() => void) | undefined;
    let unsubOrg: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      setUser(user);
      
      // Clear previous listeners
      if (unsubProfile) unsubProfile();
      if (unsubOrg) unsubOrg();

      if (user) {
        // Listen to profile
        unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            setProfile(profileData);

            // Listen to Organization
            if (profileData.orgId) {
              if (unsubOrg) unsubOrg();
              unsubOrg = onSnapshot(doc(db, 'organizations', profileData.orgId), (orgSnap) => {
                if (orgSnap.exists()) {
                  setOrganization(orgSnap.data());
                } else {
                  setOrganization(null);
                }
              });
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile listen error:", error);
          setProfile(null);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setOrganization(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
      if (unsubOrg) unsubOrg();
    };
  }, []);

  return { user, profile, organization, loading };
}
