/**
 * Notification Store — Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppNotification, NotificationType } from '../types/notification';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getByType: (type: NotificationType) => AppNotification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => set((state) => {
        const updated = [notification, ...state.notifications].slice(0, 100);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length,
        };
      }),

      markAsRead: (id) => set((state) => {
        const updated = state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length,
        };
      }),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      })),

      removeNotification: (id) => set((state) => {
        const updated = state.notifications.filter(n => n.id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length,
        };
      }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),

      getByType: (type) => get().notifications.filter(n => n.type === type),
    }),
    {
      name: 'drivelegal-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
