import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import admin from "firebase-admin";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cors());

  // Endpoint to get user profile data
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userDoc = await admin.firestore().collection("users").doc(id).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }
      const userData = userDoc.data();

      // Fetch user's favorites
      const favoritesSnapshot = await admin.firestore()
        .collection("users")
        .doc(id)
        .collection("my-favorites")
        .orderBy("addedAt", "desc")
        .get();

      const favorites = favoritesSnapshot.docs.map(doc => doc.data());

      res.json({ ...userData, favorites });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Endpoint to follow a user
  app.post("/api/users/:id/follow", async (req, res) => {
    try {
      const { id: targetUserId } = req.params;
      const { currentUserId } = req.body; // Assume current user's ID is sent in the request body

      if (!currentUserId) {
        return res.status(400).json({ message: "Current user ID is required" });
      }

      const currentUserRef = admin.firestore().collection("users").doc(currentUserId);
      const targetUserRef = admin.firestore().collection("users").doc(targetUserId);

      // Add target user to current user's following list
      await currentUserRef.collection("following").doc(targetUserId).set({
        followedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Add current user to target user's followers list
      await targetUserRef.collection("followers").doc(currentUserId).set({
        followedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update following and followers counts
      await admin.firestore().runTransaction(async (transaction) => {
        const currentUserDoc = await transaction.get(currentUserRef);
        const targetUserDoc = await transaction.get(targetUserRef);

        if (!currentUserDoc.exists || !targetUserDoc.exists) {
          throw new Error("User not found");
        }

        const newFollowingCount = (currentUserDoc.data()?.followingCount || 0) + 1;
        const newFollowersCount = (targetUserDoc.data()?.followersCount || 0) + 1;

        transaction.update(currentUserRef, { followingCount: newFollowingCount });
        transaction.update(targetUserRef, { followersCount: newFollowersCount });
      });

      res.status(200).json({ message: "Successfully followed user" });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Endpoint to unfollow a user
  app.post("/api/users/:id/unfollow", async (req, res) => {
    try {
      const { id: targetUserId } = req.params;
      const { currentUserId } = req.body;

      if (!currentUserId) {
        return res.status(400).json({ message: "Current user ID is required" });
      }

      const currentUserRef = admin.firestore().collection("users").doc(currentUserId);
      const targetUserRef = admin.firestore().collection("users").doc(targetUserId);

      // Remove target user from current user's following list
      await currentUserRef.collection("following").doc(targetUserId).delete();

      // Remove current user from target user's followers list
      await targetUserRef.collection("followers").doc(currentUserId).delete();

      // Update following and followers counts
      await admin.firestore().runTransaction(async (transaction) => {
        const currentUserDoc = await transaction.get(currentUserRef);
        const targetUserDoc = await transaction.get(targetUserRef);

        if (!currentUserDoc.exists || !targetUserDoc.exists) {
          throw new Error("User not found");
        }

        const newFollowingCount = Math.max(0, (currentUserDoc.data()?.followingCount || 0) - 1);
        const newFollowersCount = Math.max(0, (targetUserDoc.data()?.followersCount || 0) - 1);

        transaction.update(currentUserRef, { followingCount: newFollowingCount });
        transaction.update(targetUserRef, { followersCount: newFollowersCount });
      });

      res.status(200).json({ message: "Successfully unfollowed user" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
