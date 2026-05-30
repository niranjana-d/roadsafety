/**
 * Mock Chat Service — returns realistic AI responses based on keyword matching
 */
import type { ChatMessage, Citation, SuggestedQuestion } from '../../types/chat';
import { STATE_BY_CODE } from '../../constants/states';

const MOCK_RESPONSES: Record<string, { answer: string; citations: Citation[] }> = {
  speed: {
    answer: 'In Mumbai (urban area), the speed limit is **50 km/h** for cars and two-wheelers, and **40 km/h** for heavy/commercial vehicles. On expressways within Maharashtra it rises to **100–120 km/h**. Exceeding these limits attracts a fine of ₹1,000–₹2,000 under MVA §183.',
    citations: [{ id: 'c1', section: '§183', act: 'MVA 2019', title: 'Driving at excessive speed', lawId: 'speeding' }],
  },
  helmet: {
    answer: 'Not wearing an ISI-certified helmet in Maharashtra carries a fine of **₹1,000 for a first offence** and **₹2,000 for a repeat offence** under Section 129 of the Motor Vehicles Act, 2019. This applies to both rider and pillion passenger. Your licence may also be suspended for 3 months on repeat offences.',
    citations: [{ id: 'c2', section: '§129', act: 'MVA 2019', title: 'Safety measures for two-wheeler riders', lawId: 'no-helmet' }],
  },
  dui: {
    answer: 'Drunk driving in Maharashtra (BAC > 30 mg/100 ml) attracts a fine of **₹10,000** and/or imprisonment up to **6 months** for a first offence under MVA §185. For a second offence within 3 years, the fine goes up to ₹15,000 with 2 years imprisonment. The legal BAC limit applies to all vehicle types.',
    citations: [{ id: 'c3', section: '§185', act: 'MVA 2019', title: 'Driving by a drunken person', lawId: 'dui' }],
  },
  document: {
    answer: 'Required documents while driving in Maharashtra:\n\n1. **Valid Driving Licence** (physical or DigiLocker)\n2. **Vehicle Registration Certificate (RC)**\n3. **Valid Insurance Certificate**\n4. **Pollution Under Control (PUC) Certificate**\n5. **Vehicle Permit** (for commercial vehicles)\n\nPenalty for missing documents ranges from ₹500–₹5,000 under various sections of the MVA.',
    citations: [{ id: 'c4', section: '§130/158', act: 'MVA 2019', title: 'Documents to be carried while driving', lawId: 'no-licence' }],
  },
  seatbelt: {
    answer: 'Not wearing a seatbelt while driving in Maharashtra attracts a fine of **₹1,000** under Section 194B of the Motor Vehicles Act, 2019. This applies to both the driver and front-seat passenger. Rear seatbelt rules are being enforced in some states.',
    citations: [{ id: 'c5', section: '§194B', act: 'MVA 2019', title: 'Wearing of seatbelt', lawId: 'no-seatbelt' }],
  },
  signal: {
    answer: 'Jumping a red traffic signal in Maharashtra attracts a fine of **₹5,000** for the first offence and up to **₹10,000** for repeat offences under Section 119 of the MVA 2019. This is one of the heaviest fines as signal jumping is a major cause of accidents.',
    citations: [{ id: 'c6', section: '§119', act: 'MVA 2019', title: 'Disobedience of traffic signs', lawId: 'signal-jumping' }],
  },
  parking: {
    answer: 'Wrong parking or parking in a no-parking zone attracts a fine of **₹500** for the first offence, with towing charges of up to ₹1,500 additionally. In Delhi, the fine is higher at **₹750** for first offence.',
    citations: [{ id: 'c7', section: '§122', act: 'MVA 2019', title: 'Leaving vehicle in dangerous position', lawId: 'wrong-parking' }],
  },
  insurance: {
    answer: 'Driving without valid third-party motor insurance in India attracts a fine of **₹2,000 for first offence** and **₹4,000 for repeat offence** under Section 196 of the MVA 2019. Third-party insurance is mandatory for all registered motor vehicles.',
    citations: [{ id: 'c8', section: '§196', act: 'MVA 2019', title: 'Driving without insurance', lawId: 'no-insurance' }],
  },
  mobile: {
    answer: 'Using a mobile phone while driving attracts a fine of **₹5,000** under Section 184 of the MVA 2019. This includes texting, calling, and using apps unless via a hands-free device. Repeat offences may lead to licence suspension.',
    citations: [{ id: 'c9', section: '§184', act: 'MVA 2019', title: 'Dangerous driving', lawId: 'mobile-phone' }],
  },
};

const DEFAULT_RESPONSE: { answer: string; citations: Citation[] } = {
  answer: "That's a great question about traffic law! Based on the Motor Vehicles (Amendment) Act, 2019 applicable in your selected state, I can help you with specific fine amounts and legal sections. Could you be more specific about the violation type or location?",
  citations: [{ id: 'c0', section: 'General', act: 'MVA 2019', title: 'Motor Vehicles Act', lawId: '' }],
};

/**
 * Get a mock AI response based on keyword matching
 */
export function getMockChatResponse(
  query: string,
  stateCode: string
): Promise<{ answer: string; citations: Citation[] }> {
  return new Promise((resolve) => {
    // Simulate network delay
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const q = query.toLowerCase();
      const codeUpper = stateCode.toUpperCase();
      const stateObj = STATE_BY_CODE[codeUpper] || { name: 'Maharashtra', code: 'MH', capital: 'Mumbai' };

      // 1. Intercept location query
      const isLocationQuery = ["current location", "where am i", "my location", "which city", "what city"].some(kw => q.includes(kw));
      const isViolationQuery = ["speed", "helmet", "signal", "seatbelt", "drunk", "drink", "alcohol", "dui", "phone", "mobile", "park", "insur", "licence", "license", "puc", "pollution", "overload", "danger", "rash", "wrong side", "registr", "horn", "honk"].some(kw => q.includes(kw));

      if (isLocationQuery && !isViolationQuery) {
        const answer = `Your active location context is set to **${stateObj.name} (${stateObj.code})**. All calculations, laws, and citations will be filtered for this state. You can update this context at any time using the location selector in the top bar.`;
        const citations: Citation[] = [{
          id: 'cite-location',
          section: 'Location Settings',
          act: 'DriveLegal Configuration',
          title: 'State Context',
          lawId: ''
        }];
        resolve({ answer, citations });
        return;
      }

      // 2. Intercept active challan query
      if (["active challan", "pending fine", "my challan", "challan to pay", "fines to pay", "any challan"].some(kw => q.includes(kw))) {
        const answer = `Please enter your vehicle registration number (e.g., MH12AB1234 or TN01AB1234) in the chat, and I will query the Parivahan E-Challan database in real-time for any pending fines.`;
        resolve({ answer, citations: [] });
        return;
      }

      // 3. Normal keyword-based mock matching
      let response = { ...DEFAULT_RESPONSE };
      const keywords = Object.keys(MOCK_RESPONSES);
      for (const keyword of keywords) {
        if (q.includes(keyword)) {
          response = { ...MOCK_RESPONSES[keyword] };
          break;
        }
      }

      // Additional keyword variations
      if (q.includes('limit')) response = { ...MOCK_RESPONSES.speed };
      else if (q.includes('drunk') || q.includes('alcohol')) response = { ...MOCK_RESPONSES.dui };
      else if (q.includes('licence') || q.includes('license') || q.includes('carry')) response = { ...MOCK_RESPONSES.document };
      else if (q.includes('phone') || q.includes('call')) response = { ...MOCK_RESPONSES.mobile };
      else if (q.includes('park')) response = { ...MOCK_RESPONSES.parking };
      else if (q.includes('belt')) response = { ...MOCK_RESPONSES.seatbelt };
      else if (q.includes('red light') || q.includes('traffic light')) response = { ...MOCK_RESPONSES.signal };

      // 4. Dynamically replace Maharashtra and Mumbai/Pune with the user's active state details
      if (response.answer !== DEFAULT_RESPONSE.answer) {
        const stateName = stateObj.name;
        const cityName = stateObj.capital || 'Mumbai';
        response.answer = response.answer
          .replace(/Maharashtra/g, stateName)
          .replace(/Mumbai/g, cityName)
          .replace(/Pune/g, cityName);
      }

      resolve(response);
    }, delay);
  });
}

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { id: 'sq1', text: 'Speed limit in my city?', textHi: 'मेरे शहर में गति सीमा?', category: 'speed' },
  { id: 'sq2', text: 'Helmet fine amount?', textHi: 'हेलमेट का जुर्माना?', category: 'safety' },
  { id: 'sq3', text: 'DUI penalty?', textHi: 'शराब पीकर गाड़ी चलाने का दंड?', category: 'dui' },
  { id: 'sq4', text: 'Documents to carry?', textHi: 'कौन से दस्तावेज़ रखने हैं?', category: 'documents' },
  { id: 'sq5', text: 'Signal jumping fine?', textHi: 'सिग्नल तोड़ने का जुर्माना?', category: 'safety' },
  { id: 'sq6', text: 'Mobile phone fine?', textHi: 'मोबाइल फोन का जुर्माना?', category: 'safety' },
  { id: 'sq7', text: 'Insurance penalty?', textHi: 'बीमा न होने पर जुर्माना?', category: 'insurance' },
  { id: 'sq8', text: 'Parking violation fine?', textHi: 'गलत पार्किंग का जुर्माना?', category: 'parking' },
];

export const OFFLINE_FAQ: { question: string; answer: string }[] = [
  { question: 'What is the national speed limit?', answer: 'Urban: 50 km/h for cars. Highway: 100-120 km/h. Heavy vehicles: 40 km/h urban, 80 km/h highway.' },
  { question: 'What documents must I carry?', answer: 'Driving licence, RC, insurance, PUC certificate. Commercial vehicles also need a permit.' },
  { question: 'Emergency numbers?', answer: 'Police: 100, Ambulance: 108, Fire: 101, Road Helpline: 1033, Unified Emergency: 112' },
];
