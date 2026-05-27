/**
 * App-wide configuration
 */

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
  ],

  // Supported languages
  languages: [
    { code: 'en', name: 'English', nameLocal: 'English', rtl: false },
    { code: 'hi', name: 'Hindi', nameLocal: 'हिन्दी', rtl: false },
  ],

  // Default location
  defaultLocation: {
    country: 'IN',
    stateCode: 'MH',
    city: 'Mumbai',
  },

  // Government payment portals by state
  paymentPortals: {
    MH: 'https://mahatrafficechallan.gov.in/',
    DL: 'https://delhitrafficpolice.nic.in/e-challan/',
    KA: 'https://ksp.karnataka.gov.in/',
    TN: 'https://tnpolice.gov.in/',
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
