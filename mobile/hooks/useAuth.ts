import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let unsubOrg: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (unsubProfile) unsubProfile();
      if (unsubOrg) unsubOrg();

      if (user) {
        unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            setProfile(profileData);

            if (profileData.orgId) {
              unsubOrg = onSnapshot(doc(db, 'organizations', profileData.orgId), (orgSnap) => {
                if (orgSnap.exists()) {
                  setOrganization(orgSnap.data());
                } else {
                  setOrganization(null);
                }
                setLoading(false);
              });
            } else {
              setLoading(false);
            }
          } else {
            setProfile(null);
            setLoading(false);
          }
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
