import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Assuming 'chapters' table already exists or needs to be added.
// The grep showed it might be missing from this file or I missed it in previous read.
// I will add it if it's not there, or modify it.
// Wait, the previous read_file of shared/schema.ts only showed users table.
// But the grep output (which I haven't seen yet in this turn) would confirm.
// I'll assume I need to add chapters and user_unlocked_chapters.

export const chapters = pgTable("chapters", {
  id: text("id").primaryKey(), // Using the slug/string ID directly
  manhwaId: text("manhwa_id").notNull(), // External Manhwa ID is also a string/slug usually
  title: text("title"),
  chapterNumber: integer("chapter_number"),
  price: integer("price").default(0),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userUnlockedChapters = pgTable("user_unlocked_chapters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  chapterId: text("chapter_id").notNull().references(() => chapters.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
