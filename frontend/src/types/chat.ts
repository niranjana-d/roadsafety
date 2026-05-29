/**
 * Chat-related types
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  citations?: Citation[];
  feedback?: 'up' | 'down' | null;
  isOfflineQueued?: boolean;
  language?: string;
}

export interface Citation {
  id: string;
  section: string;
  act: string;
  title: string;
  lawId?: string; // link to law detail
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  locationContext: {
    stateCode: string;
    stateName: string;
    city: string;
  };
  language: string;
  createdAt: number;
  updatedAt: number;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  textHi: string;
  category: string;
}
