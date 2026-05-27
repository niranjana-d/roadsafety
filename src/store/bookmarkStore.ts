/**
 * Bookmark Store — Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BookmarkedItem } from '../types/user';

interface BookmarkState {
  bookmarks: BookmarkedItem[];
  addBookmark: (item: BookmarkedItem) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  getBookmarksByType: (type: BookmarkedItem['type']) => BookmarkedItem[];
  clearAll: () => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (item) => set((state) => ({
        bookmarks: [item, ...state.bookmarks.filter(b => b.id !== item.id)],
      })),

      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => b.id !== id),
      })),

      isBookmarked: (id) => get().bookmarks.some(b => b.id === id),

      getBookmarksByType: (type) => get().bookmarks.filter(b => b.type === type),

      clearAll: () => set({ bookmarks: [] }),
    }),
    {
      name: 'drivelegal-bookmarks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
