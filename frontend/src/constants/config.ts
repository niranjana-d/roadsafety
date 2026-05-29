/**
 * App-wide configuration
 */

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    EXPO_PUBLIC_USE_MOCKS?: string;
    [key: string]: string | undefined;
  };
};

export const APP_CONFIG = {
  name: 'DriveLegal',
  tagline: 'Know Your Road Laws',
  version: '1.0.0',
  buildNumber: '1',

  // API configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.drivelegal.app',
    version: 'v1',
    timeout: 15000, // 15 seconds
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Feature flags
  features: {
    useMocks: process.env.EXPO_PUBLIC_USE_MOCKS !== 'false', // default to mocks
    enableVoiceInput: false, // coming soon
    enableMapIntegration: false, // coming soon
    enablePaymentLinks: true,
    enablePushNotifications: false, // requires backend
    enableAnalytics: false, // requires setup
  },

  // Cache TTLs (milliseconds)
  cache: {
    laws: 24 * 60 * 60 * 1000, // 24 hours
    fines: 24 * 60 * 60 * 1000,
    chatHistory: 7 * 24 * 60 * 60 * 1000, // 7 days
    userPreferences: Infinity, // never expire
    searchIndex: 12 * 60 * 60 * 1000, // 12 hours
  },

  // Offline settings
  offline: {
    maxQueueSize: 50,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    maxOfflineDataMB: 100,
  },

  // Supported countries (expandable)
  countries: [
    { code: 'IN', name: 'India', nameLocal: 'भारत', currency: '₹', currencyCode: 'INR', terminology: { challan: 'Challan', fine: 'Fine' } },
    { code: 'US', name: 'United States', nameLocal: 'United States', currency: '$', currencyCode: 'USD', terminology: { challan: 'Ticket', fine: 'Fine' } },
    { code: 'GB', name: 'United Kingdom', nameLocal: 'United Kingdom', currency: '£', currencyCode: 'GBP', terminology: { challan: 'Fixed Penalty Notice', fine: 'Fine' } },
    { code: 'CA', name: 'Canada', nameLocal: 'Canada', currency: '$', currencyCode: 'CAD', terminology: { challan: 'Ticket', fine: 'Fine' } },
    { code: 'AU', name: 'Australia', nameLocal: 'Australia', currency: '$', currencyCode: 'AUD', terminology: { challan: 'Fine Notice', fine: 'Fine' } },
    { code: 'DE', name: 'Germany', nameLocal: 'Deutschland', currency: '€', currencyCode: 'EUR', terminology: { challan: 'Bußgeldbescheid', fine: 'Geldbuße' } },
    { code: 'FR', name: 'France', nameLocal: 'France', currency: '€', currencyCode: 'EUR', terminology: { challan: 'Amende', fine: 'Amende' } },
    { code: 'AE', name: 'United Arab Emirates', nameLocal: 'الإمارات', currency: 'د.إ', currencyCode: 'AED', terminology: { challan: 'Ticket', fine: 'Fine' } },
    { code: 'SG', name: 'Singapore', nameLocal: 'Singapore', currency: '$', currencyCode: 'SGD', terminology: { challan: 'Traffic Ticket', fine: 'Fine' } },
    { code: 'JP', name: 'Japan', nameLocal: '日本', currency: '¥', currencyCode: 'JPY', terminology: { challan: '反則金', fine: '罰金' } },
  ],

  // Supported languages
  languages: [
    { code: 'en', name: 'English', nameLocal: 'English', rtl: false },
    { code: 'hi', name: 'Hindi', nameLocal: 'हिन्दी', rtl: false },
    { code: 'ta', name: 'Tamil', nameLocal: 'தமிழ்', rtl: false },
    { code: 'te', name: 'Telugu', nameLocal: 'తెలుగు', rtl: false },
    { code: 'ml', name: 'Malayalam', nameLocal: 'മലയാളം', rtl: false },
  ],

  // Default location
  defaultLocation: {
    country: 'IN',
    stateCode: 'TN',
    city: 'Chennai',
  },

  // Government payment portals by state and country
  paymentPortals: {
    MH: 'https://mahatrafficechallan.gov.in/',
    DL: 'https://delhitrafficpolice.nic.in/e-challan/',
    KA: 'https://ksp.karnataka.gov.in/',
    TN: 'https://tnpolice.gov.in/',
    UP: 'https://traffic.up.nic.in/',
    GJ: 'https://paychallan.gujarattrafficpolice.in/',
    KL: 'https://keralapolice.gov.in/page/e-challan',
    WB: 'https://kolkatatrafficpolice.gov.in/',
    US: 'https://www.govpaynow.com/',
    GB: 'https://www.gov.uk/pay-challenge-penalty-charge-notice',
    CA: 'https://www.ontario.ca/page/pay-ticket-or-fine',
    AU: 'https://www.revenue.nsw.gov.au/fines-and-fees/pay',
    DE: 'https://www.bussgeldkatalog.org/',
    FR: 'https://www.amendes.gouv.fr/',
    AE: 'https://www.dubaipolice.gov.ae/',
    SG: 'https://www.police.gov.sg/Advisories/Traffic/Pay-Fines',
    JP: 'https://www.police.pref.kanagawa.jp/',
    national: 'https://echallan.parivahan.gov.in/',
  } as Record<string, string>,

  // API endpoints (for future backend)
  endpoints: {
    rules: '/api/rules',
    rulesSearch: '/api/rules/search',
    fines: '/api/fines',
    compare: '/api/compare',
    states: '/api/states',
    categories: '/api/categories',
    chat: '/api/chat',
    chatHistory: '/api/chat/history',
    user: '/api/user',
    bookmarks: '/api/bookmarks',
    notifications: '/api/notifications',
    feedback: '/api/feedback',
    offlinePacks: '/api/offline/packs',
  },
} as const;

export type Country = typeof APP_CONFIG.countries[number];
export type Language = typeof APP_CONFIG.languages[number];
