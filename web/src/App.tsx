import React, { useRef, useState, useCallback, useMemo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useChat } from "@/hooks/useChat";
import { useFlowTracking } from "@/hooks/useFlowTracking";
import {
  ChatHeader,
  ChatMessage,
  ChatInput,
  WelcomeMessage,
  TypingIndicator,
  Sidebar,
  ErrorBoundary,
  DataFlowVisualizer,
} from "@/components";
import { THEME_CONFIG } from "@/theme/constants";
import { useThemeColors } from "@/theme/colors";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFlowVisualizer, setShowFlowVisualizer] = useState(false);
  const colors = useThemeColors();

  const {
    messages,
    input,
    setInput,
    isTyping,
    isLoading,
    error,
    conversationId,
    conversations,
    sendMessage,
    clearConversation,
    retryLastMessage,
    switchConversation,
    createNewConversation,
    apiStatus,
  } = useChat();

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


  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewChat = useCallback(() => {
    createNewConversation();
    clearFlow();
  }, [createNewConversation, clearFlow]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    switchConversation(conversationId);
    clearFlow();
  }, [switchConversation, clearFlow]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);




  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || isLoading) return;

    // Start flow tracking
    startFlow();
    setStep("user-input", { message: input.trim() });

    // Track input processing
    setStep("input-processing", {
      conversationId,
      messageLength: input.trim().length
    });

    // Track API call
    setStep("api-call", {
      endpoint: "/api/chat",
      payload: { message: input.trim(), conversationId }
    });

    try {
      // Call the original sendMessage function
      await sendMessage();

      // Track successful completion of all steps
      setTimeout(() => {
        completeStep("api-call");
        setStep("backend-processing", { status: "processing" });
        completeStep("backend-processing");

        setStep("ai-processing", { status: "processing" });
        completeStep("ai-processing");

        setStep("response-return", { status: "processing" });
        completeStep("response-return");

        setStep("ui-update", { status: "processing" });
        completeStep("ui-update");

        completeFlow();
      }, 100);
    } catch (error) {
      errorStep("api-call", error instanceof Error ? error.message : "Unknown error");
    }
  }, [input, isTyping, isLoading, conversationId, sendMessage, startFlow, setStep, completeStep, errorStep, completeFlow]);


  const mainContentStyles = useMemo(
    () => ({
      flex: "1",
      direction: "column" as const,
      ml: { base: 0, md: sidebarOpen ? THEME_CONFIG.SIDEBAR_WIDTH : 0 },
      transition: THEME_CONFIG.TRANSITION_DURATION,
    }),
    [sidebarOpen],
  );

  const messageList = useMemo(
    () => (
      <>
        {messages.length === 0 && <WelcomeMessage />}
        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.timestamp}-${index}`}
            message={message}
            index={index}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </>
    ),
    [messages, isTyping],
  );


  return (
    <ErrorBoundary>
      <Flex height="100vh" bg={colors.background.primary}>
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          conversations={conversations}
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onCreateNew={handleNewChat}
          isLoading={isLoading}
        />

        {/* Main Content */}
        <Flex {...mainContentStyles}>
          <ChatHeader
            apiStatus={apiStatus}
            onClear={clearConversation}
            onRetry={error ? retryLastMessage : undefined}
            hasError={!!error}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onToggleFlow={() => setShowFlowVisualizer(!showFlowVisualizer)}
            showFlow={showFlowVisualizer}
          />

          <Box
            flex="1"
            overflowY="auto"
            bg={colors.background.primary}
            px={THEME_CONFIG.CONTENT_PADDING}
            py={THEME_CONFIG.MESSAGE_PADDING}
          >
            <Box maxW={THEME_CONFIG.MAX_CONTENT_WIDTH} mx="auto">
              {messageList}
            </Box>
          </Box>


          <Box
            bg={colors.background.primary}
            borderTop="1px"
            borderColor={colors.border.primary}
            px={THEME_CONFIG.CONTENT_PADDING}
            py={THEME_CONFIG.CONTENT_PADDING}
          >
            <Box maxW={THEME_CONFIG.MAX_CONTENT_WIDTH} mx="auto">
              <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSendMessage}
                disabled={isTyping}
                isTyping={isTyping}
                isLoading={isLoading}
              />
            </Box>
          </Box>
        </Flex>


        {/* Data Flow Visualizer */}
        <DataFlowVisualizer
          isVisible={showFlowVisualizer}
          onToggle={() => setShowFlowVisualizer(!showFlowVisualizer)}
          currentStep={currentStep || undefined}
          flowData={flowSteps}
          isProcessing={isFlowProcessing}
        />
      </Flex>
    </ErrorBoundary>
  );
};

export default App;
