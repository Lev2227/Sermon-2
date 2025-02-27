import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name"),
});

export const sermons = pgTable("sermons", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  bibleReference: text("bible_reference"),
  analysis: json("analysis").$type<SermonAnalysis>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SermonAnalysis = {
  structure: number;
  theology: number;
  relevance: number;
  engagement: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
};

export const insertUserSchema = createInsertSchema(users).pick({
  firebaseId: true,
  email: true,
  displayName: true,
});

export const insertSermonSchema = createInsertSchema(sermons)
  .pick({
    title: true,
    content: true,
    bibleReference: true,
  })
  .extend({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(50, "Sermon content must be at least 50 characters"),
    bibleReference: z.string().optional(),
  });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Sermon = typeof sermons.$inferSelect;
export type InsertSermon = z.infer<typeof insertSermonSchema>;
