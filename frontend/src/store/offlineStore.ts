/**
 * Offline Store — Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflinePack {
  stateCode: string;
  stateName: string;
  version: string;
  downloadedAt: number;
  sizeBytes: number;
  isDownloading: boolean;
  progress: number; // 0–100
}

interface OfflineState {
  isOnline: boolean;
  lastSyncAt: number | null;
  isSyncing: boolean;
  syncProgress: number;
  downloadedPacks: OfflinePack[];
  pendingQueueCount: number;

  setOnlineStatus: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setSyncProgress: (progress: number) => void;
  setLastSyncAt: (timestamp: number) => void;
  addDownloadedPack: (pack: OfflinePack) => void;
  removeDownloadedPack: (stateCode: string) => void;
  updatePackProgress: (stateCode: string, progress: number) => void;
  setPendingQueueCount: (count: number) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: true,
      lastSyncAt: null,
      isSyncing: false,
      syncProgress: 0,
      downloadedPacks: [],
      pendingQueueCount: 0,

      setOnlineStatus: (online) => set({ isOnline: online }),

      setSyncing: (syncing) => set({ isSyncing: syncing }),

      setSyncProgress: (progress) => set({ syncProgress: progress }),

      setLastSyncAt: (timestamp) => set({ lastSyncAt: timestamp }),

      addDownloadedPack: (pack) => set((state) => ({
        downloadedPacks: [
          ...state.downloadedPacks.filter(p => p.stateCode !== pack.stateCode),
          pack,
        ],
      })),

      removeDownloadedPack: (stateCode) => set((state) => ({
        downloadedPacks: state.downloadedPacks.filter(p => p.stateCode !== stateCode),
      })),

      updatePackProgress: (stateCode, progress) => set((state) => ({
        downloadedPacks: state.downloadedPacks.map(p =>
          p.stateCode === stateCode ? { ...p, progress, isDownloading: progress < 100 } : p
        ),
      })),

      setPendingQueueCount: (count) => set({ pendingQueueCount: count }),
    }),
    {
      name: 'drivelegal-offline',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        downloadedPacks: state.downloadedPacks,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);
