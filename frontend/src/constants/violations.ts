/**
 * Traffic violation types, categories, and fine data
 */

export type ViolationSeverity = 'minor' | 'moderate' | 'major' | 'criminal';
export type ViolationCategory =
  | 'speed'
  | 'safety'
  | 'documents'
  | 'dui'
  | 'parking'
  | 'insurance'
  | 'licensing'
  | 'vehicle-standards'
  | 'pedestrian'
  | 'other';

export interface ViolationFineData {
  baseFine: number;
  repeatFine: number;
  surcharge: number;
  compoundingFee: number;
  licencePoints: number;
  imprisonment?: string;
  section: string;
  act: string;
}

export interface Violation {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  category: ViolationCategory;
  severity: ViolationSeverity;
  applicableVehicles: string[]; // vehicle type IDs
  /** Fine data per state code. 'national' is the default. */
  fines: Record<string, ViolationFineData>;
}

export const VIOLATION_CATEGORIES: { id: ViolationCategory; label: string; labelHi: string; icon: string }[] = [
  { id: 'speed', label: 'Speed Limits', labelHi: 'गति सीमा', icon: 'speedometer' },
  { id: 'safety', label: 'Safety Equipment', labelHi: 'सुरक्षा उपकरण', icon: 'shield' },
  { id: 'dui', label: 'DUI / Drunk Driving', labelHi: 'शराब पीकर गाड़ी चलाना', icon: 'alert-circle' },
  { id: 'documents', label: 'Documents', labelHi: 'दस्तावेज़', icon: 'file-text' },
  { id: 'parking', label: 'Parking', labelHi: 'पार्किंग', icon: 'map-pin' },
  { id: 'insurance', label: 'Insurance', labelHi: 'बीमा', icon: 'shield-check' },
  { id: 'licensing', label: 'Licensing', labelHi: 'लाइसेंस', icon: 'credit-card' },
  { id: 'vehicle-standards', label: 'Vehicle Standards', labelHi: 'वाहन मानक', icon: 'settings' },
  { id: 'pedestrian', label: 'Pedestrian', labelHi: 'पैदल यात्री', icon: 'users' },
  { id: 'other', label: 'Other', labelHi: 'अन्य', icon: 'more-horizontal' },
];

export const VIOLATIONS: Violation[] = [
  {
    id: 'speeding',
    name: 'Over-Speeding',
    nameHi: 'ओवर-स्पीडिंग',
    description: 'Exceeding the posted speed limit within city/urban or highway limits.',
    category: 'speed',
    severity: 'major',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 1000, repeatFine: 2000, surcharge: 0, compoundingFee: 0, licencePoints: 2, section: '§183', act: 'MVA 2019' },
      MH: { baseFine: 1000, repeatFine: 2000, surcharge: 0, compoundingFee: 0, licencePoints: 2, section: '§112/183', act: 'MVA 2019' },
      DL: { baseFine: 1500, repeatFine: 3000, surcharge: 200, compoundingFee: 0, licencePoints: 3, section: '§183', act: 'MVA 2019' },
      KA: { baseFine: 1000, repeatFine: 2000, surcharge: 100, compoundingFee: 0, licencePoints: 2, section: '§183', act: 'MVA 2019' },
    },
  },
  {
    id: 'no-helmet',
    name: 'No Helmet',
    nameHi: 'हेलमेट नहीं',
    description: 'Riding a two-wheeler without an ISI-certified helmet. Applies to rider and pillion.',
    category: 'safety',
    severity: 'moderate',
    applicableVehicles: ['2w'],
    fines: {
      national: { baseFine: 1000, repeatFine: 2000, surcharge: 0, compoundingFee: 0, licencePoints: 1, section: '§129', act: 'MVA 2019' },
      MH: { baseFine: 1000, repeatFine: 2000, surcharge: 0, compoundingFee: 0, licencePoints: 1, section: '§129', act: 'MVA 2019' },
      DL: { baseFine: 1000, repeatFine: 2000, surcharge: 0, compoundingFee: 0, licencePoints: 1, section: '§129', act: 'MVA 2019' },
    },
  },
  {
    id: 'signal-jumping',
    name: 'Signal Jumping',
    nameHi: 'सिग्नल तोड़ना',
    description: 'Disobeying traffic signal lights at intersections.',
    category: 'safety',
    severity: 'major',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 5000, repeatFine: 10000, surcharge: 0, compoundingFee: 0, licencePoints: 2, section: '§119', act: 'MVA 2019' },
      MH: { baseFine: 5000, repeatFine: 10000, surcharge: 0, compoundingFee: 0, licencePoints: 2, section: '§119', act: 'MVA 2019' },
    },
  },
  {
    id: 'no-seatbelt',
    name: 'No Seatbelt',
    nameHi: 'सीटबेल्ट नहीं',
    description: 'Driving without wearing a seatbelt. Applies to driver and front passenger.',
    category: 'safety',
    severity: 'moderate',
    applicableVehicles: ['car', 'commercial'],
    fines: {
      national: { baseFine: 1000, repeatFine: 1000, surcharge: 0, compoundingFee: 0, licencePoints: 1, section: '§194B', act: 'MVA 2019' },
    },
  },
  {
    id: 'dui',
    name: 'Drunk Driving (DUI)',
    nameHi: 'नशे में गाड़ी चलाना',
    description: 'Blood Alcohol Concentration exceeding 30 mg/100 ml. Criminal offence.',
    category: 'dui',
    severity: 'criminal',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 10000, repeatFine: 15000, surcharge: 0, compoundingFee: 0, licencePoints: 4, imprisonment: 'Up to 6 months (first), 2 years (repeat)', section: '§185', act: 'MVA 2019' },
      MH: { baseFine: 10000, repeatFine: 15000, surcharge: 0, compoundingFee: 0, licencePoints: 4, imprisonment: 'Up to 6 months (first), 2 years (repeat)', section: '§185', act: 'MVA 2019' },
    },
  },
  {
    id: 'mobile-phone',
    name: 'Using Mobile Phone',
    nameHi: 'मोबाइल फोन का उपयोग',
    description: 'Using a hand-held mobile phone while driving. Includes texting, calling, and apps.',
    category: 'safety',
    severity: 'major',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 5000, repeatFine: 5000, surcharge: 0, compoundingFee: 0, licencePoints: 2, section: '§184', act: 'MVA 2019' },
    },
  },
  {
    id: 'wrong-parking',
    name: 'Wrong Parking',
    nameHi: 'गलत पार्किंग',
    description: 'Parking in a no-parking zone or obstructing traffic.',
    category: 'parking',
    severity: 'minor',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 500, repeatFine: 1500, surcharge: 100, compoundingFee: 0, licencePoints: 0, section: '§122', act: 'MVA 2019' },
      DL: { baseFine: 750, repeatFine: 1500, surcharge: 200, compoundingFee: 0, licencePoints: 0, section: '§122', act: 'MVA 2019' },
    },
  },
  {
    id: 'no-insurance',
    name: 'Driving Without Insurance',
    nameHi: 'बिना बीमा के गाड़ी चलाना',
    description: 'Operating a motor vehicle without valid third-party insurance.',
    category: 'insurance',
    severity: 'major',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 2000, repeatFine: 4000, surcharge: 0, compoundingFee: 0, licencePoints: 0, section: '§196', act: 'MVA 2019' },
    },
  },
  {
    id: 'no-licence',
    name: 'Driving Without Licence',
    nameHi: 'बिना लाइसेंस के गाड़ी चलाना',
    description: 'Driving without a valid driving licence or with an expired licence.',
    category: 'licensing',
    severity: 'major',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 5000, repeatFine: 10000, surcharge: 0, compoundingFee: 0, licencePoints: 0, imprisonment: 'Up to 3 months', section: '§181', act: 'MVA 2019' },
    },
  },
  {
    id: 'no-puc',
    name: 'No PUC Certificate',
    nameHi: 'PUC प्रमाणपत्र नहीं',
    description: 'Operating a vehicle without valid Pollution Under Control certificate.',
    category: 'documents',
    severity: 'moderate',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 1000, repeatFine: 2000, surcharge: 0, compoundingFee: 0, licencePoints: 0, section: '§190', act: 'MVA 2019' },
    },
  },
  {
    id: 'overloading',
    name: 'Overloading',
    nameHi: 'ओवरलोडिंग',
    description: 'Carrying passengers or cargo beyond the permitted capacity.',
    category: 'vehicle-standards',
    severity: 'major',
    applicableVehicles: ['auto', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 2000, repeatFine: 5000, surcharge: 1000, compoundingFee: 0, licencePoints: 2, section: '§194', act: 'MVA 2019' },
    },
  },
  {
    id: 'dangerous-driving',
    name: 'Dangerous Driving',
    nameHi: 'खतरनाक ड्राइविंग',
    description: 'Driving in a manner dangerous to public safety, including rash driving.',
    category: 'safety',
    severity: 'criminal',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 5000, repeatFine: 10000, surcharge: 0, compoundingFee: 0, licencePoints: 4, imprisonment: 'Up to 1 year', section: '§184', act: 'MVA 2019' },
    },
  },
  {
    id: 'wrong-side',
    name: 'Driving on Wrong Side',
    nameHi: 'गलत साइड पर गाड़ी चलाना',
    description: 'Driving against the flow of traffic or on the wrong side of the road.',
    category: 'safety',
    severity: 'major',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 5000, repeatFine: 10000, surcharge: 0, compoundingFee: 0, licencePoints: 3, section: '§119', act: 'MVA 2019' },
    },
  },
  {
    id: 'no-registration',
    name: 'No Vehicle Registration',
    nameHi: 'वाहन पंजीकरण नहीं',
    description: 'Driving an unregistered motor vehicle on public roads.',
    category: 'documents',
    severity: 'major',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 5000, repeatFine: 10000, surcharge: 0, compoundingFee: 0, licencePoints: 0, imprisonment: 'Up to 1 year', section: '§192', act: 'MVA 2019' },
    },
  },
  {
    id: 'honking-silence-zone',
    name: 'Unnecessary Honking',
    nameHi: 'अनावश्यक हॉर्न बजाना',
    description: 'Honking in silence zones near hospitals, schools, or courts.',
    category: 'other',
    severity: 'minor',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    fines: {
      national: { baseFine: 1000, repeatFine: 2000, surcharge: 0, compoundingFee: 0, licencePoints: 0, section: '§194F', act: 'MVA 2019' },
    },
  },
];

/** Quick lookup by violation ID */
export const VIOLATION_BY_ID: Record<string, Violation> = {};
VIOLATIONS.forEach(v => { VIOLATION_BY_ID[v.id] = v; });

/** Get fine data for a violation in a specific state (falls back to national) */
export function getFineData(violationId: string, stateCode: string): ViolationFineData | undefined {
  const violation = VIOLATION_BY_ID[violationId];
  if (!violation) return undefined;
  return violation.fines[stateCode] || violation.fines['national'];
}

/** Search violations by name (case-insensitive) */
export function searchViolations(query: string): Violation[] {
  const q = query.toLowerCase().trim();
  if (!q) return VIOLATIONS;
  return VIOLATIONS.filter(
    v => v.name.toLowerCase().includes(q) ||
         v.nameHi.includes(q) ||
         v.description.toLowerCase().includes(q) ||
         v.category.includes(q)
  );
}

/** Filter violations by category */
export function filterByCategory(category: ViolationCategory): Violation[] {
  return VIOLATIONS.filter(v => v.category === category);
}

/** Filter violations by severity */
export function filterBySeverity(severity: ViolationSeverity): Violation[] {
  return VIOLATIONS.filter(v => v.severity === severity);
}
