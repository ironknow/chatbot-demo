import React from 'react';
import { HStack, Input, Button } from '@chakra-ui/react';
import { ChatInputProps } from '@/types';

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  disabled,
  isTyping,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      onSend();
    }
  };

  return (
    <HStack spacing={3}>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        onKeyDown={handleKeyDown}
        disabled={disabled}
        size="lg"
        borderRadius="full"
        bg="gray.50"
        _focus={{
          bg: 'white',
          boxShadow: '0 0 0 1px #3182ce',
        }}
      />
      <Button
        onClick={onSend}
        disabled={!input.trim() || disabled}
        colorScheme="blue"
        size="lg"
        borderRadius="full"
        px={6}
        isLoading={isLoading}
        loadingText="Sending"
      >
        {isTyping ? '...' : 'Send'}
      </Button>
    </HStack>
  );
};

export default ChatInput;
