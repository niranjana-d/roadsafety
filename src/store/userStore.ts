/**
 * User Store — Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, SavedVehicle } from '../types/user';

interface UserState {
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
  addVehicle: (vehicle: SavedVehicle) => void;
  removeVehicle: (id: string) => void;
  updateVehicle: (id: string, partial: Partial<SavedVehicle>) => void;
  updateSafetyScore: (score: number) => void;
}

const defaultProfile: UserProfile = {
  id: 'user-1',
  name: 'Driver',
  location: { country: 'IN', stateCode: 'MH', city: 'Mumbai' },
  language: 'en',
  vehicles: [
    { id: 'v1', name: 'Honda City', type: 'car', registrationState: 'MH', registrationNumber: 'MH 01 AB 1234' },
    { id: 'v2', name: 'Royal Enfield', type: '2w', registrationState: 'MH', registrationNumber: 'MH 02 XY 5678' },
  ],
  safetyScore: 75,
  createdAt: Date.now(),
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      updateProfile: (partial) => set((state) => ({
        profile: { ...state.profile, ...partial },
      })),

      addVehicle: (vehicle) => set((state) => ({
        profile: {
          ...state.profile,
          vehicles: [...state.profile.vehicles, vehicle],
        },
      })),

      removeVehicle: (id) => set((state) => ({
        profile: {
          ...state.profile,
          vehicles: state.profile.vehicles.filter(v => v.id !== id),
        },
      })),

      updateVehicle: (id, partial) => set((state) => ({
        profile: {
          ...state.profile,
          vehicles: state.profile.vehicles.map(v =>
            v.id === id ? { ...v, ...partial } : v
          ),
        },
      })),

      updateSafetyScore: (score) => set((state) => ({
        profile: { ...state.profile, safetyScore: Math.min(100, Math.max(0, score)) },
      })),
    }),
    {
      name: 'drivelegal-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
