/**
 * Mock Laws Service — returns realistic law data
 */
import type { Law } from '../../types/law';

export const MOCK_LAWS: Law[] = [
  {
    id: 'law-speeding',
    title: 'Over-Speeding (Urban Areas)',
    titleHi: 'ओवर-स्पीडिंग (शहरी क्षेत्र)',
    summary: 'Driving beyond the posted speed limit within city or urban area limits.',
    summaryHi: 'शहर या शहरी क्षेत्र की सीमा के भीतर निर्धारित गति सीमा से अधिक गाड़ी चलाना।',
    officialText: 'Section 183 of the Motor Vehicles Act, 2019 — Whoever drives a motor vehicle in contravention of the speed limits referred to in section 112 shall be punishable with a fine which may extend to one thousand rupees for the first offence and two thousand rupees for a second or subsequent offence.',
    simplifiedExplanation: 'If you drive faster than the posted speed limit in an urban area (typically 50 km/h for cars), you can be fined ₹1,000 for the first time and ₹2,000 if caught again. On highways, the limit is usually 100-120 km/h depending on the road type.',
    category: 'speed',
    severity: 'major',
    section: '§112 / §183',
    act: 'MVA 2019',
    fineRange: '₹1,000 – ₹2,000',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    applicableStates: ['national'],
    amendments: [
      { date: '2024-04-01', title: 'Fine amount updated', description: 'Base fine increased from ₹400 to ₹1,000 under 2019 Amendment Act.', previousValue: '₹400', newValue: '₹1,000' },
    ],
    relatedViolationIds: ['speeding', 'dangerous-driving'],
    lastUpdated: '2024-04-15',
  },
  {
    id: 'law-dui',
    title: 'Drunk Driving (DUI)',
    titleHi: 'शराब पीकर गाड़ी चलाना',
    summary: 'Blood Alcohol Concentration exceeding 30 mg/100 ml. Criminal offence with imprisonment.',
    summaryHi: 'रक्त में अल्कोहल की मात्रा 30 mg/100 ml से अधिक। कारावास सहित आपराधिक अपराध।',
    officialText: 'Section 185 of the Motor Vehicles Act, 2019 — Whoever, while driving or attempting to drive a motor vehicle has, in his blood, alcohol exceeding 30 mg. per 100 ml. of blood detected in a test by a breath analyser, shall be punishable for the first offence with imprisonment for a term which may extend to six months, or with fine which may extend to ten thousand rupees, or with both.',
    simplifiedExplanation: 'If you are caught driving with blood alcohol level above 30 mg per 100 ml (very low threshold — roughly 1 drink), you face a fine of ₹10,000 AND/OR up to 6 months in jail for the first time. Second offence within 3 years: ₹15,000 fine and/or 2 years jail.',
    category: 'dui',
    severity: 'criminal',
    section: '§185',
    act: 'MVA 2019',
    fineRange: '₹10,000 + imprisonment',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    applicableStates: ['national'],
    amendments: [],
    relatedViolationIds: ['dui', 'dangerous-driving'],
    lastUpdated: '2023-09-01',
  },
  {
    id: 'law-helmet',
    title: 'No Helmet (Two-Wheeler)',
    titleHi: 'हेलमेट नहीं (दोपहिया)',
    summary: 'Riding a two-wheeler without ISI-certified helmet. Applies to rider and pillion.',
    summaryHi: 'ISI-प्रमाणित हेलमेट के बिना दोपहिया वाहन चलाना। सवार और पीछे बैठने वाले दोनों पर लागू।',
    officialText: 'Section 129 of the Motor Vehicles Act, 2019 — Every person driving or riding (otherwise than in a side car, on a motor cycle of any class or description) shall, while in a public place, wear protective headgear conforming to the standards of Bureau of Indian Standards.',
    simplifiedExplanation: 'Both the rider and pillion passenger on a two-wheeler must wear an ISI-certified helmet in public. Fine is ₹1,000 for first offence, ₹2,000 for repeat. Your licence may be suspended for 3 months on repeated violations.',
    category: 'safety',
    severity: 'moderate',
    section: '§129',
    act: 'MVA 2019',
    fineRange: '₹1,000 (first) / ₹2,000 (repeat)',
    applicableVehicles: ['2w'],
    applicableStates: ['national'],
    amendments: [],
    relatedViolationIds: ['no-helmet'],
    lastUpdated: '2023-06-01',
  },
  {
    id: 'law-mobile',
    title: 'Using Mobile Phone While Driving',
    titleHi: 'गाड़ी चलाते समय मोबाइल फोन का उपयोग',
    summary: 'Using a hand-held mobile phone while operating a motor vehicle.',
    summaryHi: 'मोटर वाहन चलाते समय हाथ में मोबाइल फोन का उपयोग।',
    officialText: 'Section 184 of the Motor Vehicles Act, 2019 — Whoever drives a motor vehicle at a speed or in a manner that is dangerous to the public, having regard to all the circumstances of the case including the nature, condition and use of the place and the amount of traffic which at the time is or might reasonably be expected to be in the place. Using mobile phone while driving falls under dangerous driving.',
    simplifiedExplanation: 'Using your phone (texting, calling, or using apps) while driving attracts a fine of ₹5,000. Hands-free devices are allowed. This is considered dangerous driving and can also lead to licence suspension on repeat offences.',
    category: 'safety',
    severity: 'major',
    section: '§184',
    act: 'MVA 2019',
    fineRange: '₹5,000',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    applicableStates: ['national'],
    amendments: [],
    relatedViolationIds: ['mobile-phone', 'dangerous-driving'],
    lastUpdated: '2023-06-01',
  },
  {
    id: 'law-insurance',
    title: 'Driving Without Insurance',
    titleHi: 'बिना बीमा के गाड़ी चलाना',
    summary: 'Operating a motor vehicle without valid third-party insurance policy.',
    summaryHi: 'वैध तृतीय-पक्ष बीमा पॉलिसी के बिना मोटर वाहन चलाना।',
    officialText: 'Section 196 of the Motor Vehicles Act, 2019 — Whoever drives a motor vehicle or causes or allows a motor vehicle to be used, without a valid insurance policy, shall be punishable with imprisonment for a term which may extend to three months, or with fine of not less than two thousand rupees, or with both.',
    simplifiedExplanation: 'Every motor vehicle in India must have at least third-party insurance. Driving without it can result in a fine of ₹2,000 (first offence) or ₹4,000 (repeat), and even 3 months imprisonment. You can purchase insurance online through government-approved portals.',
    category: 'insurance',
    severity: 'major',
    section: '§196',
    act: 'MVA 2019',
    fineRange: '₹2,000 (first) / ₹4,000 (repeat)',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    applicableStates: ['national'],
    amendments: [
      { date: '2024-01-15', title: 'Enforcement strengthened', description: 'Digital insurance verification now mandatory during routine checks.', previousValue: 'Physical copy required', newValue: 'DigiLocker / e-copy accepted' },
    ],
    relatedViolationIds: ['no-insurance'],
    lastUpdated: '2024-01-15',
  },
  {
    id: 'law-seatbelt',
    title: 'No Seatbelt',
    titleHi: 'सीटबेल्ट नहीं',
    summary: 'Driving without wearing a seatbelt. Applies to driver and front passenger.',
    summaryHi: 'सीटबेल्ट पहने बिना गाड़ी चलाना। ड्राइवर और सामने के यात्री दोनों पर लागू।',
    officialText: 'Section 194B of the Motor Vehicles Act, 2019 — Whoever drives a motor vehicle without wearing a seat belt shall be punishable with a fine of one thousand rupees.',
    simplifiedExplanation: 'The driver and all passengers in the front seat must wear seatbelts. The fine is ₹1,000. Some states are now enforcing rear seatbelt usage as well following Supreme Court directions.',
    category: 'safety',
    severity: 'moderate',
    section: '§194B',
    act: 'MVA 2019',
    fineRange: '₹1,000',
    applicableVehicles: ['car', 'commercial'],
    applicableStates: ['national'],
    amendments: [],
    relatedViolationIds: ['no-seatbelt'],
    lastUpdated: '2023-06-01',
  },
  {
    id: 'law-signal',
    title: 'Signal Jumping / Red Light Violation',
    titleHi: 'सिग्नल तोड़ना / लाल बत्ती उल्लंघन',
    summary: 'Disobeying traffic signal lights at intersections.',
    summaryHi: 'चौराहों पर ट्रैफिक सिग्नल लाइट्स का उल्लंघन।',
    officialText: 'Section 119 of the Motor Vehicles Act, 2019 — Whoever disobeys any direction given by any person or authority empowered to give such direction, or any traffic sign, shall be punishable with a fine of five thousand rupees for the first offence and ten thousand rupees for a second or subsequent offence.',
    simplifiedExplanation: 'Running a red light or ignoring traffic signals attracts a heavy fine of ₹5,000 (first time) and ₹10,000 (repeat). This is one of the most heavily penalized traffic violations due to its danger to public safety.',
    category: 'safety',
    severity: 'major',
    section: '§119',
    act: 'MVA 2019',
    fineRange: '₹5,000 – ₹10,000',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    applicableStates: ['national'],
    amendments: [],
    relatedViolationIds: ['signal-jumping'],
    lastUpdated: '2023-06-01',
  },
  {
    id: 'law-no-licence',
    title: 'Driving Without Licence',
    titleHi: 'बिना लाइसेंस के गाड़ी चलाना',
    summary: 'Driving without a valid licence or with an expired licence.',
    summaryHi: 'वैध लाइसेंस के बिना या समय सीमा समाप्त लाइसेंस के साथ गाड़ी चलाना।',
    officialText: 'Section 181 of the Motor Vehicles Act, 2019 — Whoever drives a motor vehicle in any public place without holding an effective driving licence shall be punishable with imprisonment for a term which may extend to three months, or with a fine which may extend to five thousand rupees, or with both.',
    simplifiedExplanation: 'You must carry a valid driving licence when driving. Driving without one can result in ₹5,000 fine and up to 3 months imprisonment. If your licence is expired, renew it immediately — a 30-day grace period typically applies.',
    category: 'licensing',
    severity: 'major',
    section: '§181',
    act: 'MVA 2019',
    fineRange: '₹5,000 + imprisonment',
    applicableVehicles: ['2w', 'auto', 'car', 'commercial', 'heavy'],
    applicableStates: ['national'],
    amendments: [],
    relatedViolationIds: ['no-licence'],
    lastUpdated: '2023-06-01',
  },
];

/**
 * Get all mock laws with optional filtering
 */
export function getMockLaws(filters?: {
  category?: string;
  severity?: string;
  stateCode?: string;
  searchQuery?: string;
}): Promise<Law[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...MOCK_LAWS];

      if (filters?.category && filters.category !== 'all') {
        results = results.filter(l => l.category === filters.category);
      }
      if (filters?.severity) {
        results = results.filter(l => l.severity === filters.severity);
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        results = results.filter(
          l => l.title.toLowerCase().includes(q) ||
               l.summary.toLowerCase().includes(q) ||
               l.section.toLowerCase().includes(q)
        );
      }

      resolve(results);
    }, 500);
  });
}

/**
 * Get a single law by ID
 */
export function getMockLawById(id: string): Promise<Law | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_LAWS.find(l => l.id === id));
    }, 300);
  });
}
