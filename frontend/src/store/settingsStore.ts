/**
 * Settings Store — Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserSettings } from '../types/user';

interface SettingsState {
  settings: UserSettings;
  hasCompletedOnboarding: boolean;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setTheme: (theme: UserSettings['theme']) => void;
  setLanguage: (language: string) => void;
  setFontSize: (fontSize: UserSettings['fontSize']) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  updateNotifications: (notifications: Partial<UserSettings['notifications']>) => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  country: 'IN',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  notifications: {
    lawChanges: true,
    safetyTips: true,
    challanReminders: true,
    appUpdates: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      hasCompletedOnboarding: false,

      updateSettings: (partial) => set((state) => ({
        settings: { ...state.settings, ...partial },
      })),

      setTheme: (theme) => set((state) => ({
        settings: { ...state.settings, theme },
      })),

      setLanguage: (language) => set((state) => ({
        settings: { ...state.settings, language },
      })),

      setFontSize: (fontSize) => set((state) => ({
        settings: { ...state.settings, fontSize },
      })),

      toggleHighContrast: () => set((state) => ({
        settings: { ...state.settings, highContrast: !state.settings.highContrast },
      })),

      toggleReducedMotion: () => set((state) => ({
        settings: { ...state.settings, reducedMotion: !state.settings.reducedMotion },
      })),

      updateNotifications: (notifications) => set((state) => ({
        settings: {
          ...state.settings,
          notifications: { ...state.settings.notifications, ...notifications },
        },
      })),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'drivelegal-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
