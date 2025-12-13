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

export const updateStreakWithConfig = async (user: User) => {
  if (!user) return { success: false, message: "User not logged in" };

  const userRef = doc(db, "users", user.uid);
  const configRef = doc(db, "settings", "gamification");

  try {
    const [userDoc, configDoc] = await Promise.all([
      getDoc(userRef),
      getDoc(configRef)
    ]);

    if (!userDoc.exists()) return { success: false, message: "User profile not found" };

    const userData = userDoc.data();
    const configData = configDoc.exists() ? configDoc.data() : {};

    const daysConfig = configData.days || Array(7).fill({ type: 'xp', amount: 50 });

    // Use lastStreakClaim instead of lastLoginDate to decouple from general activity
    const lastClaim = userData.lastStreakClaim ? userData.lastStreakClaim.toDate() : null;
    const now = new Date();

    let newStreak = userData.streak || 0;

    if (lastClaim && isSameDay(lastClaim, now)) {
       return { success: false, message: "Already checked in today" };
    }

    if (lastClaim && isYesterday(lastClaim)) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset or First time
    }

    // Determine reward based on day index (0-6)
    // Streak 1 = Index 0
    const dayIndex = (newStreak - 1) % 7;
    const todayReward = daysConfig[dayIndex] || { type: 'xp', amount: 50 };

    const updates: any = {
      lastStreakClaim: serverTimestamp(), // Update the dedicated claim timestamp
      lastLoginDate: serverTimestamp(), // Keep this for general stats
      streak: newStreak
    };

    if (todayReward.type === 'coin') {
      updates.coins = increment(todayReward.amount);
    } else {
      updates.xp = increment(todayReward.amount);
    }

    await updateDoc(userRef, updates);

    return { success: true, newStreak, rewardType: todayReward.type, rewardAmount: todayReward.amount };

  } catch (error) {
    console.error("Error updating streak with config:", error);
    return { success: false, error };
  }
};
