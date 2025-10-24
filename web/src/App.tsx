import React, { useRef, useState, useCallback, useMemo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
  Navigate,
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
import { ChatProvider, useChatContext } from "@/contexts";

// Chat component that handles individual conversations
const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [showFlowVisualizer, setShowFlowVisualizer] = useState(false);
  const colors = useThemeColors();

  console.log("💬 Chat component mounted with conversationId:", conversationId);

  const {
    messages,
    input,
    setInput,
    isTyping,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
    apiStatus,
    // Flow tracking data
    flowData,
    currentStep,
    flowSteps,
    isFlowProcessing,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || isLoading) return;
    await sendMessage();
  }, [input, isTyping, isLoading, sendMessage]);

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
      <Flex height="100vh" bg={colors.background.primary} direction="column">
        <ChatHeader
          apiStatus={apiStatus}
          onClear={clearConversation}
          onRetry={error ? retryLastMessage : undefined}
          hasError={!!error}
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

// Shared layout component that contains sidebar and main content
const ChatLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const colors = useThemeColors();

  const { conversations, conversationsLoading } = useChatContext();

  const mainContentStyles = {
    flex: "1",
    ml: sidebarOpen ? "320px" : "60px",
    transition: "margin-left 0.3s ease",
    minH: "100vh",
    display: "flex",
    flexDirection: "column" as const,
  };

  return (
    <Flex h="100vh" bg={colors.background.secondary}>
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        isLoading={conversationsLoading}
        currentConversationId={conversationId || null}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectConversation={(conversationId) =>
          navigate(`/chat/${conversationId}`)
        }
        onCreateNew={() => navigate("/")}
      />

      {/* Main Content */}
      <Flex {...mainContentStyles}>{children}</Flex>
    </Flex>
  );
};

// Home page component for creating new chats
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showFlowVisualizer, setShowFlowVisualizer] = useState(false);
  const colors = useThemeColors();

  console.log("🏠 HomePage component mounted");

  const handleConversationComplete = useCallback(
    (conversationId: string) => {
      console.log(
        "🚀 HomePage: Conversation completed, navigating to:",
        conversationId,
      );
      navigate(`/chat/${conversationId}`);
    },
    [navigate],
  );

  const {
    messages,
    input,
    setInput,
    isTyping,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
    apiStatus,
    // Flow tracking data
    flowData,
    currentStep,
    flowSteps,
    isFlowProcessing,
  } = useChat(handleConversationComplete);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || isLoading) return;
    await sendMessage();
  }, [input, isTyping, isLoading, sendMessage]);

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
      <Flex height="100vh" bg={colors.background.primary} direction="column">
        <ChatHeader
          apiStatus={apiStatus}
          onClear={clearConversation}
          onRetry={error ? retryLastMessage : undefined}
          hasError={!!error}
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

// Main App component with routing
const App: React.FC = () => {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ChatLayout>
                <HomePage />
              </ChatLayout>
            }
          />
          <Route
            path="/chat/:conversationId"
            element={
              <ChatLayout>
                <Chat />
              </ChatLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
};

export default App;
