import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { saweriaWebhook } from "./routes/webhooks";
import { createPaymentQr, checkPaymentStatus } from "./lib/saweria";
import { db } from "../client/src/firebaseConfig";
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc, increment } from "firebase/firestore";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

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
