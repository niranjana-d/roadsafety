/**
 * Calculator Store — Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FineCalculation } from '../types/violation';

interface CalculatorState {
  selectedViolation: string;
  selectedVehicle: string;
  selectedState: string;
  isRepeatOffence: boolean;
  lastResult: FineCalculation | null;
  calculationHistory: FineCalculation[];

  setViolation: (id: string) => void;
  setVehicle: (id: string) => void;
  setState: (code: string) => void;
  setRepeatOffence: (isRepeat: boolean) => void;
  setResult: (result: FineCalculation) => void;
  clearResult: () => void;
  clearHistory: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      selectedViolation: '',
      selectedVehicle: '2w',
      selectedState: 'MH',
      isRepeatOffence: false,
      lastResult: null,
      calculationHistory: [],

      setViolation: (id) => set({ selectedViolation: id }),
      setVehicle: (id) => set({ selectedVehicle: id }),
      setState: (code) => set({ selectedState: code }),
      setRepeatOffence: (isRepeat) => set({ isRepeatOffence: isRepeat }),

      setResult: (result) => set((state) => ({
        lastResult: result,
        calculationHistory: [result, ...state.calculationHistory].slice(0, 50),
      })),

      clearResult: () => set({ lastResult: null }),
      clearHistory: () => set({ calculationHistory: [] }),
    }),
    {
      name: 'drivelegal-calculator',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        calculationHistory: state.calculationHistory.slice(0, 20),
        selectedVehicle: state.selectedVehicle,
        selectedState: state.selectedState,
      }),
    }
  )
);
