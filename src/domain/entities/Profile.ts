/**
 * User profile. Auto-created on signup via database trigger.
 */
export interface Profile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly notificationPreferences: NotificationPreferences;
  readonly activeSessionId: string | null;
  readonly createdAt: Date;
}

export interface NotificationPreferences {
  readonly emailNotifications: boolean;
  readonly pushNotifications: boolean;
  readonly dailyReminder: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  dailyReminder: false,
};
