import { useState, useEffect, useRef, useCallback } from "react";
import {
  Message,
  UseChatReturn,
  ApiHealthResponse,
  Conversation,
  FlowData,
} from "@/types";
import { chatService } from "@/services/chatService";
import { THEME_CONFIG } from "@/theme/constants";
import { useFlowTracking } from "./useFlowTracking";

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(
    () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiHealthResponse | null>(null);
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Flow tracking hook
  const {
    currentStep,
    flowSteps,
    isProcessing: isFlowProcessing,
    startFlow,
    setStep,
    completeStep,
    errorStep,
    completeFlow,
    clearFlow,
  } = useFlowTracking();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    try {
      const response = await chatService.getAllConversations();
      setConversations(response.conversations);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  // Load conversations and check API status on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check API status
        const status = await chatService.checkHealth();
        setApiStatus(status);

        // Load conversations
        await loadConversations();
      } catch (err) {
        setApiStatus({
          status: "error",
          timestamp: new Date().toISOString(),
          message: "API not reachable",
        });
      }
    };

    initializeChat();
  }, [loadConversations]);

  // Switch to a different conversation
  const switchConversation = useCallback(
    async (newConversationId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Load messages for the selected conversation
        const response = await chatService.getConversation(newConversationId);
        setMessages(response.messages);
        setConversationId(newConversationId);

        // Find and set current conversation
        const conversation = conversations.find(
          (c) => c.id === newConversationId,
        );
        setCurrentConversation(conversation || null);
      } catch (err) {
        console.error("Failed to switch conversation:", err);
        setError("Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    },
    [conversations],
  );

  // Create a new conversation
  const createNewConversation = useCallback(() => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(newConversationId);
    setMessages([]);
    setCurrentConversation(null);
    setError(null);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || isLoading) return;

    const userMsg: Message = {
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);
    setIsLoading(true);

    // Start flow tracking
    startFlow();
    setStep("user-input", { message: input.trim() });
    completeStep("user-input");
    setStep("input-processing", { message: input.trim() });
    completeStep("input-processing");
    setStep("api-call", { message: input.trim(), conversationId });

    try {
      const response = await chatService.sendMessage(
        input.trim(),
        conversationId,
      );

      // Complete API call step
      completeStep("api-call");

      // Process flow data from backend
      if (response.flowData) {
        setFlowData(response.flowData);

        // Update flow steps with backend data
        response.flowData.steps.forEach((step) => {
          setStep(step.id, step.data);
          if (step.status === "completed") {
            completeStep(step.id, step.duration);
          } else if (step.status === "error") {
            errorStep(step.id, step.data?.error || "Unknown error");
          }
        });
      }

      // Simulate typing delay for more realistic feel
      setTimeout(
        async () => {
          const botMsg: Message = {
            sender: "bot",
            text: response.reply,
            timestamp: response.timestamp || new Date().toISOString(),
          };

          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
          setIsLoading(false);

          // Complete UI update step
          setStep("ui-update", { message: response.reply });
          completeStep("ui-update");
          completeFlow();

          // Refresh conversations list to show updated conversation
          try {
            const conversationsResponse =
              await chatService.getAllConversations();
            setConversations(conversationsResponse.conversations);
          } catch (err) {
            console.error("Failed to refresh conversations:", err);
          }
        },
        THEME_CONFIG.TYPING_DELAY_MIN +
          Math.random() *
            (THEME_CONFIG.TYPING_DELAY_MAX - THEME_CONFIG.TYPING_DELAY_MIN),
      );
    } catch (err) {
      console.error("Chat error:", err);

      // Mark API call as error
      errorStep(
        "api-call",
        err instanceof Error ? err.message : "Unknown error",
      );

      setTimeout(() => {
        const errorMsg =
          "⚠️ Sorry, I'm having trouble connecting. Please try again in a moment.";
        const errorBotMsg: Message = {
          sender: "bot",
          text: errorMsg,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorBotMsg]);
        setIsTyping(false);
        setIsLoading(false);
        setError(errorMsg);
        completeFlow();
      }, THEME_CONFIG.TYPING_DELAY_MIN);
    }
  }, [
    input,
    isTyping,
    isLoading,
    conversationId,
    startFlow,
    setStep,
    completeStep,
    errorStep,
    completeFlow,
  ]);

  const clearConversation = useCallback(async () => {
    try {
      await chatService.clearConversation(conversationId);
      setMessages([]);
      setError(null);
      // Refresh conversations list
      try {
        const conversationsResponse = await chatService.getAllConversations();
        setConversations(conversationsResponse.conversations);
      } catch (err) {
        console.error("Failed to refresh conversations:", err);
      }
    } catch (err) {
      console.error("Failed to clear conversation:", err);
      setError("Failed to clear conversation. Please try again.");
    }
  }, [conversationId]);

  const retryLastMessage = useCallback(() => {
    if (messages.length > 0 && error) {
      const lastUserMessage = messages
        .filter((msg) => msg.sender === "user")
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
    conversations,
    currentConversation,
    sendMessage,
    clearConversation,
    retryLastMessage,
    loadConversations,
    switchConversation,
    createNewConversation,
    apiStatus,
    // Flow tracking data
    flowData,
    currentStep,
    flowSteps,
    isFlowProcessing,
    clearFlow,
  };
};
