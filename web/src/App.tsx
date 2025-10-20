import React, { useRef } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useChat } from '@/hooks/useChat';
import { 
  ChatHeader, 
  ChatMessage, 
  ChatInput, 
  WelcomeMessage, 
  TypingIndicator 
} from '@/components';

const App: React.FC = () => {
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

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      bg="gray.50"
    >
      <ChatHeader
        apiStatus={apiStatus}
        onClear={clearConversation}
        onRetry={error ? retryLastMessage : undefined}
        hasError={!!error}
      />

      <Box
        flex="1"
        overflowY="auto"
        p={4}
        bg="white"
        mx={4}
        my={2}
        borderRadius="lg"
        boxShadow="sm"
      >
        <VStack spacing={4} align="stretch">
          {messages.length === 0 && <WelcomeMessage />}

          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} index={index} />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      <Box p={4} bg="white" mx={4} mb={4} borderRadius="lg" boxShadow="sm">
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
  );
};

export default App;
