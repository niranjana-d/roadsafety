/**
 * E-Challan Service — Interface and Mock Service
 * Ready for real-world backend API integration
 */
import { APP_CONFIG } from '../constants/config';

export interface Challan {
  id: string;
  challanNumber: string;
  vehicleNumber: string;
  violationName: string;
  location: string;
  amount: number;
  status: 'pending' | 'paid';
  issuedAt: number;
  deadlineAt: number;
  section: string;
  act: string;
  consequences: string;
}

const MOCK_CHALLANS: Record<string, Challan[]> = {
  'TN01AB1234': [
    {
      id: 'ch-001',
      challanNumber: 'TN-58392-2026',
      vehicleNumber: 'TN01AB1234',
      violationName: 'Over-Speeding',
      location: 'Anna Salai (Anna Road), Chennai',
      amount: 1000,
      status: 'pending',
      issuedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      deadlineAt: Date.now() + 10 * 24 * 60 * 60 * 1000, // 10 days left
      section: '§183',
      act: 'Motor Vehicles Act 2019',
      consequences: 'Deduction of 2 license points. Repeat offense will attract double the fine and possible license suspension for 3 months.',
    },
    {
      id: 'ch-002',
      challanNumber: 'TN-19402-2026',
      vehicleNumber: 'TN01AB1234',
      violationName: 'Riding Without Helmet',
      location: 'T. Nagar Metro Jn, Chennai',
      amount: 1000,
      status: 'pending',
      issuedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      deadlineAt: Date.now() + 13 * 24 * 60 * 60 * 1000, // 13 days left
      section: '§129',
      act: 'Motor Vehicles Act 2019',
      consequences: 'Suspension of driving license for up to 3 months on failure to pay before the deadline or court summoning.',
    }
  ]
};

/**
 * Fetch pending challans for a vehicle.
 * Ready to hook up to your actual API when backend is ready.
 */
export async function checkPendingChallans(vehicleNumber: string): Promise<Challan[]> {
  const formattedPlate = vehicleNumber.toUpperCase().replace(/\s+/g, '').trim();

  // If using mocks, return mock challans
  if (APP_CONFIG.features.useMocks) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_CHALLANS[formattedPlate] || []);
      }, 1000); // simulate network latency
    });
  }

  // Ready for backend integration
  try {
    const response = await fetch(`${APP_CONFIG.api.baseUrl}${APP_CONFIG.endpoints.user}/challans?plate=${formattedPlate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Challan API returned non-200 response.');
    }
    const data = await response.json();
    return data.challans || [];
  } catch (error) {
    console.error('Failed to fetch from E-Challan API, falling back to empty list:', error);
    // In production, we might want to throw or return cached details
    return [];
  }
}
