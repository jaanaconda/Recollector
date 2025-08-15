import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json, boolean, index, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryCategories = pgTable("memory_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  progress: integer("progress").default(0),
});

export const memories = pgTable("memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => memoryCategories.id),
  question: text("question").notNull(),
  response: text("response").notNull(),
  emotionalContext: text("emotional_context"),
  mediaAttachments: json("media_attachments").$type<{
    type: "image" | "video";
    url: string;
    filename: string;
    size: number;
  }[]>(),
  isPrivate: boolean("is_private").default(true),
  sharePasscode: varchar("share_passcode"),
  allowPublicView: boolean("allow_public_view").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("memories_user_id_idx").on(table.userId),
  index("memories_share_passcode_idx").on(table.sharePasscode),
]);

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  participantName: text("participant_name").notNull(),
  participantRelationship: text("participant_relationship"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  content: text("content").notNull(),
  isAiResponse: integer("is_ai_response").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  relationship: text("relationship").notNull(),
  accessLevel: text("access_level").notNull().default("limited"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read").default(0),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  dailyReminderEnabled: integer("daily_reminder_enabled").default(1),
  dailyReminderTime: text("daily_reminder_time").default("19:00"),
  weeklyGoal: integer("weekly_goal").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const memoryShares = pgTable("memory_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memoryId: varchar("memory_id").notNull().references(() => memories.id),
  sharedByUserId: varchar("shared_by_user_id").notNull().references(() => users.id),
  recipientEmail: text("recipient_email"),
  accessPasscode: varchar("access_passcode").notNull(),
  allowedViews: integer("allowed_views").default(-1),
  currentViews: integer("current_views").default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("memory_shares_passcode_idx").on(table.accessPasscode),
  index("memory_shares_memory_id_idx").on(table.memoryId),
]);

export const memoryAccessLogs = pgTable("memory_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memoryShareId: varchar("memory_share_id").notNull().references(() => memoryShares.id),
  viewerIpAddress: text("viewer_ip_address"),
  viewerUserAgent: text("viewer_user_agent"),
  accessedAt: timestamp("accessed_at").defaultNow(),
}, (table) => [
  index("memory_access_logs_share_id_idx").on(table.memoryShareId),
]);

// Life Events Table
export const lifeEvents = pgTable("life_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  eventType: text("event_type").notNull(),
  eventDate: timestamp("event_date"),
  description: text("description").notNull(),
  emotionalImpact: text("emotional_impact"),
  lessonsLearned: text("lessons_learned"),
  peopleInvolved: text("people_involved").array(),
  significantDecisions: text("significant_decisions"),
  personalGrowth: text("personal_growth"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family Relationships and Tree Structure
export const familyRelationships = pgTable("family_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  relativeName: varchar("relative_name").notNull(),
  relationship: varchar("relationship").notNull(),
  birthDate: timestamp("birth_date"),
  deathDate: timestamp("death_date"),
  occupation: varchar("occupation"),
  personalityTraits: text("personality_traits"),
  significance: text("significance"),
  sharedMemories: text("shared_memories").array().default(sql`ARRAY[]::text[]`),
  photoUrl: varchar("photo_url"),
  isAlive: boolean("is_alive").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Personality Insights for Advanced AI Modeling
export const personalityInsights = pgTable("personality_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category").notNull(),
  insight: text("insight").notNull(),
  confidence: real("confidence").notNull().default(0.0),
  sources: text("sources").array().default(sql`ARRAY[]::text[]`),
  examples: text("examples").array().default(sql`ARRAY[]::text[]`),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Memory Attachments for Photos and Documents
export const memoryAttachments = pgTable("memory_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memoryId: varchar("memory_id").notNull().references(() => memories.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  fileUrl: varchar("file_url").notNull(),
  description: text("description"),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => [
  index("memory_attachments_memory_id_idx").on(table.memoryId),
]);

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMemoryCategorySchema = createInsertSchema(memoryCategories).omit({
  id: true,
});

export const insertMemorySchema = createInsertSchema(memories).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMemoryShareSchema = createInsertSchema(memoryShares).omit({
  id: true,
  createdAt: true,
});

export const insertMemoryAccessLogSchema = createInsertSchema(memoryAccessLogs).omit({
  id: true,
  accessedAt: true,
});

export const insertLifeEventSchema = createInsertSchema(lifeEvents).omit({
  id: true,
  createdAt: true,
});

export const insertFamilyRelationshipSchema = createInsertSchema(familyRelationships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPersonalityInsightSchema = createInsertSchema(personalityInsights).omit({
  id: true,
  createdAt: true,
});

export const insertMemoryAttachmentSchema = createInsertSchema(memoryAttachments).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MemoryCategory = typeof memoryCategories.$inferSelect;
export type InsertMemoryCategory = z.infer<typeof insertMemoryCategorySchema>;

export type Memory = typeof memories.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type MemoryShare = typeof memoryShares.$inferSelect;
export type InsertMemoryShare = z.infer<typeof insertMemoryShareSchema>;

export type MemoryAccessLog = typeof memoryAccessLogs.$inferSelect;
export type InsertMemoryAccessLog = z.infer<typeof insertMemoryAccessLogSchema>;

export type LifeEvent = typeof lifeEvents.$inferSelect;
export type InsertLifeEvent = z.infer<typeof insertLifeEventSchema>;

export type FamilyRelationship = typeof familyRelationships.$inferSelect;
export type InsertFamilyRelationship = z.infer<typeof insertFamilyRelationshipSchema>;

export type PersonalityInsight = typeof personalityInsights.$inferSelect;
export type InsertPersonalityInsight = z.infer<typeof insertPersonalityInsightSchema>;

export type MemoryAttachment = typeof memoryAttachments.$inferSelect;
export type InsertMemoryAttachment = z.infer<typeof insertMemoryAttachmentSchema>;