/* eslint-disable no-console */
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Message,
  UseChatReturn,
  Conversation,
  FlowData,
  ChatResponse,
} from "@/types";
import { chatService } from "@/services/chatService";
import { THEME_CONFIG } from "@/theme/constants";
import { useFlowTracking } from "./useFlowTracking";
import { useChatContext } from "@/contexts";

export const useChat = (
  onConversationComplete?: (_conversationId: string) => void,
): UseChatReturn => {
  const { conversationId: urlConversationId } = useParams<{
    conversationId: string;
  }>();
  console.log(
    "🎯 useChat: Hook initialized with urlConversationId:",
    urlConversationId,
  );
  const {
    conversations,
    conversationsLoading,
    apiStatus,
    refreshConversations,
    addConversation,
  } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(
    () => urlConversationId || "",
  );
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [processingSteps, setProcessingSteps] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      status: "pending" | "active" | "completed" | "error" | "skipped";
      timestamp?: string;
      data?: any;
    }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNewConversationRef = useRef(false);
  const initializedRef = useRef<string | false>(false);

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

  // Load messages for a specific conversation
  const loadConversationMessages = useCallback(
    async (conversationId: string) => {
      // Prevent multiple API calls for the same conversation
      const loadingKey = `loading-${conversationId}`;
      if (initializedRef.current === loadingKey) {
        console.log(
          "⚠️ useChat: Already loading conversation, skipping:",
          conversationId,
        );
        return;
      }

      try {
        console.log("Loading messages for conversation:", conversationId);
        initializedRef.current = loadingKey;
        // Don't set isLoading to true - keep the list visible
        setError(null);

        // Load messages for the specified conversation
        const response = await chatService.getConversation(conversationId);
        console.log("Loaded messages:", response.messages.length);
        setMessages(response.messages);

        // Find and set current conversation
        const conversation = conversations.find((c) => c.id === conversationId);
        setCurrentConversation(conversation || null);
      } catch (err) {
        console.error("Failed to load conversation messages:", err);
        // If conversation doesn't exist, show empty state instead of error
        setMessages([]);
        setCurrentConversation(null);
        setError(null); // Don't show error for non-existent conversations
      }
    },
    [conversations],
  );

  // Handle URL conversation changes
  useEffect(() => {
    if (!urlConversationId || urlConversationId === conversationId) {
      return;
    }

    // Prevent multiple initializations for the same conversation
    const effectKey = `url-${urlConversationId}`;
    if (initializedRef.current === effectKey) {
      console.log(
        "⚠️ useChat: Already processed URL change, skipping:",
        urlConversationId,
      );
      return;
    }

    console.log("Loading conversation from URL:", urlConversationId);
    initializedRef.current = effectKey;
    setConversationId(urlConversationId);
    // Load the conversation messages
    loadConversationMessages(urlConversationId);
  }, [urlConversationId, conversationId, loadConversationMessages]);

  // Load conversation when URL changes and conversations are loaded
  useEffect(() => {
    if (!urlConversationId || conversations.length === 0) {
      return;
    }

    // Prevent multiple initializations for the same conversation
    const effectKey = `${urlConversationId}-${conversations.length}`;
    if (initializedRef.current === effectKey) {
      console.log(
        "⚠️ useChat: Already loaded conversation, skipping:",
        urlConversationId,
      );
      return;
    }

    console.log(
      "Conversations loaded, checking if URL conversation exists:",
      urlConversationId,
    );
    initializedRef.current = effectKey;

    const conversationExists = conversations.some(
      (c) => c.id === urlConversationId,
    );
    if (conversationExists) {
      loadConversationMessages(urlConversationId);
    } else {
      console.log("Conversation not found in list, loading directly from API");
      loadConversationMessages(urlConversationId);
    }
  }, [urlConversationId, conversations, loadConversationMessages]);

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
  const createNewConversation = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create conversation: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const newConversationId = data.conversationId;

      setConversationId(newConversationId);
      setMessages([]);
      setCurrentConversation(null);
      setError(null);

      // Refresh conversations list to include the new conversation
      await refreshConversations();

      return newConversationId;
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to create new conversation");
      return null;
    }
  }, [refreshConversations]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || isLoading) return;

    // If no conversation ID, create a new conversation first
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      try {
        const response = await fetch(`http://localhost:5000/api/chat/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to create conversation: ${response.statusText}`,
          );
        }

        const data = await response.json();
        currentConversationId = data.conversationId;
        setConversationId(currentConversationId);

        // Mark that this is a new conversation
        isNewConversationRef.current = true;

        // Add new conversation to the list with animation
        addConversation({
          id: data.conversationId,
          title: data.title || "New Conversation",
          createdAt: data.timestamp,
          updatedAt: data.timestamp,
          _count: { messages: 0 },
        });
      } catch (err) {
        console.error("Error creating conversation:", err);
        setError("Failed to create new conversation");
        setIsLoading(false);
        setIsTyping(false);
        return;
      }
    }

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
    setStep("api-call", {
      message: input.trim(),
      conversationId: currentConversationId,
    });

    // Clear previous processing steps
    setProcessingSteps([]);

    try {
      // Use streaming API for real-time updates
      await (chatService as any).sendMessageStream(
        input.trim(),
        currentConversationId,
        {
          onStep: (step: any) => {
            setProcessingSteps((prev) => {
              const existingIndex = prev.findIndex((s) => s.id === step.id);
              if (existingIndex >= 0) {
                // Update existing step
                const updated = [...prev];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  ...step,
                };
                return updated;
              } else {
                // Add new step
                return [...prev, step];
              }
            });
          },
          onComplete: (response: ChatResponse) => {
            // Process flow data from backend
            if (response.flowData) {
              setFlowData(response.flowData);
            }

            // Complete API call step
            completeStep("api-call");

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

                // Clear processing steps after a short delay
                setTimeout(() => {
                  setProcessingSteps([]);
                }, 1000);

                // Complete UI update step
                setStep("ui-update", { message: response.reply });
                completeStep("ui-update");
                completeFlow();

                // Call the callback if this was a new conversation
                if (isNewConversationRef.current && onConversationComplete) {
                  console.log(
                    "🚀 useChat: Calling onConversationComplete for:",
                    currentConversationId,
                  );
                  onConversationComplete(currentConversationId);
                  isNewConversationRef.current = false; // Reset the flag
                }
              },
              THEME_CONFIG.TYPING_DELAY_MIN +
                Math.random() *
                  (THEME_CONFIG.TYPING_DELAY_MAX -
                    THEME_CONFIG.TYPING_DELAY_MIN),
            );
          },
          onError: (error: Error) => {
            console.error("Stream error:", error);
            // Fallback to regular API if streaming fails
            return chatService
              .sendMessage(input.trim(), currentConversationId)
              .then((response) => {
                if (response.flowData) {
                  setFlowData(response.flowData);
                }
                const botMsg: Message = {
                  sender: "bot",
                  text: response.reply,
                  timestamp: response.timestamp || new Date().toISOString(),
                };
                setMessages((prev) => [...prev, botMsg]);
                setIsTyping(false);
                setIsLoading(false);
                setProcessingSteps([]);
                completeFlow();
              })
              .catch((fallbackErr) => {
                throw fallbackErr;
              });
          },
        },
      );

      // Complete API call step
      completeStep("api-call");
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
        setProcessingSteps([]);
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
    addConversation,
    onConversationComplete,
  ]);

  const clearConversation = useCallback(async () => {
    console.log("🗑️ useChat: clearConversation called for:", conversationId);
    try {
      await chatService.clearConversation(conversationId);
      setMessages([]);
      setError(null);
      // Refresh conversations list
      try {
        console.log(
          "🔄 useChat: Calling refreshConversations from clearConversation",
        );
        await refreshConversations();
      } catch (err) {
        console.error("Failed to refresh conversations:", err);
      }
    } catch (err) {
      console.error("Failed to clear conversation:", err);
      setError("Failed to clear conversation. Please try again.");
    }
  }, [conversationId, refreshConversations]);

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

  const loadConversations = useCallback(async () => {
    await refreshConversations();
  }, [refreshConversations]);

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
    // Processing steps for real-time UI
    processingSteps,
    // Conversations loading state
    conversationsLoading,
  };
};
