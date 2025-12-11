import { useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

export function usePresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);

    const updatePresence = async () => {
      try {
        await updateDoc(userDocRef, {
          lastSeen: serverTimestamp(),
          isOnline: true
        });
      } catch (error) {
        console.error("Error updating presence:", error);
      }
    };

    // Update immediately on mount
    updatePresence();

    // Update every 2 minutes (120000 ms)
    const intervalId = setInterval(updatePresence, 120000);

    // Update on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: try to set offline on unmount (best effort)
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // We generally can't reliably update firestore on window close without Beacon API or keepalive,
      // and this cleanup runs on every re-render/logout.
      // For now, we rely on the heartbeat timeout (timestamp check) for "offline" status.
    };
  }, [user]);
}
