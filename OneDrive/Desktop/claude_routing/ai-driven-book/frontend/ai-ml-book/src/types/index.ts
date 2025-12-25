// Custom TypeScript types for AI Interactive Book extensions

// Chatbot integration types
export interface ChatbotMessage {
  id: string;
  content: string;
  timestamp: Date;
  role: 'user' | 'assistant' | 'system';
  references?: BookReference[];
}

// Book content references
export interface BookReference {
  chapter: string;
  section: string;
  page?: number;
  excerpt: string;
  url?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Chatbot API types
export interface ChatRequest {
  message: string;
  context?: {
    chapter?: string;
    section?: string;
    previousMessages?: ChatbotMessage[];
  };
  assistanceLevel?: 1 | 2 | 3;
}

export interface ChatResponse {
  message: string;
  references: BookReference[];
  conversationId?: string;
  assistanceLevel: number;
  confidence: number;
}

// Book content types
export interface BookContent {
  title: string;
  chapters: Chapter[];
  metadata: BookMetadata;
}

export interface Chapter {
  title: string;
  slug: string;
  order: number;
  sections: Section[];
  exercises?: Exercise[];
}

export interface Section {
  title: string;
  slug: string;
  content: string;
  codeBlocks?: CodeBlock[];
  images?: Image[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  codeTemplate?: string;
  solution?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  output?: string;
  editable?: boolean;
}

export interface Image {
  src: string;
  alt: string;
  caption?: string;
}

export interface BookMetadata {
  version: string;
  lastUpdated: Date;
  totalChapters: number;
  totalPages?: number;
}

// User preferences and state
export interface UserPreferences {
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  showCodeOutput: boolean;
  enableAnimations: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface ReadingProgress {
  currentChapter: string;
  currentSection: string;
  completedSections: string[];
  bookmarks: Bookmark[];
  lastActivity: Date;
}

export interface Bookmark {
  id: string;
  chapter: string;
  section: string;
  note?: string;
  timestamp: Date;
}

// API client configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
}

export interface StreamingResponse extends ChatbotMessage {
  isStreaming: boolean;
  partial: boolean;
}