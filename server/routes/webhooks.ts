import type { Request, Response } from "express";
// We need to point to the correct relative path.
// From server/routes/webhooks.ts -> ../../client/src/firebaseConfig
import { db } from "../../client/src/firebaseConfig";
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc, increment } from "firebase/firestore";

// Note: Using client SDK on server is generally discouraged for auth/privilege reasons,
// but for this "hybrid" express setup where we might not have admin SDK initialized with key file,
// we'll stick to what is available. However, server writes bypass rules ONLY if using Admin SDK.
// Since we are likely using client SDK here, we need to ensure rules allow writing to 'donations'.
// BUT, this is a server route. It runs in Node.
// If `db` is from client SDK, it respects rules. We might need a rule "allow create: if true" for donations
// or better, use Admin SDK.
// For this environment, let's assume we can write or rules allow public write for donations (risky).
// A better approach for this snippet is to simulate the logic or assume Admin SDK is set up if possible.
// Given constraints, I will implement logic assuming `db` works.

export async function saweriaWebhook(req: Request, res: Response) {
  try {
    const { amount, donator_name, donator_email, message, id } = req.body;

    // Basic validation
    if (!amount || !donator_name) {
       return res.status(400).json({ error: "Invalid payload" });
    }

    // 1. Record Donation
    await addDoc(collection(db, "donations"), {
      amount: parseInt(amount),
      donator_name,
      donator_email: donator_email || null,
      message: message || "",
      transaction_id: id || null,
      created_at: serverTimestamp()
    });

    // 2. XP Bonus for Supporter (if email matches a user)
    if (donator_email) {
       const usersRef = collection(db, "users");
       const q = query(usersRef, where("email", "==", donator_email));
       const snapshot = await getDocs(q);

       if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          // Award XP (e.g., 1 XP per 100 Rupiah)
          const xpBonus = Math.floor(parseInt(amount) / 100);

          await updateDoc(doc(db, "users", userDoc.id), {
             xp: increment(xpBonus)
          });
          console.log(`Awarded ${xpBonus} XP to ${donator_email}`);
       }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
