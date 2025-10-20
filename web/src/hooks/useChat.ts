import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, UseChatReturn, ApiHealthResponse } from '@/types';
import { chatService } from '@/services/chatService';

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId] = useState<string>(() => 
    `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [apiStatus, setApiStatus] = useState<ApiHealthResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const status = await chatService.checkHealth();
        setApiStatus(status);
      } catch (err) {
        setApiStatus({
          status: 'error',
          timestamp: new Date().toISOString(),
          message: 'API not reachable',
        });
      }
    };

    checkApiStatus();
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(input.trim(), conversationId);

      // Simulate typing delay for more realistic feel
      setTimeout(() => {
        const botMsg: Message = {
          sender: 'bot',
          text: response.reply,
          timestamp: response.timestamp || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // 1-2 second delay
    } catch (err) {
      console.error('Chat error:', err);
      setTimeout(() => {
        const errorMsg = '⚠️ Sorry, I\'m having trouble connecting. Please try again in a moment.';
        const errorBotMsg: Message = {
          sender: 'bot',
          text: errorMsg,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorBotMsg]);
        setIsTyping(false);
        setIsLoading(false);
        setError(errorMsg);
      }, 1000);
    }
  }, [input, isTyping, isLoading, conversationId]);

  const clearConversation = useCallback(async () => {
    try {
      await chatService.clearConversation(conversationId);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Failed to clear conversation:', err);
      setError('Failed to clear conversation. Please try again.');
    }
  }, [conversationId]);

  const retryLastMessage = useCallback(() => {
    if (messages.length > 0 && error) {
      const lastUserMessage = messages
        .filter((msg) => msg.sender === 'user')
        .pop();
      if (lastUserMessage) {
        setInput(lastUserMessage.text);
        setError(null);
      }
    }
  }, [messages, error]);

  return {
    messages,
    input,
    setInput,
    isTyping,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    retryLastMessage,
    apiStatus,
  };
};
