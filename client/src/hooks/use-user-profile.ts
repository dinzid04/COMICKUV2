import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from './use-auth';
import { User } from 'shared/types';

export const useUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['userProfile', user?.uid];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.uid) return null;

      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        return docSnap.data() as User;
      }

      // Fallback to auth data if firestore doc doesn't exist yet
      return {
        uid: user.uid,
        email: user.email || '',
        nickname: user.displayName || 'User',
        photoUrl: user.photoURL || undefined,
      } as User;
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const updateProfileCache = (newData: Partial<User>) => {
    queryClient.setQueryData(queryKey, (oldData: User | null | undefined) => {
      if (!oldData) return oldData;
      return { ...oldData, ...newData };
    });
  };

  return { ...query, invalidateProfile, updateProfileCache };
};
