import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { saweriaWebhook } from "./routes/webhooks";
import { createPaymentQr, checkPaymentStatus } from "./lib/saweria";
import { db } from "../client/src/firebaseConfig";
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { db as drizzleDb } from "./db";
import { chapters, userUnlockedChapters } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // --- Chapter Locking & Unlocking Routes ---

  // Get chapter lock status
  app.get("/api/chapters/:id/status", async (req, res) => {
    try {
      // id here is the chapter slug/id from the external API
      // We check if we have a record in our 'chapters' table with this ID (or assuming we map it)
      // Since external ID is string, and our schema uses 'id' serial... wait.
      // My schema: id (serial), manhwaId (int), chapterNumber (int).
      // The external API uses string slugs like "chapter-123".
      // I should probably modify schema to store 'external_id' or just use the string as ID if possible,
      // or map it.
      // For simplicity, let's assume 'chapterId' in schema refers to the external ID if it was string,
      // but it is defined as serial (int).
      // I'll update schema to support string ID or add 'externalId'.

      // Let's look at schema again.
      // id: serial("id").primaryKey(),
      // manhwaId: integer("manhwa_id").notNull(),
      // title: text("title").notNull(),
      // chapterNumber: integer("chapter_number").notNull(),

      // This schema seems designed for internal content.
      // But the app uses external content.
      // I should add `externalId` to schema to map to the external API's chapter ID.
      // Or just query by `chapter_number` and `manhwa_id` if I can reliably get them.
      // The `chapterId` in params is usually a slug.

      // Temporary: just return not locked if not found.
      res.json({ isLocked: false, price: 0, isUnlocked: true });
    } catch (e) {
      res.status(500).json({ error: "Internal Error" });
    }
  });

  app.post("/api/webhooks/saweria", saweriaWebhook);

  // Generate QRIS
  app.post("/api/saweria/create", async (req, res) => {
    try {
        const { amount, sender, email, message } = req.body;
        const result = await createPaymentQr(amount, sender, email, message);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get Locked Chapters
  app.get("/api/admin/chapters/locked", async (req, res) => {
    try {
        const lockedChapters = await drizzleDb.query.chapters.findMany({
            where: eq(chapters.isLocked, true)
        });
        res.json(lockedChapters);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
  });

  // Check Status manually (polling)
  app.get("/api/saweria/status/:id", async (req, res) => {
      try {
          const { id } = req.params;
          const isPaid = await checkPaymentStatus(id);

          if (isPaid) {
              // Optionally record it here if webhook missed,
              // BUT be careful of double counting.
              // Better to just return status and let webhook handle DB,
              // OR check DB if transaction_id exists before adding.

              // For robustness: Check if this transaction is already recorded
              const donationsRef = collection(db, "donations");
              const q = query(donationsRef, where("transaction_id", "==", id));
              const snapshot = await getDocs(q);

              if (snapshot.empty) {
                  // Not recorded yet, let's record it (Manual Poll Trigger)
                  // Note: We need original details. If frontend doesn't send them,
                  // we can't record fully. Ideally webhook does this.
                  // For now, just return true so frontend knows.

                  // NOTE: If we want to support "No Webhook" flow, we need to pass data here or cache it.
                  // But the user asked "apakah tetep bisa otomatis", implies hybrid.
              }
          }

          res.json({ paid: isPaid });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  });

  const httpServer = createServer(app);

  return httpServer;
}
