import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Box, Flex } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useChat } from "@/hooks/useChat";
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

// Chat component that handles individual conversations
const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
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
    conversations,
    sendMessage,
    clearConversation,
    retryLastMessage,
    switchConversation,
    createNewConversation,
    apiStatus,
    // Flow tracking data
    flowData,
    currentStep,
    flowSteps,
    isFlowProcessing,
    clearFlow,
    // Conversations loading state
    conversationsLoading,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle conversation switching via URL
  const handleSelectConversation = useCallback(
    (newConversationId: string) => {
      navigate(`/chat/${newConversationId}`);
      switchConversation(newConversationId);
      clearFlow();
      // Keep sidebar open - don't close it when selecting conversations
    },
    [navigate, switchConversation, clearFlow],
  );

  const handleNewChat = useCallback(() => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/chat/${newConversationId}`);
    createNewConversation();
    clearFlow();
  }, [navigate, createNewConversation, clearFlow]);

  const toggleSidebar = useCallback(() => {
    console.log("Toggling sidebar from", sidebarOpen, "to", !sidebarOpen);
    setSidebarOpen((prev) => !prev);
  }, [sidebarOpen]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || isLoading) return;
    await sendMessage();
  }, [input, isTyping, isLoading, sendMessage]);

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
          currentConversationId={conversationId || null}
          onSelectConversation={handleSelectConversation}
          onCreateNew={handleNewChat}
          isLoading={conversationsLoading}
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
          flowData={flowData?.steps || flowSteps}
          isProcessing={isFlowProcessing}
        />
      </Flex>
    </ErrorBoundary>
  );
};

// Redirect component for root path
const RootRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Create a new conversation and redirect to it
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/chat/${newConversationId}`, { replace: true });
  }, [navigate]);

  return null;
};

// Main App component with routing
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default App;
