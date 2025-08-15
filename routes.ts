import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemorySchema, insertConversationSchema, insertMessageSchema, insertFamilyMemberSchema, insertMemoryShareSchema, insertMemoryAccessLogSchema, insertLifeEventSchema } from "@shared/schema";
import { analyzePersonality, generatePersonalizedResponse, generateQuestionSuggestions, generateReligiousQuestions } from "./services/openai";
import { PrivacyService } from "./services/privacy-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user data
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get memory categories
  app.get("/api/memory-categories", async (req, res) => {
    try {
      const categories = await storage.getMemoryCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get memory categories" });
    }
  });

  // Get memories for a user
  app.get("/api/memories/:userId", async (req, res) => {
    try {
      const memories = await storage.getMemories(req.params.userId);
      res.json(memories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get memories" });
    }
  });

  // Get memories by category
  app.get("/api/memories/:userId/:categoryId", async (req, res) => {
    try {
      const memories = await storage.getMemoriesByCategory(req.params.userId, req.params.categoryId);
      res.json(memories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get memories by category" });
    }
  });

  // Create a new memory
  app.post("/api/memories", async (req, res) => {
    try {
      const memoryData = insertMemorySchema.parse(req.body);
      const memory = await storage.createMemory(memoryData);
      
      // Update category progress (simplified calculation)
      const categoryMemories = await storage.getMemoriesByCategory(memoryData.userId, memoryData.categoryId);
      const newProgress = Math.min(100, Math.floor(categoryMemories.length * 10));
      await storage.updateMemoryCategoryProgress(memoryData.categoryId, newProgress);
      
      res.json(memory);
    } catch (error) {
      res.status(400).json({ message: "Failed to create memory" });
    }
  });

  // Get conversations for a user
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get conversations" });
    }
  });

  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Failed to create conversation" });
    }
  });

  // Get messages for a conversation
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send a message and get AI response
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createMessage(messageData);
      
      // Get conversation to find user
      const conversation = await storage.getConversation(messageData.conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Get user memories for context
      const memories = await storage.getMemories(conversation.userId);
      const memoryTexts = memories.map(m => `${m.question}: ${m.response}`);
      
      // Analyze personality if we have enough memories
      let personalityProfile;
      if (memories.length > 0) {
        personalityProfile = await analyzePersonality(memoryTexts);
      } else {
        personalityProfile = {
          communicationStyle: "warm and thoughtful",
          emotionalTone: "gentle and reflective",
          vocabulary: "clear and descriptive",
          storytellingStyle: "detailed with emotional context",
          values: ["family", "kindness", "growth"]
        };
      }
      
      // Generate AI response
      const aiResponseText = await generatePersonalizedResponse(
        messageData.content,
        memoryTexts,
        personalityProfile
      );
      
      // Save AI response
      const aiMessage = await storage.createMessage({
        conversationId: messageData.conversationId,
        content: aiResponseText,
        isAiResponse: 1,
      });
      
      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Message error:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Get family members
  app.get("/api/family/:userId", async (req, res) => {
    try {
      const familyMembers = await storage.getFamilyMembers(req.params.userId);
      res.json(familyMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get family members" });
    }
  });

  // Add family member
  app.post("/api/family", async (req, res) => {
    try {
      const familyMemberData = insertFamilyMemberSchema.parse(req.body);
      const familyMember = await storage.createFamilyMember(familyMemberData);
      res.json(familyMember);
    } catch (error) {
      res.status(400).json({ message: "Failed to add family member" });
    }
  });

  // Generate question suggestions
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const { category, userId } = req.body;
      const memories = await storage.getMemoriesByCategory(userId, category);
      const memoryTexts = memories.map(m => `${m.question}: ${m.response}`);
      
      const questions = await generateQuestionSuggestions(category, memoryTexts);
      res.json({ questions });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  // Digital Legacy AI Response - the core feature for post-death conversations
  app.post("/api/ai/legacy-response", async (req, res) => {
    try {
      const { question, memories, userId } = req.body;
      
      // Get user for context
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Analyze personality from memories
      const personalityProfile = await analyzePersonality(memories);
      
      // Generate response as the person would have spoken
      const response = await generatePersonalizedResponse(question, memories, personalityProfile);
      
      res.json({ 
        message: response,
        userName: user.name,
        personalityInsight: personalityProfile.communicationStyle
      });
    } catch (error) {
      console.error("Error generating legacy response:", error);
      res.status(500).json({ message: "Failed to generate response from digital legacy" });
    }
  });

  // Get dashboard stats
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const memories = await storage.getMemories(req.params.userId);
      const conversations = await storage.getConversations(req.params.userId);
      const familyMembers = await storage.getFamilyMembers(req.params.userId);
      
      res.json({
        memoryCount: memories.length,
        conversationCount: conversations.length,
        familyCount: familyMembers.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // User preferences routes
  app.get("/api/preferences/:userId", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences(req.params.userId);
      if (!preferences) {
        return res.status(404).json({ error: "User preferences not found" });
      }
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });

  app.post("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.createUserPreferences(req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error creating user preferences:", error);
      res.status(500).json({ error: "Failed to create user preferences" });
    }
  });

  app.patch("/api/preferences/:userId", async (req, res) => {
    try {
      await storage.updateUserPreferences(req.params.userId, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  });

  // ============================================
  // PRIVACY & SHARING ROUTES
  // ============================================

  // Create memory share (generate secure passcode)
  app.post("/api/memory-shares", async (req, res) => {
    try {
      const shareData = insertMemoryShareSchema.parse(req.body);
      
      // Generate unique passcode
      const accessPasscode = PrivacyService.generateAccessPasscode();
      
      const share = await storage.createMemoryShare({
        ...shareData,
        accessPasscode,
      });
      
      res.json(share);
    } catch (error) {
      console.error("Error creating memory share:", error);
      res.status(400).json({ message: "Failed to create memory share" });
    }
  });

  // Get memory shares for a user (their shared memories)
  app.get("/api/memory-shares/:userId", async (req, res) => {
    try {
      const shares = await storage.getMemoryShares(req.params.userId);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching memory shares:", error);
      res.status(500).json({ message: "Failed to get memory shares" });
    }
  });

  // Get memory shares for a specific memory
  app.get("/api/memory-shares", async (req, res) => {
    try {
      const { memoryId } = req.query;
      if (!memoryId) {
        return res.status(400).json({ message: "Memory ID required" });
      }
      
      const shares = await storage.getMemorySharesByMemoryId(memoryId as string);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching memory shares for memory:", error);
      res.status(500).json({ message: "Failed to get memory shares" });
    }
  });

  // Deactivate memory share
  app.delete("/api/memory-shares/:shareId", async (req, res) => {
    try {
      await storage.deactivateMemoryShare(req.params.shareId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating memory share:", error);
      res.status(500).json({ message: "Failed to deactivate memory share" });
    }
  });

  // Access shared memory with passcode
  app.post("/api/shared-memory/access", async (req, res) => {
    try {
      const { accessPasscode, viewerInfo } = req.body;
      
      if (!accessPasscode || !PrivacyService.isValidPasscode(accessPasscode)) {
        return res.status(400).json({ message: "Invalid passcode format" });
      }

      // Find the memory share
      const share = await storage.getMemoryShareByPasscode(accessPasscode);
      if (!share) {
        return res.status(404).json({ message: "Memory not found or passcode invalid" });
      }

      // Validate the share is still active
      if (!PrivacyService.isShareValid(share)) {
        return res.status(403).json({ message: "Share link has expired or reached view limit" });
      }

      // Get the memory
      const memory = await storage.getMemory(share.memoryId);
      if (!memory) {
        return res.status(404).json({ message: "Memory not found" });
      }

      // Log the access
      const accessLog = await storage.logMemoryAccess({
        memoryShareId: share.id,
        viewerIpAddress: viewerInfo?.ipAddress || 'unknown',
        viewerUserAgent: viewerInfo?.userAgent || 'unknown',
      });

      // Increment view count
      await storage.incrementShareViews(share.id);

      // Return sanitized memory data
      const sanitizedMemory = PrivacyService.sanitizeMemoryForSharing(memory);
      
      res.json({
        memory: sanitizedMemory,
        shareInfo: {
          sharedBy: share.sharedByUserId,
          recipientEmail: share.recipientEmail,
          createdAt: share.createdAt,
          viewCount: share.currentViews + 1,
          maxViews: share.allowedViews,
        }
      });
    } catch (error) {
      console.error("Error accessing shared memory:", error);
      res.status(500).json({ message: "Failed to access shared memory" });
    }
  });

  // Get access logs for a memory share (for share creator)
  app.get("/api/memory-shares/:shareId/logs", async (req, res) => {
    try {
      const logs = await storage.getMemoryAccessLogs(req.params.shareId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching access logs:", error);
      res.status(500).json({ message: "Failed to get access logs" });
    }
  });

  // ============================================
  // LIFE EVENTS ROUTES
  // ============================================

  // Get life events for a user
  app.get('/api/life-events/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const events = await storage.getLifeEvents(userId);
      res.json(events);
    } catch (error) {
      console.error('Error fetching life events:', error);
      res.status(500).json({ error: 'Failed to fetch life events' });
    }
  });

  // Create a new life event
  app.post('/api/life-events', async (req, res) => {
    try {
      const eventData = insertLifeEventSchema.parse(req.body);
      const event = await storage.createLifeEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid event data', details: error });
      } else {
        console.error('Error creating life event:', error);
        res.status(500).json({ error: 'Failed to create life event' });
      }
    }
  });

  // Update a life event
  app.put('/api/life-events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      await storage.updateLifeEvent(id, updates);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating life event:', error);
      res.status(500).json({ error: 'Failed to update life event' });
    }
  });

  // Delete a life event
  app.delete('/api/life-events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLifeEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting life event:', error);
      res.status(500).json({ error: 'Failed to delete life event' });
    }
  });

  // ============================================
  // FAMILY RELATIONSHIPS ROUTES
  // ============================================

  // Get family relationships for a user
  app.get('/api/family-relationships/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const relationships = await storage.getFamilyRelationshipsByUser?.(userId) || [];
      res.json(relationships);
    } catch (error) {
      console.error('Error fetching family relationships:', error);
      res.status(500).json({ error: 'Failed to fetch family relationships' });
    }
  });

  // Create a new family relationship
  app.post('/api/family-relationships', async (req, res) => {
    try {
      const relationship = await storage.createFamilyRelationship?.(req.body);
      res.status(201).json(relationship);
    } catch (error) {
      console.error('Error creating family relationship:', error);
      res.status(500).json({ error: 'Failed to create family relationship' });
    }
  });

  // Delete a family relationship
  app.delete('/api/family-relationships/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFamilyRelationship?.(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting family relationship:', error);
      res.status(500).json({ error: 'Failed to delete family relationship' });
    }
  });

  // ============================================
  // FAMILY RELATIONSHIPS ROUTES
  // ============================================
  app.get('/api/family-relationships/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const relationships = await storage.getFamilyRelationshipsByUser?.(userId) || [];
      res.json(relationships);
    } catch (error) {
      console.error('Error fetching family relationships:', error);
      res.status(500).json({ error: 'Failed to fetch family relationships' });
    }
  });

  app.post('/api/family-relationships', async (req, res) => {
    try {
      const relationship = await storage.createFamilyRelationship?.(req.body);
      res.status(201).json(relationship);
    } catch (error) {
      console.error('Error creating family relationship:', error);
      res.status(500).json({ error: 'Failed to create family relationship' });
    }
  });

  app.delete('/api/family-relationships/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFamilyRelationship?.(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting family relationship:', error);
      res.status(500).json({ error: 'Failed to delete family relationship' });
    }
  });

  // Memory Attachments endpoints
  app.get('/api/memory-attachments/:memoryId', async (req, res) => {
    try {
      const { memoryId } = req.params;
      const attachments = await storage.getMemoryAttachmentsByMemory?.(memoryId) || [];
      res.json(attachments);
    } catch (error) {
      console.error('Error fetching memory attachments:', error);
      res.status(500).json({ error: 'Failed to fetch memory attachments' });
    }
  });

  app.post('/api/memory-attachments', async (req, res) => {
    try {
      const attachment = await storage.createMemoryAttachment?.(req.body);
      res.status(201).json(attachment);
    } catch (error) {
      console.error('Error creating memory attachment:', error);
      res.status(500).json({ error: 'Failed to create memory attachment' });
    }
  });

  // Personality Insights endpoints
  app.get('/api/personality-insights/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const insights = await storage.getPersonalityInsightsByUser?.(userId) || [];
      res.json(insights);
    } catch (error) {
      console.error('Error fetching personality insights:', error);
      res.status(500).json({ error: 'Failed to fetch personality insights' });
    }
  });

  app.post('/api/personality-insights', async (req, res) => {
    try {
      const insight = await storage.createPersonalityInsight?.(req.body);
      res.status(201).json(insight);
    } catch (error) {
      console.error('Error creating personality insight:', error);
      res.status(500).json({ error: 'Failed to create personality insight' });
    }
  });

  // Enhanced question suggestions endpoint
  app.get('/api/question-suggestions/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { categoryId } = req.query;
      
      // Fetch all user context for intelligent question generation
      const memories = await storage.getMemories(userId);
      const lifeEvents = await storage.getLifeEvents(userId);
      const familyRelationships = await storage.getFamilyRelationshipsByUser?.(userId) || [];
      
      const questions = await generateQuestionSuggestions(
        userId,
        categoryId as string,
        memories,
        lifeEvents,
        familyRelationships
      );
      
      res.json({ questions });
    } catch (error) {
      console.error('Error generating question suggestions:', error);
      res.status(500).json({ error: 'Failed to generate question suggestions' });
    }
  });

  // Religious profile routes
  app.get('/api/religious-profiles/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getReligiousProfile?.(userId);
      res.json(profile);
    } catch (error) {
      console.error('Error fetching religious profile:', error);
      res.status(500).json({ error: 'Failed to fetch religious profile' });
    }
  });

  app.post('/api/religious-profiles', async (req, res) => {
    try {
      const profile = await storage.createReligiousProfile?.(req.body);
      res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating religious profile:', error);
      res.status(500).json({ error: 'Failed to create religious profile' });
    }
  });

  // Religious memories routes
  app.get('/api/religious-memories/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const memories = await storage.getReligiousMemories?.(userId) || [];
      res.json(memories);
    } catch (error) {
      console.error('Error fetching religious memories:', error);
      res.status(500).json({ error: 'Failed to fetch religious memories' });
    }
  });

  app.post('/api/religious-memories', async (req, res) => {
    try {
      const memory = await storage.createReligiousMemory?.(req.body);
      res.status(201).json(memory);
    } catch (error) {
      console.error('Error creating religious memory:', error);
      res.status(500).json({ error: 'Failed to create religious memory' });
    }
  });

  // Religious question suggestions
  app.get('/api/religious-questions/:userId/:religion', async (req, res) => {
    try {
      const { userId, religion } = req.params;
      const { denomination } = req.query;
      
      const profile = await storage.getReligiousProfile?.(userId);
      const memories = await storage.getReligiousMemories?.(userId) || [];
      const lifeEvents = await storage.getLifeEvents(userId);
      
      const questions = await generateReligiousQuestions(
        userId,
        religion,
        denomination as string,
        memories,
        lifeEvents
      );
      
      res.json({ questions });
    } catch (error) {
      console.error('Error generating religious questions:', error);
      res.status(500).json({ error: 'Failed to generate religious questions' });
    }
  });

  // Religious milestones routes
  app.get('/api/religious-milestones/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const milestones = await storage.getReligiousMilestones?.(userId) || [];
      res.json(milestones);
    } catch (error) {
      console.error('Error fetching religious milestones:', error);
      res.status(500).json({ error: 'Failed to fetch religious milestones' });
    }
  });

  app.post('/api/religious-milestones', async (req, res) => {
    try {
      const milestone = await storage.createReligiousMilestone?.(req.body);
      res.status(201).json(milestone);
    } catch (error) {
      console.error('Error creating religious milestone:', error);
      res.status(500).json({ error: 'Failed to create religious milestone' });
    }
  });

  // Life Event Messages routes
  app.get('/api/life-event-messages/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getLifeEventMessages?.(userId) || [];
      res.json(messages);
    } catch (error) {
      console.error('Error fetching life event messages:', error);
      res.status(500).json({ error: 'Failed to fetch life event messages' });
    }
  });

  app.post('/api/life-event-messages', async (req, res) => {
    try {
      const message = await storage.createLifeEventMessage?.(req.body);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating life event message:', error);
      res.status(500).json({ error: 'Failed to create life event message' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
