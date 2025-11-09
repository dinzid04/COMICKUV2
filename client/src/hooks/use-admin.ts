import { useMemo } from "react";
import { User } from "firebase/auth";

// Add the Firebase UIDs of the admin users here
const ADMIN_UIDS = ["5pz32A07kOeTLjFjDvxTxAYjkWG3"];

export const useAdmin = (user: User | null) => {
  const isAdmin = useMemo(() => {
    if (!user) {
      return false;
    }
    return ADMIN_UIDS.includes(user.uid);
  }, [user]);

  return { isAdmin };
};
