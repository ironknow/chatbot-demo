import React, { useRef, useState, useCallback, useMemo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/contexts";
import {
  ChatHeader,
  ChatMessage,
  ChatInput,
  WelcomeMessage,
  TypingIndicator,
  Sidebar,
  ErrorBoundary,
} from "@/components";
import { getCommonStyles, THEME_CONFIG } from "@/theme/styles";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

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
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewChat = useCallback(() => {
    clearConversation();
    setSidebarOpen(false); // Close sidebar on mobile after new chat
  }, [clearConversation]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const styles = useMemo(() => getCommonStyles(theme), [theme]);

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
      <Flex height="100vh" bg={styles.container.bg}>
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onNewChat={handleNewChat}
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
            bg={styles.container.bg}
            px={THEME_CONFIG.CONTENT_PADDING}
            py={THEME_CONFIG.MESSAGE_PADDING}
          >
            <Box maxW={THEME_CONFIG.MAX_CONTENT_WIDTH} mx="auto">
              {messageList}
            </Box>
          </Box>

          <Box
            bg={styles.container.bg}
            borderTop="1px"
            borderColor={styles.border.borderColor}
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
