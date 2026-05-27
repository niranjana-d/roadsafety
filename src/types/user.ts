/**
 * User-related types
 */

export interface UserProfile {
  id: string;
  name: string;
  location: {
    country: string;
    stateCode: string;
    city: string;
  };
  language: string;
  vehicles: SavedVehicle[];
  safetyScore: number;
  createdAt: number;
}

export interface SavedVehicle {
  id: string;
  name: string;         // e.g., "Honda City"
  type: string;         // vehicle type ID
  registrationState: string; // state code
  registrationNumber?: string; // e.g., "MH 01 AB 1234"
}

export interface BookmarkedItem {
  id: string;
  type: 'law' | 'calculation' | 'chat';
  title: string;
  summary: string;
  data: Record<string, unknown>;
  savedAt: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  country: string;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  notifications: {
    lawChanges: boolean;
    safetyTips: boolean;
    challanReminders: boolean;
    appUpdates: boolean;
  };
}
