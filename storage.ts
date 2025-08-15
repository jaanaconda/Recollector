import { 
  type User, 
  type InsertUser,
  type MemoryCategory,
  type InsertMemoryCategory,
  type Memory,
  type InsertMemory,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type FamilyMember,
  type InsertFamilyMember,
  type Notification,
  type InsertNotification,
  type UserPreferences,
  type InsertUserPreferences,
  type MemoryShare,
  type InsertMemoryShare,
  type MemoryAccessLog,
  type InsertMemoryAccessLog,
  type LifeEvent,
  type InsertLifeEvent,
  type FamilyRelationship,
  type InsertFamilyRelationship,
  type PersonalityInsight,
  type InsertPersonalityInsight,
  type MemoryAttachment,
  type InsertMemoryAttachment,
  type ReligiousProfile,
  type InsertReligiousProfile,
  type ReligiousMemory,
  type InsertReligiousMemory,
  type ReligiousMilestone,
  type InsertReligiousMilestone,
  type LifeEventMessage,
  type InsertLifeEventMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Memory Categories
  getMemoryCategories(): Promise<MemoryCategory[]>;
  getMemoryCategory(id: string): Promise<MemoryCategory | undefined>;
  createMemoryCategory(category: InsertMemoryCategory): Promise<MemoryCategory>;
  updateMemoryCategoryProgress(id: string, progress: number): Promise<void>;

  // Memories
  getMemories(userId: string): Promise<Memory[]>;
  getMemoriesByCategory(userId: string, categoryId: string): Promise<Memory[]>;
  getMemory(id: string): Promise<Memory | undefined>;
  createMemory(memory: InsertMemory): Promise<Memory>;

  // Conversations
  getConversations(userId: string): Promise<(Conversation & { messageCount: number; lastMessage: string; duration: string })[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Family Members
  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  getFamilyMember(id: string): Promise<FamilyMember | undefined>;
  createFamilyMember(familyMember: InsertFamilyMember): Promise<FamilyMember>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;

  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void>;

  // Privacy & Sharing
  createMemoryShare(share: InsertMemoryShare): Promise<MemoryShare>;
  getMemoryShareByPasscode(passcode: string): Promise<MemoryShare | undefined>;
  getMemoryShares(userId: string): Promise<MemoryShare[]>;
  getMemorySharesByMemoryId(memoryId: string): Promise<MemoryShare[]>;
  deactivateMemoryShare(shareId: string): Promise<void>;
  logMemoryAccess(log: InsertMemoryAccessLog): Promise<MemoryAccessLog>;
  getMemoryAccessLogs(memoryShareId: string): Promise<MemoryAccessLog[]>;
  incrementShareViews(shareId: string): Promise<void>;

  // Life Events - Major life milestones for enhanced personality modeling
  getLifeEvents(userId: string): Promise<LifeEvent[]>;
  getLifeEvent(id: string): Promise<LifeEvent | undefined>;
  createLifeEvent(lifeEvent: InsertLifeEvent): Promise<LifeEvent>;
  updateLifeEvent(id: string, updates: Partial<LifeEvent>): Promise<void>;
  deleteLifeEvent(id: string): Promise<void>;

  // Religious Features
  getReligiousProfile?(userId: string): Promise<ReligiousProfile | undefined>;
  createReligiousProfile?(profile: InsertReligiousProfile): Promise<ReligiousProfile>;
  getReligiousMemories?(userId: string): Promise<ReligiousMemory[]>;
  createReligiousMemory?(memory: InsertReligiousMemory): Promise<ReligiousMemory>;
  getReligiousMilestones?(userId: string): Promise<ReligiousMilestone[]>;
  createReligiousMilestone?(milestone: InsertReligiousMilestone): Promise<ReligiousMilestone>;

  // Life Event Messages
  getLifeEventMessages?(userId: string): Promise<LifeEventMessage[]>;
  createLifeEventMessage?(message: InsertLifeEventMessage): Promise<LifeEventMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private memoryCategories: Map<string, MemoryCategory>;
  private memories: Map<string, Memory>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private familyMembers: Map<string, FamilyMember>;
  private notifications: Map<string, Notification>;
  private userPreferences: Map<string, UserPreferences>;
  private memoryShares: Map<string, MemoryShare>;
  private memoryAccessLogs: Map<string, MemoryAccessLog>;
  private lifeEvents: Map<string, LifeEvent>;
  private religiousProfiles: Map<string, ReligiousProfile>;
  private religiousMemories: Map<string, ReligiousMemory>;
  private religiousMilestones: Map<string, ReligiousMilestone>;
  private lifeEventMessages: Map<string, LifeEventMessage>;

  constructor() {
    this.users = new Map();
    this.memoryCategories = new Map();
    this.memories = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.familyMembers = new Map();
    this.notifications = new Map();
    this.userPreferences = new Map();
    this.memoryShares = new Map();
    this.memoryAccessLogs = new Map();
    this.lifeEvents = new Map();
    this.religiousProfiles = new Map();
    this.religiousMemories = new Map();
    this.religiousMilestones = new Map();
    this.lifeEventMessages = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: "user-1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Add sample memories that capture Sarah's personality for digital legacy
    const sampleMemories: Memory[] = [
      {
        id: "mem-1",
        userId: "user-1",
        categoryId: "cat-1",
        question: "What's your most cherished childhood memory?",
        response: "Oh, that would have to be baking cookies with my grandmother every Saturday morning. She'd let me stand on a wooden stool at her kitchen counter, and I'd always make such a mess with the flour! But she never minded. She'd just laugh and say 'Sarah, honey, the best recipes come from love, not perfection.' I can still smell those chocolate chip cookies and hear her humming old hymns while we worked. She taught me that taking time for the people you love is the most important ingredient in any recipe.",
        createdAt: new Date("2024-01-15"),
        emotional_context: "warmth, nostalgia, love"
      },
      {
        id: "mem-2", 
        userId: "user-1",
        categoryId: "cat-2",
        question: "How do you approach giving advice to friends?",
        response: "I've learned that people rarely need you to solve their problems - they usually just need someone to truly listen. When a friend comes to me, I try to ask gentle questions that help them think through things themselves. I might say something like 'That sounds really tough. What feels like the most important thing to you right now?' I believe everyone has wisdom inside them; sometimes they just need a caring ear to help them find it. And I always end with 'You know I'm here for whatever you need.'",
        createdAt: new Date("2024-01-20"),
        emotional_context: "empathy, wisdom, supportive"
      },
      {
        id: "mem-3",
        userId: "user-1", 
        categoryId: "cat-3",
        question: "What's your philosophy on handling difficult times?",
        response: "Life has taught me that storms don't last, but strong trees do. When things get really hard, I remind myself that this too shall pass - not because I'm being dismissive, but because I've weathered storms before and come out stronger. I find comfort in small rituals: making a cup of tea, calling someone I love, taking a walk outside. I always tell myself 'Just take the next right step, Sarah. You don't have to see the whole staircase.' And I try to remember that sometimes the most courageous thing you can do is simply keep going, one day at a time.",
        createdAt: new Date("2024-01-25"), 
        emotional_context: "resilience, hope, practical wisdom"
      },
      {
        id: "mem-4",
        userId: "user-1",
        categoryId: "cat-4", 
        question: "What's the most important lesson you want to pass on?",
        response: "If I could teach just one thing, it would be this: be kinder than necessary, because everyone is fighting battles you know nothing about. I've seen how a simple smile, a genuine 'how are you doing?', or just holding the door can change someone's entire day. We're all just walking each other home in this life, you know? And love - real love - isn't just a feeling. It's a choice you make every single day to show up for the people who matter. Choose love, even when it's hard. Especially when it's hard.",
        createdAt: new Date("2024-02-01"),
        emotional_context: "wisdom, compassion, love"
      }
    ];
    sampleMemories.forEach(memory => this.memories.set(memory.id, memory));

    // Add sample life events for Sarah to demonstrate major milestones
    const sampleLifeEvents: LifeEvent[] = [
      {
        id: "life-1",
        userId: "user-1",
        title: "Marriage to David",
        eventType: "marriage",
        eventDate: new Date("2018-06-15"),
        description: "Married David Patterson in a small ceremony at the local community center with close family and friends.",
        emotionalImpact: "It was such a joyful day! I felt so grateful to have found my best friend and partner. David makes me laugh every single day, and I knew from our first dance that we were meant to be together. There were happy tears from everyone, especially when we exchanged vows we wrote ourselves.",
        lessonsLearned: "Love isn't just about the big romantic gestures - it's about choosing each other every day, through the small moments and the challenging ones too.",
        peopleInvolved: ["David Patterson", "Margaret Johnson", "Sarah's sister Lisa", "David's parents"],
        significantDecisions: "We decided to have a simple, meaningful ceremony focused on family rather than a big expensive wedding. We used the money we saved for our first home down payment instead.",
        personalGrowth: "Marriage taught me how to truly share my life with someone else, to be vulnerable, and to support each other's dreams while building our own together.",
        createdAt: new Date("2024-01-10")
      },
      {
        id: "life-2", 
        userId: "user-1",
        title: "Birth of Emma",
        eventType: "birth",
        eventDate: new Date("2020-03-22"),
        description: "Emma Patricia Patterson was born on a beautiful spring morning. She weighed 7 pounds, 2 ounces.",
        emotionalImpact: "The moment I held Emma, I understood love in a completely new way. It was overwhelming - this fierce protective love mixed with such tenderness. I cried happy tears for days! David was so gentle with her from the very first moment.",
        lessonsLearned: "Being a parent means your heart lives outside your body. Every day teaches you something new about patience, wonder, and what really matters in life.",
        peopleInvolved: ["David Patterson", "Emma Patterson", "Margaret Johnson", "Hospital staff"],
        significantDecisions: "We chose the name Emma because it means 'whole' or 'universal' - we wanted her to know she was complete just as she is. Patricia is after my grandmother who taught me so much about love.",
        personalGrowth: "Motherhood showed me strengths I didn't know I had. It also taught me to ask for help and accept that some days just getting through with everyone fed and loved is enough.",
        createdAt: new Date("2024-01-12")
      },
      {
        id: "life-3",
        userId: "user-1", 
        title: "Divorce from David",
        eventType: "divorce",
        eventDate: new Date("2023-09-10"),
        description: "After 5 years of marriage, David and I made the difficult decision to divorce. We remained committed to co-parenting Emma with love and respect.",
        emotionalImpact: "It was heartbreaking, honestly. Even when you know it's the right decision, it feels like a failure at first. I grieved not just our marriage, but the future we had planned together. But I also felt relief - we had grown into different people who wanted different things.",
        lessonsLearned: "Sometimes love isn't enough if you're not growing in the same direction. It's possible to love someone deeply and still recognize that you're not right for each other long-term. Choosing peace for Emma was more important than trying to force something that wasn't working.",
        peopleInvolved: ["David Patterson", "Emma Patterson", "Margaret Johnson", "Family counselor", "Divorce mediator"],
        significantDecisions: "We went through mediation instead of a bitter court battle. We agreed to joint custody and put Emma's needs first in every decision. We kept the family home so Emma could stay in her familiar space.",
        personalGrowth: "The divorce taught me that I'm stronger than I thought and that endings can be graceful. I learned to trust my instincts and that it's okay to change course when something isn't working, even if it's hard.",
        createdAt: new Date("2024-01-18")
      },
      {
        id: "life-4",
        userId: "user-1",
        title: "Starting New Career in Social Work", 
        eventType: "career_change",
        eventDate: new Date("2024-01-15"),
        description: "After the divorce, I decided to pursue my master's in social work and start a career helping families in transition.",
        emotionalImpact: "I felt scared but excited! Going back to school at 35 with a young daughter felt daunting, but I knew I wanted to help other families navigate difficult times like I had. It gave me purpose and hope for the future.",
        lessonsLearned: "It's never too late to pursue something that calls to your heart. My own experiences with family challenges actually became my strength in helping others.",
        peopleInvolved: ["Emma Patterson", "Margaret Johnson", "University professors", "Fellow students", "First clients"],
        significantDecisions: "I chose a program that offered evening and weekend classes so I could still be present for Emma. I also decided to specialize in family therapy and divorce mediation.",
        personalGrowth: "This career change taught me that my difficult experiences weren't just something to get through - they were preparing me to help others. I found my calling in turning pain into purpose.",
        createdAt: new Date("2024-02-05")
      }
    ];
    sampleLifeEvents.forEach(event => this.lifeEvents.set(event.id, event));

    // Add sample religious profile and milestones for Sarah
    const sampleReligiousProfile: ReligiousProfile = {
      id: "religious-profile-1",
      userId: "user-1", 
      religion: "christianity",
      denomination: "Protestant",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };
    this.religiousProfiles.set(sampleReligiousProfile.id, sampleReligiousProfile);

    // Add sample religious milestones for Sarah's spiritual journey
    const sampleMilestones: ReligiousMilestone[] = [
      {
        id: "milestone-1",
        userId: "user-1",
        religiousProfileId: "religious-profile-1",
        title: "Baptism",
        description: "My baptism at age 8 was the first time I truly understood what it meant to follow Jesus",
        milestoneDate: new Date("1995-06-15"),
        ageAtMilestone: 8,
        location: "First Baptist Church, hometown",
        spiritualSignificance: "This was my public declaration of faith and commitment to following Jesus. I remember feeling so peaceful and loved by God as I went under the water.",
        emotionalImpact: "I felt nervous but excited. When I came up from the water, I felt like a new person - clean and loved.",
        peopleInvolved: "Pastor Williams, my parents, grandparents, and the whole church congregation cheered for me",
        memorableDetails: "I wore a white dress that my grandmother had sewn for me. The water was warmer than I expected, and Pastor Williams had the gentlest hands when he baptized me.",
        scripture: "Romans 6:4 - We were therefore buried with him through baptism into death",
        milestoneType: "sacrament",
        isPrivate: false,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "milestone-2", 
        userId: "user-1",
        religiousProfileId: "religious-profile-1",
        title: "First Communion",
        description: "Taking communion for the first time after my baptism felt like truly joining the family of believers",
        milestoneDate: new Date("1995-07-02"),
        ageAtMilestone: 8,
        location: "First Baptist Church",
        spiritualSignificance: "Understanding that Jesus died for me personally, not just for the world in general. The bread and grape juice weren't just symbols anymore - they represented real sacrifice.",
        emotionalImpact: "Reverent and grateful. I felt the weight of what Jesus did for me.",
        peopleInvolved: "The church congregation, my parents who explained the meaning to me",
        memorableDetails: "I was so careful not to spill the grape juice. My hands were shaking because I wanted to do everything just right to honor Jesus.",
        scripture: "1 Corinthians 11:24 - This is my body which is broken for you",
        milestoneType: "sacrament",
        isPrivate: false,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "milestone-3",
        userId: "user-1", 
        religiousProfileId: "religious-profile-1",
        title: "Youth Group Leadership",
        description: "Becoming a youth leader at 16 taught me how to serve others and share my faith",
        milestoneDate: new Date("2003-09-01"),
        ageAtMilestone: 16,
        location: "First Baptist Church Youth Building",
        spiritualSignificance: "This was when I learned that faith isn't just personal - it's meant to be shared. Helping younger kids understand God's love deepened my own faith.",
        emotionalImpact: "Nervous at first, but grew in confidence. Felt trusted and valued by my church family.",
        peopleInvolved: "Youth Pastor Mike, other teen leaders, and the middle school kids I mentored",
        memorableDetails: "Planning games, leading small group discussions, and seeing younger kids have their own 'aha' moments about God's love. I still remember Jenny's face when she understood grace for the first time.",
        scripture: "Matthew 18:3 - Unless you become like little children, you will never enter the kingdom of heaven",
        milestoneType: "ceremony",
        isPrivate: false,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "milestone-4",
        userId: "user-1",
        religiousProfileId: "religious-profile-1", 
        title: "Mission Trip to Mexico",
        description: "My first mission trip opened my eyes to how God works around the world",
        milestoneDate: new Date("2004-07-15"),
        ageAtMilestone: 17,
        location: "Tijuana, Mexico",
        spiritualSignificance: "Saw poverty and joy coexisting in ways I'd never imagined. Learned that God's love transcends language and culture barriers.",
        emotionalImpact: "Humbled and grateful. Came home with a heart for missions and a broader view of God's kingdom.",
        peopleInvolved: "Youth Pastor Mike, 15 other teenagers, local Mexican church members, Pastor Rodriguez",
        memorableDetails: "Building homes with families who had almost nothing but were so generous with their smiles and food. Playing with children who had no toys but limitless joy. Worshipping in Spanish and understanding God's love without words.",
        scripture: "Matthew 28:19 - Go and make disciples of all nations",
        milestoneType: "pilgrimage",
        isPrivate: false,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      }
    ];

    sampleMilestones.forEach(milestone => {
      this.religiousMilestones.set(milestone.id, milestone);
    });

    // Add sample life event messages for Sarah
    const sampleMessages: LifeEventMessage[] = [
      {
        id: "message-1",
        userId: "user-1",
        lifeEventId: "life-2", // pregnancy event
        recipientName: "Emma",
        recipientRelationship: "baby",
        eventType: "pregnancy",
        messageType: "letter",
        title: "A Letter to My Unborn Baby",
        content: "My sweet little one, as I write this, you're growing inside me and I can feel you moving. I want you to know how wanted and loved you already are. Every kick reminds me that you're real, that you're coming to change our lives in the most beautiful way. I dream about holding you, seeing your face, and watching you discover the world. I promise to love you unconditionally, to protect you, and to help you become whoever you're meant to be. You're already my greatest blessing. Love always, Mommy",
        deliveryConditions: "When Emma turns 16",
        isScheduled: false,
        isDelivered: false,
        emotionalTone: "loving",
        privateNotes: "I was so emotional writing this. I kept crying happy tears thinking about meeting her.",
        createdAt: new Date("2020-03-15"),
        updatedAt: new Date("2020-03-15"),
      },
      {
        id: "message-2",
        userId: "user-1",
        lifeEventId: "life-3", // divorce event
        recipientName: "Emma",
        recipientRelationship: "child",
        eventType: "divorce",
        messageType: "letter",
        title: "About Mommy and Daddy's Divorce",
        content: "Sweet Emma, I want you to understand that Mommy and Daddy's divorce had nothing to do with you. You are the best thing that ever happened to both of us, and that will never change. Sometimes grown-ups realize they're better as friends than as married people, and that's okay. We both love you so much, and we'll always be your parents, no matter what. You'll always have two homes full of love, and you never have to choose sides. What happened between Daddy and me doesn't change how much we both adore you.",
        deliveryConditions: "When Emma asks about the divorce",
        isScheduled: false,
        isDelivered: false,
        emotionalTone: "supportive",
        privateNotes: "I hope this helps her understand when she's older. I want her to know it wasn't her fault.",
        createdAt: new Date("2023-10-01"),
        updatedAt: new Date("2023-10-01"),
      }
    ];

    sampleMessages.forEach(message => {
      this.lifeEventMessages.set(message.id, message);
    });

    // Create default memory categories
    const categories: MemoryCategory[] = [
      { id: "cat-1", name: "Childhood", description: "Early life memories", progress: 75 },
      { id: "cat-2", name: "Career", description: "Professional experiences", progress: 50 },
      { id: "cat-3", name: "Relationships", description: "Family and friends", progress: 40 },
      { id: "cat-4", name: "Beliefs", description: "Values and beliefs", progress: 20 },
      { id: "cat-5", name: "Family", description: "Family memories", progress: 60 },
      { id: "cat-6", name: "Life Lessons", description: "Wisdom and insights", progress: 30 },
    ];
    categories.forEach(cat => this.memoryCategories.set(cat.id, cat));

    // Create sample family members
    const familyMembers: FamilyMember[] = [
      {
        id: "fam-1",
        userId: "user-1",
        name: "Margaret Johnson",
        email: "margaret@example.com",
        relationship: "Mother",
        accessLevel: "full",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        createdAt: new Date(),
      },
      {
        id: "fam-2",
        userId: "user-1",
        name: "David Patterson",
        email: "david@example.com",
        relationship: "Husband",
        accessLevel: "full",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        createdAt: new Date(),
      },
      {
        id: "fam-3",
        userId: "user-1",
        name: "Emma Patterson",
        email: "emma@example.com",
        relationship: "Daughter",
        accessLevel: "limited",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b829?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        createdAt: new Date(),
      },
    ];
    familyMembers.forEach(member => this.familyMembers.set(member.id, member));

    // Create default user preferences
    const defaultPreferences: UserPreferences = {
      id: "pref-1",
      userId: "user-1",
      dailyReminderEnabled: 1,
      dailyReminderTime: "19:00",
      weeklyGoal: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userPreferences.set(defaultPreferences.id, defaultPreferences);

    // Create sample notification
    const sampleNotification: Notification = {
      id: "notif-1",
      userId: "user-1",
      type: "daily_reminder",
      title: "Time to add a memory!",
      message: "Share a moment from your day to help preserve your stories.",
      isRead: 0,
      scheduledFor: new Date(),
      createdAt: new Date(),
    };
    this.notifications.set(sampleNotification.id, sampleNotification);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getMemoryCategories(): Promise<MemoryCategory[]> {
    return Array.from(this.memoryCategories.values());
  }

  async getMemoryCategory(id: string): Promise<MemoryCategory | undefined> {
    return this.memoryCategories.get(id);
  }

  async createMemoryCategory(insertCategory: InsertMemoryCategory): Promise<MemoryCategory> {
    const id = randomUUID();
    const category: MemoryCategory = { ...insertCategory, id };
    this.memoryCategories.set(id, category);
    return category;
  }

  async updateMemoryCategoryProgress(id: string, progress: number): Promise<void> {
    const category = this.memoryCategories.get(id);
    if (category) {
      category.progress = progress;
      this.memoryCategories.set(id, category);
    }
  }

  async getMemories(userId: string): Promise<Memory[]> {
    return Array.from(this.memories.values()).filter(memory => memory.userId === userId);
  }

  async getMemoriesByCategory(userId: string, categoryId: string): Promise<Memory[]> {
    return Array.from(this.memories.values()).filter(
      memory => memory.userId === userId && memory.categoryId === categoryId
    );
  }

  async getMemory(id: string): Promise<Memory | undefined> {
    return this.memories.get(id);
  }

  async createMemory(insertMemory: InsertMemory): Promise<Memory> {
    const id = randomUUID();
    const memory: Memory = { ...insertMemory, id, createdAt: new Date() };
    this.memories.set(id, memory);
    return memory;
  }

  async getConversations(userId: string): Promise<(Conversation & { messageCount: number; lastMessage: string; duration: string })[]> {
    const userConversations = Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return userConversations.map(conv => {
      const messages = Array.from(this.messages.values())
        .filter(msg => msg.conversationId === conv.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      const messageCount = messages.length;
      const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : "";
      const duration = `${Math.max(15, messageCount * 2)} min`;

      return {
        ...conv,
        messageCount,
        lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 50) + "..." : lastMessage,
        duration,
      };
    });
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...insertMessage, id, createdAt: new Date() };
    this.messages.set(id, message);

    // Update conversation updatedAt
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
      this.conversations.set(conversation.id, conversation);
    }

    return message;
  }

  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    return Array.from(this.familyMembers.values()).filter(member => member.userId === userId);
  }

  async getFamilyMember(id: string): Promise<FamilyMember | undefined> {
    return this.familyMembers.get(id);
  }

  async createFamilyMember(insertFamilyMember: InsertFamilyMember): Promise<FamilyMember> {
    const id = randomUUID();
    const familyMember: FamilyMember = { ...insertFamilyMember, id, createdAt: new Date() };
    this.familyMembers.set(id, familyMember);
    return familyMember;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { ...insertNotification, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = 1;
      this.notifications.set(id, notification);
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(pref => pref.userId === userId);
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = randomUUID();
    const preferences: UserPreferences = { 
      ...insertPreferences, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userPreferences.set(id, preferences);
    return preferences;
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<void> {
    const existing = await this.getUserPreferences(userId);
    if (existing) {
      const updated = { 
        ...existing, 
        ...updates, 
        updatedAt: new Date() 
      };
      this.userPreferences.set(existing.id, updated);
    }
  }
  // ============================================
  // PRIVACY & SHARING METHODS
  // ============================================

  async createMemoryShare(insertShare: InsertMemoryShare): Promise<MemoryShare> {
    const id = randomUUID();
    const share: MemoryShare = { 
      ...insertShare, 
      id, 
      currentViews: 0,
      isActive: true,
      createdAt: new Date() 
    };
    this.memoryShares.set(id, share);
    return share;
  }

  async getMemoryShareByPasscode(passcode: string): Promise<MemoryShare | undefined> {
    return Array.from(this.memoryShares.values()).find(share => share.accessPasscode === passcode);
  }

  async getMemoryShares(userId: string): Promise<MemoryShare[]> {
    return Array.from(this.memoryShares.values())
      .filter(share => share.sharedByUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMemorySharesByMemoryId(memoryId: string): Promise<MemoryShare[]> {
    return Array.from(this.memoryShares.values())
      .filter(share => share.memoryId === memoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deactivateMemoryShare(shareId: string): Promise<void> {
    const share = this.memoryShares.get(shareId);
    if (share) {
      share.isActive = false;
      this.memoryShares.set(shareId, share);
    }
  }

  async logMemoryAccess(insertLog: InsertMemoryAccessLog): Promise<MemoryAccessLog> {
    const id = randomUUID();
    const log: MemoryAccessLog = { 
      ...insertLog, 
      id, 
      accessedAt: new Date() 
    };
    this.memoryAccessLogs.set(id, log);
    return log;
  }

  async getMemoryAccessLogs(memoryShareId: string): Promise<MemoryAccessLog[]> {
    return Array.from(this.memoryAccessLogs.values())
      .filter(log => log.memoryShareId === memoryShareId)
      .sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime());
  }

  async incrementShareViews(shareId: string): Promise<void> {
    const share = this.memoryShares.get(shareId);
    if (share) {
      share.currentViews = (share.currentViews || 0) + 1;
      this.memoryShares.set(shareId, share);
    }
  }

  // Life Events Methods
  async getLifeEvents(userId: string): Promise<LifeEvent[]> {
    return Array.from(this.lifeEvents.values())
      .filter(event => event.userId === userId)
      .sort((a, b) => (a.eventDate?.getTime() || 0) - (b.eventDate?.getTime() || 0));
  }

  async getLifeEvent(id: string): Promise<LifeEvent | undefined> {
    return this.lifeEvents.get(id);
  }

  async createLifeEvent(lifeEvent: InsertLifeEvent): Promise<LifeEvent> {
    const newEvent: LifeEvent = {
      id: randomUUID(),
      ...lifeEvent,
      createdAt: new Date(),
    };
    this.lifeEvents.set(newEvent.id, newEvent);
    return newEvent;
  }

  async updateLifeEvent(id: string, updates: Partial<LifeEvent>): Promise<void> {
    const event = this.lifeEvents.get(id);
    if (event) {
      Object.assign(event, updates);
    }
  }

  async deleteLifeEvent(id: string): Promise<void> {
    this.lifeEvents.delete(id);
  }

  // Religious Features
  async getReligiousProfile(userId: string): Promise<ReligiousProfile | undefined> {
    return Array.from(this.religiousProfiles.values()).find(profile => profile.userId === userId);
  }

  async createReligiousProfile(profile: InsertReligiousProfile): Promise<ReligiousProfile> {
    const newProfile: ReligiousProfile = {
      ...profile,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.religiousProfiles.set(newProfile.id, newProfile);
    return newProfile;
  }

  async getReligiousMemories(userId: string): Promise<ReligiousMemory[]> {
    return Array.from(this.religiousMemories.values()).filter(memory => memory.userId === userId);
  }

  async createReligiousMemory(memory: InsertReligiousMemory): Promise<ReligiousMemory> {
    const newMemory: ReligiousMemory = {
      ...memory,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.religiousMemories.set(newMemory.id, newMemory);
    return newMemory;
  }

  async getReligiousMilestones(userId: string): Promise<ReligiousMilestone[]> {
    return Array.from(this.religiousMilestones.values()).filter(milestone => milestone.userId === userId);
  }

  async createReligiousMilestone(milestone: InsertReligiousMilestone): Promise<ReligiousMilestone> {
    const newMilestone: ReligiousMilestone = {
      ...milestone,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.religiousMilestones.set(newMilestone.id, newMilestone);
    return newMilestone;
  }

  async getLifeEventMessages(userId: string): Promise<LifeEventMessage[]> {
    return Array.from(this.lifeEventMessages.values()).filter(message => message.userId === userId);
  }

  async createLifeEventMessage(message: InsertLifeEventMessage): Promise<LifeEventMessage> {
    const newMessage: LifeEventMessage = {
      ...message,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lifeEventMessages.set(newMessage.id, newMessage);
    return newMessage;
  }
}

export const storage = new MemStorage();
