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
  isPrivate: boolean("is_private").default(true), // All memories private by default
  sharePasscode: varchar("share_passcode"), // Unique passcode for selective sharing
  allowPublicView: boolean("allow_public_view").default(false), // Explicit public permission
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
  isAiResponse: integer("is_ai_response").default(0), // 0 for user, 1 for AI
  createdAt: timestamp("created_at").defaultNow(),
});

export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  relationship: text("relationship").notNull(),
  accessLevel: text("access_level").notNull().default("limited"), // "full" or "limited"
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "daily_reminder", "family_request", etc.
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
  dailyReminderTime: text("daily_reminder_time").default("19:00"), // 7 PM default
  weeklyGoal: integer("weekly_goal").default(3), // memories per week
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

// Memory sharing table for secure access control
export const memoryShares = pgTable("memory_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memoryId: varchar("memory_id").notNull().references(() => memories.id),
  sharedByUserId: varchar("shared_by_user_id").notNull().references(() => users.id),
  recipientEmail: text("recipient_email"), // Optional: for sharing with specific people
  accessPasscode: varchar("access_passcode").notNull(), // Unique passcode for this share
  allowedViews: integer("allowed_views").default(-1), // -1 = unlimited, >0 = limited views
  currentViews: integer("current_views").default(0),
  expiresAt: timestamp("expires_at"), // Optional expiration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("memory_shares_passcode_idx").on(table.accessPasscode),
  index("memory_shares_memory_id_idx").on(table.memoryId),
]);

// Access logs for tracking who viewed shared memories
export const memoryAccessLogs = pgTable("memory_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memoryShareId: varchar("memory_share_id").notNull().references(() => memoryShares.id),
  viewerIpAddress: text("viewer_ip_address"),
  viewerUserAgent: text("viewer_user_agent"),
  accessedAt: timestamp("accessed_at").defaultNow(),
}, (table) => [
  index("memory_access_logs_share_id_idx").on(table.memoryShareId),
]);

// Privacy-related insert schemas and types
export const insertMemoryShareSchema = createInsertSchema(memoryShares).omit({
  id: true,
  createdAt: true,
});

export const insertMemoryAccessLogSchema = createInsertSchema(memoryAccessLogs).omit({
  id: true,
  accessedAt: true,
});

export type MemoryShare = typeof memoryShares.$inferSelect;
export type InsertMemoryShare = z.infer<typeof insertMemoryShareSchema>;

export type MemoryAccessLog = typeof memoryAccessLogs.$inferSelect;
export type InsertMemoryAccessLog = z.infer<typeof insertMemoryAccessLogSchema>;

// Life Events Table - Major milestones and significant life experiences
export const lifeEvents = pgTable("life_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  eventType: text("event_type").notNull(), // marriage, divorce, birth, career_change, loss, achievement, etc.
  eventDate: timestamp("event_date"),
  description: text("description").notNull(),
  emotionalImpact: text("emotional_impact"), // how they felt about it
  lessonsLearned: text("lessons_learned"), // what they learned from it
  peopleInvolved: text("people_involved").array(), // who was important in this event
  significantDecisions: text("significant_decisions"), // key decisions made
  personalGrowth: text("personal_growth"), // how it changed them
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLifeEventSchema = createInsertSchema(lifeEvents).omit({
  id: true,
  createdAt: true,
});

export type LifeEvent = typeof lifeEvents.$inferSelect;
export type InsertLifeEvent = z.infer<typeof insertLifeEventSchema>;

// Family relationships and tree structure
export const familyTree = pgTable("family_tree", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  relationship: varchar("relationship").notNull(), // father, mother, spouse, child, sibling, etc.
  birthDate: timestamp("birth_date"),
  deathDate: timestamp("death_date"),
  occupation: varchar("occupation"),
  personality: text("personality"), // Brief personality description
  significance: text("significance"), // Why this person was important
  sharedMemories: text("shared_memories").array().default(sql`ARRAY[]::text[]`),
  photoUrl: varchar("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type FamilyTreeMember = typeof familyTree.$inferSelect;
export type InsertFamilyTreeMember = typeof familyTree.$inferInsert;

export const insertFamilyTreeMemberSchema = createInsertSchema(familyTree).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Personality insights and modeling
export const personalityInsights = pgTable("personality_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category").notNull(), // communication_style, values, humor, decision_making, etc.
  insight: text("insight").notNull(),
  confidence: integer("confidence").notNull().default(0), // 0-100 confidence score
  sources: text("sources").array().default(sql`ARRAY[]::text[]`), // Memory/life event IDs that led to this insight
  examples: text("examples").array().default(sql`ARRAY[]::text[]`), // Specific examples of this trait
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PersonalityInsight = typeof personalityInsights.$inferSelect;
export type InsertPersonalityInsight = typeof personalityInsights.$inferInsert;

export const insertPersonalityInsightSchema = createInsertSchema(personalityInsights).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Memory attachments for photos and documents
export const memoryAttachments = pgTable("memory_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memoryId: varchar("memory_id").notNull().references(() => memories.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // image, document, audio, etc.
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"),
  description: text("description"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export type MemoryAttachment = typeof memoryAttachments.$inferSelect;
export type InsertMemoryAttachment = typeof memoryAttachments.$inferInsert;

export const insertMemoryAttachmentSchema = createInsertSchema(memoryAttachments).omit({
  id: true,
  uploadedAt: true,
});

// Family relationships and tree structure
export const familyRelationships = pgTable("family_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  relativeName: varchar("relative_name").notNull(),
  relationship: varchar("relationship").notNull(), // father, mother, spouse, child, sibling, etc.
  birthDate: timestamp("birth_date"),
  deathDate: timestamp("death_date"),
  occupation: varchar("occupation"),
  personalityTraits: text("personality_traits"), // Brief personality description
  significance: text("significance"), // Why this person was important
  sharedMemories: text("shared_memories").array().default(sql`ARRAY[]::text[]`),
  photoUrl: varchar("photo_url"),
  isAlive: boolean("is_alive").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFamilyRelationshipSchema = createInsertSchema(familyRelationships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FamilyRelationship = typeof familyRelationships.$inferSelect;
export type InsertFamilyRelationship = z.infer<typeof insertFamilyRelationshipSchema>;

// Personality insights and modeling for advanced AI responses
export const personalityInsights = pgTable("personality_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category").notNull(), // communication_style, values, humor, decision_making, etc.
  insight: text("insight").notNull(),
  confidence: integer("confidence").notNull().default(0), // 0-100 confidence score
  sources: text("sources").array().default(sql`ARRAY[]::text[]`), // Memory/life event IDs that led to this insight
  examples: text("examples").array().default(sql`ARRAY[]::text[]`), // Specific examples of this trait
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPersonalityInsightSchema = createInsertSchema(personalityInsights).omit({
  id: true,
  createdAt: true,
});

export type PersonalityInsight = typeof personalityInsights.$inferSelect;
export type InsertPersonalityInsight = z.infer<typeof insertPersonalityInsightSchema>;

// Memory attachments for photos and documents
export const memoryAttachments = pgTable("memory_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memoryId: varchar("memory_id").notNull().references(() => memories.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // image, document, audio, etc.
  fileUrl: varchar("file_url").notNull(),
  description: text("description"),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => [
  index("memory_attachments_memory_id_idx").on(table.memoryId),
]);

export const insertMemoryAttachmentSchema = createInsertSchema(memoryAttachments).omit({
  id: true,
  uploadedAt: true,
});

export type MemoryAttachment = typeof memoryAttachments.$inferSelect;
export type InsertMemoryAttachment = z.infer<typeof insertMemoryAttachmentSchema>;

// Enhanced Family Members and Tree Structure
export const familyRelationships = pgTable("family_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  relationship: varchar("relationship").notNull(), // father, mother, spouse, child, sibling, etc.
  birthDate: timestamp("birth_date"),
  deathDate: timestamp("death_date"),
  occupation: varchar("occupation"),
  personality: text("personality"), // Brief personality description
  significance: text("significance"), // Why this person was important
  sharedMemories: text("shared_memories").array().default(sql`ARRAY[]::text[]`),
  photoUrl: varchar("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFamilyRelationshipSchema = createInsertSchema(familyRelationships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FamilyRelationship = typeof familyRelationships.$inferSelect;
export type InsertFamilyRelationship = z.infer<typeof insertFamilyRelationshipSchema>;

// Personality Insights and Advanced Modeling
export const personalityInsights = pgTable("personality_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category").notNull(), // communication_style, values, humor, decision_making, etc.
  insight: text("insight").notNull(),
  confidence: real("confidence").notNull().default(0.0), // 0-1 confidence score
  sources: text("sources").array().default(sql`ARRAY[]::text[]`), // Memory/life event IDs that led to this insight
  examples: text("examples").array().default(sql`ARRAY[]::text[]`), // Specific examples of this trait
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPersonalityInsightSchema = createInsertSchema(personalityInsights).omit({
  id: true,
  createdAt: true,
});

export type PersonalityInsight = typeof personalityInsights.$inferSelect;
export type InsertPersonalityInsight = z.infer<typeof insertPersonalityInsightSchema>;

// Memory Attachments for Photos and Documents
export const memoryAttachments = pgTable("memory_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memoryId: varchar("memory_id").notNull().references(() => memories.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // image, document, audio, etc.
  fileUrl: varchar("file_url").notNull(),
  description: text("description"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertMemoryAttachmentSchema = createInsertSchema(memoryAttachments).omit({
  id: true,
  uploadedAt: true,
});

export type MemoryAttachment = typeof memoryAttachments.$inferSelect;
export type InsertMemoryAttachment = z.infer<typeof insertMemoryAttachmentSchema>;
