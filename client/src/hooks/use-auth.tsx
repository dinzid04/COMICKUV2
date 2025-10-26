import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  needsSetup: boolean;
  recheckAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  needsSetup: false,
  recheckAdminStatus: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const checkAdminStatus = useCallback(async (currentUser: User | null) => {
    if (!isFirebaseConfigured || !db) {
        setIsAdmin(false);
        setNeedsSetup(false);
        return;
    }

    if (currentUser) {
      const settingsDocRef = doc(db, 'dashboard', 'settings');
      try {
        const settingsDocSnap = await getDoc(settingsDocRef);
        if (settingsDocSnap.exists()) {
          const admins = settingsDocSnap.data()?.admins || [];
          setIsAdmin(admins.includes(currentUser.uid));
          setNeedsSetup(false);
        } else {
          setIsAdmin(false);
          setNeedsSetup(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setNeedsSetup(false);
      }
    } else {
      setIsAdmin(false);
      setNeedsSetup(false);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkAdminStatus(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkAdminStatus]);

  const recheckAdminStatus = useCallback(async () => {
    setLoading(true);
    await checkAdminStatus(auth.currentUser);
    setLoading(false);
  }, [checkAdminStatus]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, needsSetup, recheckAdminStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
