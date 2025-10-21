import React, { useRef, useState, useCallback, useMemo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useChat } from "@/hooks/useChat";
import {
  ChatHeader,
  ChatMessage,
  ChatInput,
  WelcomeMessage,
  TypingIndicator,
  Sidebar,
  ErrorBoundary,
} from "@/components";
import { THEME_CONFIG } from "@/theme/constants";
import { useThemeColors } from "@/theme/colors";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewChat = useCallback(() => {
    createNewConversation();
  }, [createNewConversation]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    switchConversation(conversationId);
  }, [switchConversation]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);


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
                onSend={sendMessage}
                disabled={isTyping}
                isTyping={isTyping}
                isLoading={isLoading}
              />
            </Box>
          </Box>
        </Flex>
      </Flex>
    </ErrorBoundary>
  );
};

export default App;
