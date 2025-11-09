import { useAuth } from './use-auth';

// This should be stored in a secure place, like a database or environment variables
const ADMIN_UIDS = ['YOUR_ADMIN_UID_HERE']; // Replace with actual admin UIDs

export function useAdmin() {
  const { user } = useAuth();
  const isAdmin = user ? ADMIN_UIDS.includes(user.uid) : false;
  return { isAdmin };
}
