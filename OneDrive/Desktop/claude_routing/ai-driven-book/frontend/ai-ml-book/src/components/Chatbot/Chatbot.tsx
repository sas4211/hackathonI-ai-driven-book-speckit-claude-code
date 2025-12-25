import React, { useState, useRef, useEffect } from 'react';
import { useBookStore } from '../store/bookStore';
import styles from './Chatbot.module.css';
import { ChatMessage, ChatResponse } from './types';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const progress = useBookStore((state) => state.progress);

  // Auto focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await sendChatMessage(userMessage.text);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendChatMessage = async (message: string): Promise<ChatMessage> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: 'session_' + Date.now(),
          context_level: 'medium'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      return {
        id: Date.now().toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(data.timestamp),
        citations: data.citations,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className={styles.chatbot}>
      {/* Chat Toggle Button */}
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <div className={styles.buttonContent}>
          <span className={styles.icon}>🤖</span>
          <span className={styles.text}>
            {isOpen ? 'Close' : 'Ask AI'} Assistant
          </span>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <h3>AI Learning Assistant</h3>
              <div className={styles.headerActions}>
                <button
                  className={styles.actionButton}
                  onClick={clearChat}
                  title="Clear chat"
                >
                  🗑️
                </button>
                <button
                  className={styles.actionButton}
                  onClick={toggleChat}
                  title="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className={styles.statusIndicator}>
              {isTyping ? (
                <span className={styles.typing}>AI is thinking...</span>
              ) : (
                <span className={styles.online}>Online</span>
              )}
            </div>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div className={styles.welcomeMessage}>
                <div className={styles.welcomeHeader}>
                  <span className={styles.welcomeIcon}>📚</span>
                  <h4>Welcome to Your AI Learning Assistant</h4>
                </div>
                <p>
                  I can help you understand concepts, explain code examples,
                  and find information from your AI & ML book content.
                </p>
                <div className={styles.suggestions}>
                  <button
                    className={styles.suggestionButton}
                    onClick={() => setInputValue("What is machine learning?")}
                  >
                    What is machine learning?
                  </button>
                  <button
                    className={styles.suggestionButton}
                    onClick={() => setInputValue("Explain the code example in Chapter 3")}
                  >
                    Explain the code example in Chapter 3
                  </button>
                  <button
                    className={styles.suggestionButton}
                    onClick={() => setInputValue("How do I implement linear regression?")}
                  >
                    How do I implement linear regression?
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.sender]}`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{message.text}</div>
                  <div className={styles.messageMeta}>
                    <span className={styles.timestamp}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.sender === 'bot' && message.confidence && (
                      <span className={styles.confidence}>
                        Confidence: {(message.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                    {message.error && (
                      <span className={styles.errorBadge}>Error</span>
                    )}
                  </div>
                  {message.citations && message.citations.length > 0 && (
                    <div className={styles.citations}>
                      <span className={styles.citationLabel}>Sources:</span>
                      {message.citations.map((citation, index) => (
                        <span key={index} className={styles.citation}>
                          {citation.chapter || 'Section'} • {citation.score?.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInput}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
                <button className={styles.retryButton} onClick={handleSendMessage}>
                  Retry
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className={styles.inputForm}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question..."
                className={styles.inputField}
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className={`${styles.sendButton} ${!inputValue.trim() || isTyping ? styles.disabled : ''}`}
              >
                {isTyping ? '⏳' : '➤'}
              </button>
            </form>
            <div className={styles.inputHint}>
              Tip: Ask about specific concepts, code examples, or chapters for best results
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;