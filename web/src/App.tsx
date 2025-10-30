/* eslint-disable no-console */
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
  ProcessingStepsIndicator,
} from "@/components";
import { THEME_CONFIG } from "@/theme/constants";
import { useThemeColors } from "@/theme/colors";
import { ChatProvider, useChatContext } from "@/contexts";

// Chat component that handles individual conversations
const Chat: React.FC = () => {
  const [showFlowVisualizer, setShowFlowVisualizer] = useState(false);
  const colors = useThemeColors();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    processingSteps,
    files,
    setFiles,
  } = useChat();

  // Scroll to bottom when messages, typing state, or processing steps change
  useEffect(() => {
    if (messagesEndRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, processingSteps]);

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
          ref={scrollContainerRef}
          flex="1"
          overflowY="auto"
          bg={colors.background.primary}
          px={THEME_CONFIG.CONTENT_PADDING}
          py={THEME_CONFIG.MESSAGE_PADDING}
        >
          <Box maxW={THEME_CONFIG.MAX_CONTENT_WIDTH} mx="auto">
            {messageList}
            {processingSteps.length > 0 && (
              <ProcessingStepsIndicator
                steps={processingSteps}
                isVisible={isTyping || isLoading}
              />
            )}
            <div ref={messagesEndRef} />
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
              files={files}
              onFilesChange={setFiles}
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

  const { conversations, conversationsLoading, deleteConversation } =
    useChatContext();

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        // If the deleted conversation was the current one, navigate to home
        if (conversationId === id) {
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    },
    [deleteConversation, conversationId, navigate],
  );

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
        onDeleteConversation={handleDeleteConversation}
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleConversationComplete = useCallback(
    (conversationId: string) => {
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
    processingSteps,
    files,
    setFiles,
  } = useChat(handleConversationComplete);

  // Scroll to bottom when messages, typing state, or processing steps change
  useEffect(() => {
    if (messagesEndRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, processingSteps]);

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
          ref={scrollContainerRef}
          flex="1"
          overflowY="auto"
          bg={colors.background.primary}
          px={THEME_CONFIG.CONTENT_PADDING}
          py={THEME_CONFIG.MESSAGE_PADDING}
        >
          <Box maxW={THEME_CONFIG.MAX_CONTENT_WIDTH} mx="auto">
            {messageList}
            {processingSteps.length > 0 && (
              <ProcessingStepsIndicator
                steps={processingSteps}
                isVisible={isTyping || isLoading}
              />
            )}
            <div ref={messagesEndRef} />
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
              files={files}
              onFilesChange={setFiles}
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
