/**
 * Chat Store — Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage, ChatSession } from '../types/chat';

interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isTyping: boolean;
  offlineQueue: ChatMessage[];

  startNewSession: (locationContext: ChatSession['locationContext'], language: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessageFeedback: (messageId: string, feedback: 'up' | 'down') => void;
  setTyping: (typing: boolean) => void;
  queueOfflineMessage: (message: ChatMessage) => void;
  dequeueOfflineMessages: () => ChatMessage[];
  clearCurrentSession: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      isTyping: false,
      offlineQueue: [],

      startNewSession: (locationContext, language) => {
        const session: ChatSession = {
          id: `session-${Date.now()}`,
          messages: [],
          locationContext,
          language,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          currentSession: session,
          sessions: [session, ...state.sessions].slice(0, 50), // keep last 50 sessions
        }));
      },

      addMessage: (message) => set((state) => {
        if (!state.currentSession) return state;
        const updatedSession = {
          ...state.currentSession,
          messages: [...state.currentSession.messages, message],
          updatedAt: Date.now(),
        };
        return {
          currentSession: updatedSession,
          sessions: state.sessions.map(s =>
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      }),

      updateMessageFeedback: (messageId, feedback) => set((state) => {
        if (!state.currentSession) return state;
        const updatedSession = {
          ...state.currentSession,
          messages: state.currentSession.messages.map(m =>
            m.id === messageId ? { ...m, feedback } : m
          ),
        };
        return {
          currentSession: updatedSession,
          sessions: state.sessions.map(s =>
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      }),

      setTyping: (typing) => set({ isTyping: typing }),

      queueOfflineMessage: (message) => set((state) => ({
        offlineQueue: [...state.offlineQueue, { ...message, isOfflineQueued: true }],
      })),

      dequeueOfflineMessages: () => {
        const queue = get().offlineQueue;
        set({ offlineQueue: [] });
        return queue;
      },

      clearCurrentSession: () => set({ currentSession: null }),
    }),
    {
      name: 'drivelegal-chat',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 10), // only persist last 10 sessions
        offlineQueue: state.offlineQueue,
      }),
    }
  )
);
