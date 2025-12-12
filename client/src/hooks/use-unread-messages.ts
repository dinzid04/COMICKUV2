import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Query all private chats where the user is a participant
    const q = query(
      collection(db, 'private_chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        // Check if unreadCounts map exists and has a value for the current user
        if (data.unreadCounts && typeof data.unreadCounts[user.uid] === 'number') {
          total += data.unreadCounts[user.uid];
        }
      });
      setUnreadCount(total);
    });

    return () => unsubscribe();
  }, [user]);

  return unreadCount;
}
