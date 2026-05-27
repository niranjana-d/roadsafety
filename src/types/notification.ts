/**
 * Notification types
 */

export type NotificationType = 'law_change' | 'challan_reminder' | 'safety_tip' | 'app_update';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  timestamp: number;
  actionUrl?: string; // deep link
}
