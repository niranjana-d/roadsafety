/**
 * Location Store — Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserLocation } from '../types/location';
import { APP_CONFIG } from '../constants/config';

interface LocationState {
  currentLocation: UserLocation;
  savedLocations: UserLocation[];
  isLocationLoading: boolean;
  setCurrentLocation: (location: UserLocation) => void;
  updateCity: (city: string) => void;
  updateState: (stateCode: string, stateName: string) => void;
  addSavedLocation: (location: UserLocation) => void;
  removeSavedLocation: (stateCode: string) => void;
  setLoading: (loading: boolean) => void;
}

const defaultLocation: UserLocation = {
  country: APP_CONFIG.defaultLocation.country,
  stateCode: APP_CONFIG.defaultLocation.stateCode,
  stateName: 'Tamil Nadu',
  city: APP_CONFIG.defaultLocation.city,
  isAutoDetected: false,
  lastUpdated: Date.now(),
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: defaultLocation,
      savedLocations: [],
      isLocationLoading: false,

      setCurrentLocation: (location) => set({ currentLocation: { ...location, lastUpdated: Date.now() } }),

      updateCity: (city) => set((state) => ({
        currentLocation: { ...state.currentLocation, city, lastUpdated: Date.now() },
      })),

      updateState: (stateCode, stateName) => set((state) => ({
        currentLocation: { ...state.currentLocation, stateCode, stateName, lastUpdated: Date.now() },
      })),

      addSavedLocation: (location) => set((state) => ({
        savedLocations: [...state.savedLocations.filter(l => l.stateCode !== location.stateCode), location],
      })),

      removeSavedLocation: (stateCode) => set((state) => ({
        savedLocations: state.savedLocations.filter(l => l.stateCode !== stateCode),
      })),

      setLoading: (loading) => set({ isLocationLoading: loading }),
    }),
    {
      name: 'drivelegal-location',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
