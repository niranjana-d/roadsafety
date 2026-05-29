/**
 * Emergency contact numbers (location-specific)
 */

export interface EmergencyContact {
  id: string;
  name: string;
  nameHi: string;
  number: string;
  icon: string;
  color: string;
  description: string;
}

export const NATIONAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'police', name: 'Police', nameHi: 'पुलिस', number: '100', icon: '🚓', color: '#1A73E8', description: 'Traffic Police / General Emergency' },
  { id: 'ambulance', name: 'Ambulance', nameHi: 'एम्बुलेंस', number: '108', icon: '🚑', color: '#D32F2F', description: 'Medical Emergency' },
  { id: 'fire', name: 'Fire Brigade', nameHi: 'दमकल', number: '101', icon: '🚒', color: '#FF9800', description: 'Fire Emergency' },
  { id: 'road-helpline', name: 'Road Helpline', nameHi: 'सड़क हेल्पलाइन', number: '1033', icon: '🛣️', color: '#00C853', description: 'National Highway Helpline' },
  { id: 'women-helpline', name: 'Women Helpline', nameHi: 'महिला हेल्पलाइन', number: '1091', icon: '👩', color: '#E91E63', description: 'Women Safety Helpline' },
  { id: 'national-emergency', name: 'Unified Emergency', nameHi: 'एकीकृत आपातकालीन', number: '112', icon: '🆘', color: '#D32F2F', description: 'Unified Emergency Response' },
];

/** State-specific traffic helpline overrides */
export const STATE_HELPLINES: Record<string, { name: string; number: string }[]> = {
  MH: [
    { name: 'Mumbai Traffic Police', number: '022-24937747' },
    { name: 'Maharashtra Highway Patrol', number: '9869088100' },
  ],
  DL: [
    { name: 'Delhi Traffic Police', number: '011-25844444' },
    { name: 'Delhi Traffic Helpline', number: '1095' },
  ],
  KA: [
    { name: 'Bangalore Traffic Police', number: '080-22942222' },
  ],
  TN: [
    { name: 'Chennai Traffic Police', number: '044-23452349' },
  ],
};

/**
 * Accident checklist steps
 */
export interface ChecklistItem {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  priority: 'critical' | 'important' | 'recommended';
}

export const ACCIDENT_CHECKLIST: ChecklistItem[] = [
  { id: '1', title: 'Ensure Safety', titleHi: 'सुरक्षा सुनिश्चित करें', description: 'Turn on hazard lights. Move to a safe location if possible. Check for injuries.', priority: 'critical' },
  { id: '2', title: 'Call Emergency Services', titleHi: 'आपातकालीन सेवाओं को कॉल करें', description: 'Dial 112 or 108 for ambulance if anyone is injured. Call 100 for police.', priority: 'critical' },
  { id: '3', title: 'Document the Scene', titleHi: 'घटनास्थल का दस्तावेज़ीकरण करें', description: 'Take photos of vehicle positions, damage, license plates, road conditions, and any injuries.', priority: 'important' },
  { id: '4', title: 'Exchange Information', titleHi: 'जानकारी का आदान-प्रदान करें', description: 'Get the other driver\'s name, contact, licence number, vehicle registration, and insurance details.', priority: 'important' },
  { id: '5', title: 'Note Witnesses', titleHi: 'गवाहों को नोट करें', description: 'Get names and contact numbers of any witnesses present at the scene.', priority: 'important' },
  { id: '6', title: 'File an FIR', titleHi: 'FIR दर्ज करें', description: 'File a First Information Report at the nearest police station within 24 hours.', priority: 'important' },
  { id: '7', title: 'Notify Your Insurance', titleHi: 'अपनी बीमा कंपनी को सूचित करें', description: 'Inform your insurance company as soon as possible. Submit photos and documents.', priority: 'recommended' },
  { id: '8', title: 'Get Medical Check-up', titleHi: 'चिकित्सा जांच कराएं', description: 'Even if you feel fine, get a medical check-up. Some injuries appear later.', priority: 'recommended' },
];

/**
 * Required documents checklist
 */
export const REQUIRED_DOCUMENTS: ChecklistItem[] = [
  { id: 'dl', title: 'Driving Licence', titleHi: 'ड्राइविंग लाइसेंस', description: 'Valid driving licence (physical or DigiLocker).', priority: 'critical' },
  { id: 'rc', title: 'Registration Certificate (RC)', titleHi: 'पंजीकरण प्रमाणपत्र', description: 'Vehicle registration certificate.', priority: 'critical' },
  { id: 'insurance', title: 'Insurance Certificate', titleHi: 'बीमा प्रमाणपत्र', description: 'Valid third-party motor insurance policy.', priority: 'critical' },
  { id: 'puc', title: 'PUC Certificate', titleHi: 'PUC प्रमाणपत्र', description: 'Pollution Under Control certificate (valid for 6 months / 1 year).', priority: 'critical' },
  { id: 'permit', title: 'Vehicle Permit', titleHi: 'वाहन परमिट', description: 'Required for commercial vehicles and taxis.', priority: 'important' },
  { id: 'fitness', title: 'Fitness Certificate', titleHi: 'फिटनेस प्रमाणपत्र', description: 'For commercial vehicles older than 1 year.', priority: 'important' },
];

/**
 * Rights during traffic stop
 */
export const TRAFFIC_STOP_RIGHTS: { title: string; titleHi: string; description: string }[] = [
  { title: 'Ask for Identification', titleHi: 'पहचान पूछें', description: 'You have the right to ask the officer for their name, designation, and badge number.' },
  { title: 'Demand a Receipt', titleHi: 'रसीद की मांग करें', description: 'If fined, you are entitled to an official receipt. Never pay cash without a proper receipt.' },
  { title: 'Do Not Pay Spot Fines Without Receipt', titleHi: 'बिना रसीद के जुर्माना न दें', description: 'All fines should be paid through official channels (e-challan portal, bank, etc.).' },
  { title: 'Right to Know the Offence', titleHi: 'अपराध जानने का अधिकार', description: 'The officer must clearly state which law section you have violated before issuing a challan.' },
  { title: 'Towing Only by Authorized Personnel', titleHi: 'केवल अधिकृत कर्मियों द्वारा टोइंग', description: 'Your vehicle can only be towed by authorized municipality/police towing services.' },
  { title: 'Challenge the Challan', titleHi: 'चालान को चुनौती दें', description: 'You have the right to contest any challan before a traffic court within 30 days.' },
];
