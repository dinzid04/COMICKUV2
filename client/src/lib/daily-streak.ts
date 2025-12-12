import { doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { User } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { isSameDay, isYesterday } from "date-fns";

export const checkDailyStreak = async (user: User) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const lastLogin = userData.lastLoginDate ? userData.lastLoginDate.toDate() : null;
    const now = new Date();

    // If no last login, or last login was yesterday, update streak
    // If last login was today, do nothing

    let newStreak = userData.streak || 0;
    let xpBonus = 0;

    if (!lastLogin) {
      // First time login logic if needed, but usually we start at 1
      newStreak = 1;
      xpBonus = 10;
    } else if (isSameDay(lastLogin, now)) {
      // Already logged in today
      return;
    } else if (isYesterday(lastLogin)) {
      // Login was yesterday, increment streak
      newStreak += 1;
      // Bonus logic: 10 XP per day, max 100 bonus
      xpBonus = Math.min(newStreak * 10, 100);
    } else {
      // Streak broken
      newStreak = 1;
      xpBonus = 10;
    }

    await updateDoc(userRef, {
      lastLoginDate: serverTimestamp(),
      streak: newStreak,
      xp: increment(xpBonus)
    });

    toast({
      title: "Daily Login!",
      description: `Streak: ${newStreak} Days! You earned ${xpBonus} XP.`,
    });

  } catch (error) {
    console.error("Error checking streak:", error);
  }
};
