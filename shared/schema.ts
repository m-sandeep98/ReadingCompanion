import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  url: text("url"),
  type: text("type").notNull(), // 'url' or 'pdf'
  content: text("content"),
  pdfData: text("pdf_data"), // Base64 encoded PDF data
  addedAt: timestamp("added_at").defaultNow().notNull(),
  readingTime: integer("reading_time"), // Estimated reading time in minutes
});

export const highlights = pgTable("highlights", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  note: text("note"),
  explanation: jsonb("explanation"),
  startOffset: integer("start_offset"),
  endOffset: integer("end_offset"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  title: true,
  url: true,
  type: true,
  content: true,
  pdfData: true,
  readingTime: true,
});

export const insertHighlightSchema = createInsertSchema(highlights).pick({
  documentId: true,
  userId: true,
  text: true,
  note: true,
  explanation: true,
  startOffset: true,
  endOffset: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type Highlight = typeof highlights.$inferSelect;

// API Request/Response Types
export const addUrlDocumentSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
});

export const addPdfDocumentSchema = z.object({
  title: z.string(),
  pdfData: z.string(), // Base64 encoded PDF data
});

export const explainTextSchema = z.object({
  text: z.string().min(1),
  documentId: z.number().optional(),
});

export const summarizeDocumentSchema = z.object({
  documentId: z.number().optional(),
  text: z.string().optional(),
});

export const addHighlightSchema = z.object({
  documentId: z.number(),
  text: z.string().min(1),
  startOffset: z.number().optional(),
  endOffset: z.number().optional(),
});
