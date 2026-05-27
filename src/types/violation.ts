/**
 * Violation-related types (re-exports + calculator-specific)
 */

export interface FineCalculation {
  id: string;
  violationId: string;
  violationName: string;
  vehicleType: string;
  stateCode: string;
  stateName: string;
  isRepeat: boolean;
  baseFine: number;
  surcharge: number;
  compoundingFee: number;
  totalFine: number;
  licencePoints: number;
  imprisonment?: string;
  section: string;
  act: string;
  calculatedAt: number;
}

export interface StateComparison {
  violationId: string;
  vehicleType: string;
  isRepeat: boolean;
  comparisons: {
    stateCode: string;
    stateName: string;
    totalFine: number;
    baseFine: number;
    section: string;
  }[];
}
