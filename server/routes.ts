import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { saweriaWebhook } from "./routes/webhooks";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  app.post("/api/webhooks/saweria", saweriaWebhook);

  const httpServer = createServer(app);

  return httpServer;
}
