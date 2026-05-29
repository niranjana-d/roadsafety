/**
 * Location-related types
 */

export interface UserLocation {
  country: string;      // Country code (e.g., 'IN')
  stateCode: string;    // State/UT code (e.g., 'MH')
  stateName: string;    // State name (e.g., 'Maharashtra')
  city: string;         // City name (e.g., 'Mumbai')
  isAutoDetected: boolean;
  lastUpdated: number;  // Unix timestamp
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}
