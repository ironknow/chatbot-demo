import React from 'react';
import { Box, Text, VStack, HStack, Avatar } from '@chakra-ui/react';
import { ChatMessageProps } from '@/types';

const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = message.sender === 'user';

  return (
    <HStack
      spacing={3}
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      maxW="80%"
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
    >
      {!isUser && (
        <Avatar
          size="sm"
          name="Bot"
          src="https://bit.ly/broken-link"
          bg="blue.500"
        />
      )}
      
      <VStack
        align={isUser ? 'flex-end' : 'flex-start'}
        spacing={1}
        maxW="100%"
      >
        <Box
          bg={isUser ? 'blue.500' : 'gray.100'}
          color={isUser ? 'white' : 'gray.800'}
          px={4}
          py={2}
          borderRadius="lg"
          maxW="100%"
          wordBreak="break-word"
        >
          <Text fontSize="md">{message.text}</Text>
        </Box>
        
        <Text fontSize="xs" color="gray.500" px={2}>
          {formatTime(message.timestamp)}
        </Text>
      </VStack>
      
      {isUser && (
        <Avatar
          size="sm"
          name="User"
          bg="green.500"
        />
      )}
    </HStack>
  );
};

export default ChatMessage;
