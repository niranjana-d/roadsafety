/**
 * Vehicle type definitions
 */

export interface VehicleType {
  id: string;
  name: string;
  nameHi: string;
  icon: string; // Emoji for quick display
  description: string;
}

export const VEHICLE_TYPES: VehicleType[] = [
  { id: '2w', name: '2-Wheeler', nameHi: 'दोपहिया', icon: '🏍️', description: 'Motorcycle, Scooter, Moped' },
  { id: 'auto', name: 'Auto', nameHi: 'ऑटो', icon: '🛺', description: 'Auto-rickshaw, E-rickshaw' },
  { id: 'car', name: 'Car', nameHi: 'कार', icon: '🚗', description: 'Sedan, SUV, Hatchback' },
  { id: 'commercial', name: 'Commercial', nameHi: 'कमर्शियल', icon: '🚐', description: 'Van, Minibus, Taxi, Cab' },
  { id: 'heavy', name: 'Heavy Vehicle', nameHi: 'भारी वाहन', icon: '🚛', description: 'Truck, Bus, Trailer' },
];

export const VEHICLE_BY_ID: Record<string, VehicleType> = {};
VEHICLE_TYPES.forEach(v => { VEHICLE_BY_ID[v.id] = v; });
