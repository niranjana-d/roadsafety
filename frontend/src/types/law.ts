/**
 * Law-related types
 */
import type { ViolationSeverity, ViolationCategory } from '../constants/violations';

export interface Law {
  id: string;
  title: string;
  titleHi: string;
  summary: string;
  summaryHi: string;
  officialText: string;
  simplifiedExplanation: string;
  category: ViolationCategory;
  severity: ViolationSeverity;
  section: string;
  act: string;
  fineRange: string;
  applicableVehicles: string[];
  applicableStates: string[]; // state codes, ['national'] for national laws
  amendments: Amendment[];
  relatedViolationIds: string[];
  lastUpdated: string; // ISO date string
  isBookmarked?: boolean;
}

export interface Amendment {
  date: string;       // ISO date string
  title: string;
  description: string;
  previousValue: string;
  newValue: string;
}

export interface LawCategory {
  id: ViolationCategory;
  label: string;
  labelHi: string;
  count: number;
}

export interface LawFilter {
  categories: ViolationCategory[];
  severities: ViolationSeverity[];
  states: string[];
  vehicleTypes: string[];
  searchQuery: string;
  locationLevel: 'national' | 'state' | 'city';
  sortBy: 'relevance' | 'fineAmount' | 'severity' | 'dateUpdated';
  sortOrder: 'asc' | 'desc';
}

export interface LawComparison {
  lawId: string;
  states: string[]; // state codes to compare
}
