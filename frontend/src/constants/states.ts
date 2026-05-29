/**
 * All 28 Indian States + 8 Union Territories
 * Each entry contains code, name (en), name (hi), capital, and region.
 */

export interface IndianState {
  code: string;
  name: string;
  nameHi: string;
  capital: string;
  region: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
  isUT: boolean;
}

export const INDIAN_STATES: IndianState[] = [
  // ─── States (28) ────────────────────────────────────────────
  { code: 'AP', name: 'Andhra Pradesh', nameHi: 'आंध्र प्रदेश', capital: 'Amaravati', region: 'south', isUT: false },
  { code: 'AR', name: 'Arunachal Pradesh', nameHi: 'अरुणाचल प्रदेश', capital: 'Itanagar', region: 'northeast', isUT: false },
  { code: 'AS', name: 'Assam', nameHi: 'असम', capital: 'Dispur', region: 'northeast', isUT: false },
  { code: 'BR', name: 'Bihar', nameHi: 'बिहार', capital: 'Patna', region: 'east', isUT: false },
  { code: 'CG', name: 'Chhattisgarh', nameHi: 'छत्तीसगढ़', capital: 'Raipur', region: 'central', isUT: false },
  { code: 'GA', name: 'Goa', nameHi: 'गोवा', capital: 'Panaji', region: 'west', isUT: false },
  { code: 'GJ', name: 'Gujarat', nameHi: 'गुजरात', capital: 'Gandhinagar', region: 'west', isUT: false },
  { code: 'HR', name: 'Haryana', nameHi: 'हरियाणा', capital: 'Chandigarh', region: 'north', isUT: false },
  { code: 'HP', name: 'Himachal Pradesh', nameHi: 'हिमाचल प्रदेश', capital: 'Shimla', region: 'north', isUT: false },
  { code: 'JH', name: 'Jharkhand', nameHi: 'झारखंड', capital: 'Ranchi', region: 'east', isUT: false },
  { code: 'KA', name: 'Karnataka', nameHi: 'कर्नाटक', capital: 'Bengaluru', region: 'south', isUT: false },
  { code: 'KL', name: 'Kerala', nameHi: 'केरल', capital: 'Thiruvananthapuram', region: 'south', isUT: false },
  { code: 'MP', name: 'Madhya Pradesh', nameHi: 'मध्य प्रदेश', capital: 'Bhopal', region: 'central', isUT: false },
  { code: 'MH', name: 'Maharashtra', nameHi: 'महाराष्ट्र', capital: 'Mumbai', region: 'west', isUT: false },
  { code: 'MN', name: 'Manipur', nameHi: 'मणिपुर', capital: 'Imphal', region: 'northeast', isUT: false },
  { code: 'ML', name: 'Meghalaya', nameHi: 'मेघालय', capital: 'Shillong', region: 'northeast', isUT: false },
  { code: 'MZ', name: 'Mizoram', nameHi: 'मिज़ोरम', capital: 'Aizawl', region: 'northeast', isUT: false },
  { code: 'NL', name: 'Nagaland', nameHi: 'नागालैंड', capital: 'Kohima', region: 'northeast', isUT: false },
  { code: 'OD', name: 'Odisha', nameHi: 'ओडिशा', capital: 'Bhubaneswar', region: 'east', isUT: false },
  { code: 'PB', name: 'Punjab', nameHi: 'पंजाब', capital: 'Chandigarh', region: 'north', isUT: false },
  { code: 'RJ', name: 'Rajasthan', nameHi: 'राजस्थान', capital: 'Jaipur', region: 'north', isUT: false },
  { code: 'SK', name: 'Sikkim', nameHi: 'सिक्किम', capital: 'Gangtok', region: 'northeast', isUT: false },
  { code: 'TN', name: 'Tamil Nadu', nameHi: 'तमिलनाडु', capital: 'Chennai', region: 'south', isUT: false },
  { code: 'TS', name: 'Telangana', nameHi: 'तेलंगाना', capital: 'Hyderabad', region: 'south', isUT: false },
  { code: 'TR', name: 'Tripura', nameHi: 'त्रिपुरा', capital: 'Agartala', region: 'northeast', isUT: false },
  { code: 'UP', name: 'Uttar Pradesh', nameHi: 'उत्तर प्रदेश', capital: 'Lucknow', region: 'north', isUT: false },
  { code: 'UK', name: 'Uttarakhand', nameHi: 'उत्तराखंड', capital: 'Dehradun', region: 'north', isUT: false },
  { code: 'WB', name: 'West Bengal', nameHi: 'पश्चिम बंगाल', capital: 'Kolkata', region: 'east', isUT: false },

  // ─── Union Territories (8) ─────────────────────────────────
  { code: 'AN', name: 'Andaman & Nicobar Islands', nameHi: 'अंडमान और निकोबार', capital: 'Port Blair', region: 'south', isUT: true },
  { code: 'CH', name: 'Chandigarh', nameHi: 'चंडीगढ़', capital: 'Chandigarh', region: 'north', isUT: true },
  { code: 'DD', name: 'Dadra & Nagar Haveli and Daman & Diu', nameHi: 'दादरा और नगर हवेली और दमन और दीव', capital: 'Daman', region: 'west', isUT: true },
  { code: 'DL', name: 'Delhi', nameHi: 'दिल्ली', capital: 'New Delhi', region: 'north', isUT: true },
  { code: 'JK', name: 'Jammu & Kashmir', nameHi: 'जम्मू और कश्मीर', capital: 'Srinagar', region: 'north', isUT: true },
  { code: 'LA', name: 'Ladakh', nameHi: 'लद्दाख', capital: 'Leh', region: 'north', isUT: true },
  { code: 'LD', name: 'Lakshadweep', nameHi: 'लक्षद्वीप', capital: 'Kavaratti', region: 'south', isUT: true },
  { code: 'PY', name: 'Puducherry', nameHi: 'पुडुचेरी', capital: 'Puducherry', region: 'south', isUT: true },
];

/** States only (no UTs) */
export const STATES_ONLY = INDIAN_STATES.filter(s => !s.isUT);

/** Union Territories only */
export const UNION_TERRITORIES = INDIAN_STATES.filter(s => s.isUT);

/** Dropdown options (code → name) */
export const STATE_OPTIONS = INDIAN_STATES.map(s => ({
  value: s.code,
  label: s.name,
  labelHi: s.nameHi,
}));

/** Quick lookup by code */
export const STATE_BY_CODE: Record<string, IndianState> = {};
INDIAN_STATES.forEach(s => { STATE_BY_CODE[s.code] = s; });

/** Search states by name (case-insensitive, prefix match) */
export function searchStates(query: string): IndianState[] {
  const q = query.toLowerCase().trim();
  if (!q) return INDIAN_STATES;
  return INDIAN_STATES.filter(
    s => s.name.toLowerCase().includes(q) ||
         s.nameHi.includes(q) ||
         s.code.toLowerCase() === q
  );
}

/** Group states by region */
export function statesByRegion(): Record<string, IndianState[]> {
  const grouped: Record<string, IndianState[]> = {};
  INDIAN_STATES.forEach(s => {
    if (!grouped[s.region]) grouped[s.region] = [];
    grouped[s.region].push(s);
  });
  return grouped;
}

/** Major cities by state code (subset for dropdowns) */
export const CITIES_BY_STATE: Record<string, string[]> = {
  MH: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Solapur'],
  DL: ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
  KA: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belgaum'],
  TN: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  GJ: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  UP: ['Lucknow', 'Noida', 'Agra', 'Varanasi', 'Kanpur', 'Prayagraj'],
  WB: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  RJ: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer'],
  KL: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  AP: ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Tirupati'],
  TS: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  PB: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
  HR: ['Chandigarh', 'Gurugram', 'Faridabad', 'Hisar'],
  BR: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
  MP: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  OD: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
  CG: ['Raipur', 'Bilaspur', 'Durg', 'Korba'],
  JH: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  AS: ['Dispur', 'Guwahati', 'Silchar', 'Dibrugarh'],
  HP: ['Shimla', 'Manali', 'Dharamshala', 'Kullu'],
  UK: ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital'],
  GA: ['Panaji', 'Margao', 'Vasco da Gama'],
  JK: ['Srinagar', 'Jammu', 'Anantnag'],
  AN: ['Port Blair'],
  CH: ['Chandigarh'],
  DD: ['Daman', 'Silvassa'],
  LA: ['Leh', 'Kargil'],
  LD: ['Kavaratti'],
  PY: ['Puducherry', 'Karaikal'],
  SK: ['Gangtok', 'Namchi'],
  TR: ['Agartala'],
  MN: ['Imphal'],
  ML: ['Shillong'],
  MZ: ['Aizawl'],
  NL: ['Kohima', 'Dimapur'],
  AR: ['Itanagar'],
};
