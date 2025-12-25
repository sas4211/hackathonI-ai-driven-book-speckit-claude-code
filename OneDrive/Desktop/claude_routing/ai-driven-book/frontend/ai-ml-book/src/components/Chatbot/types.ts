export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  citations?: Citation[];
  confidence?: number;
  error?: boolean;
}

export interface Citation {
  chapter?: string;
  section?: string;
  source_id?: string;
  score?: number;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  citations: Citation[];
  confidence: number;
  tokens_used: number;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  context_level?: 'basic' | 'medium' | 'detailed';
  session_id?: string;
  code_content?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  isOpen: boolean;
}

export interface ChatProps {
  onSendMessage?: (message: string) => Promise<ChatMessage>;
  onClose?: () => void;
  onOpen?: () => void;
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatMessageProps {
  message: ChatMessage;
}

export interface ChatHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  isTyping: boolean;
}

export interface ChatSuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}