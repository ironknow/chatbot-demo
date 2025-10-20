import React, { useRef, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useChat } from "@/hooks/useChat";
import {
  ChatHeader,
  ChatMessage,
  ChatInput,
  WelcomeMessage,
  TypingIndicator,
  Sidebar,
} from "@/components";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleNewChat = () => {
    clearConversation();
    setSidebarOpen(false); // Close sidebar on mobile after new chat
  };

  return (
    <Flex height="100vh" bg="gray.50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <Flex
        flex="1"
        direction="column"
        ml={{ base: 0, md: sidebarOpen ? "260px" : 0 }}
        transition="margin-left 0.2s"
      >
        <ChatHeader
          apiStatus={apiStatus}
          onClear={clearConversation}
          onRetry={error ? retryLastMessage : undefined}
          hasError={!!error}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <Box flex="1" overflowY="auto" bg="white" px={4} py={6}>
          <Box maxW="4xl" mx="auto">
            {messages.length === 0 && <WelcomeMessage />}

            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} index={index} />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </Box>
        </Box>

        <Box bg="white" borderTop="1px" borderColor="gray.200" px={4} py={4}>
          <Box maxW="4xl" mx="auto">
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
  );
};

export default App;
