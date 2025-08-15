import { IStorage } from "../storage";

export class NotificationService {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  async createDailyReminder(userId: string): Promise<void> {
    const now = new Date();
    
    // Check if user already has a notification today
    const existingNotifications = await this.storage.getNotifications(userId);
    const today = now.toDateString();
    const hasReminderToday = existingNotifications.some(
      notif => notif.type === "daily_reminder" && 
      new Date(notif.createdAt || notif.scheduledFor).toDateString() === today
    );

    if (!hasReminderToday) {
      await this.storage.createNotification({
        userId,
        type: "daily_reminder",
        title: "Time to add a memory!",
        message: "Share a moment from your day to help preserve your stories.",
        isRead: 0,
        scheduledFor: now,
      });
    }
  }

  async createMemoryMilestoneNotification(userId: string, memoryCount: number): Promise<void> {
    const milestones = [5, 10, 25, 50, 100];
    
    if (milestones.includes(memoryCount)) {
      await this.storage.createNotification({
        userId,
        type: "memory_milestone",
        title: `${memoryCount} Memories Recorded! 🎉`,
        message: `You've successfully recorded ${memoryCount} memories. Your story is growing richer every day!`,
        isRead: 0,
        scheduledFor: new Date(),
      });
    }
  }

  async createFamilyRequestNotification(userId: string, familyMemberName: string): Promise<void> {
    await this.storage.createNotification({
      userId,
      type: "family_request",
      title: "New Family Access Request",
      message: `${familyMemberName} has requested access to your memories.`,
      isRead: 0,
      scheduledFor: new Date(),
    });
  }

  // Simulate daily notification service (in production this would be a cron job)
  async processDailyNotifications(): Promise<void> {
    // In a real implementation, this would:
    // 1. Get all users with dailyReminderEnabled = 1
    // 2. Check their reminder time preferences
    // 3. Send notifications at appropriate times
    // 4. Use a proper job scheduler like cron or a message queue

    console.log("Daily notification processing would run here");
  }
}