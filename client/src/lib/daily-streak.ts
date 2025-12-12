import { doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { User } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { isSameDay, isYesterday } from "date-fns";

export const checkDailyStreak = async (user: User) => {
  if (!user) return { success: false, message: "User not logged in" };

  const userRef = doc(db, "users", user.uid);

  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return { success: false, message: "User profile not found" };

    const userData = userDoc.data();
    const lastLogin = userData.lastLoginDate ? userData.lastLoginDate.toDate() : null;
    const now = new Date();

    let newStreak = userData.streak || 0;
    let xpBonus = 0;

    if (!lastLogin) {
      newStreak = 1;
      xpBonus = 150; // Day 1 Reward (requested)
    } else if (isSameDay(lastLogin, now)) {
      return { success: false, message: "Already checked in today" };
    } else if (isYesterday(lastLogin)) {
      newStreak += 1;
      // Rewards based on day
      // 1: 150, 2: 250, 3: 350, 4: 450, 5: 550, 6: 700, 7: 1000
      const rewards = [150, 250, 350, 450, 550, 700, 1000];
      const dayIndex = (newStreak - 1) % 7;
      xpBonus = rewards[dayIndex];
    } else {
      newStreak = 1;
      xpBonus = 150; // Reset to Day 1
    }

    await updateDoc(userRef, {
      lastLoginDate: serverTimestamp(),
      streak: newStreak,
      xp: increment(xpBonus)
    });

    return { success: true, newStreak, xpBonus };

  } catch (error) {
    console.error("Error checking streak:", error);
    return { success: false, error };
  }
};
