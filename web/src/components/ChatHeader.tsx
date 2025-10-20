import React from 'react';
import { Box, HStack, Heading, Badge, IconButton, Tooltip } from '@chakra-ui/react';
import { MdRefresh, MdDelete } from 'react-icons/md';
import { ChatHeaderProps } from '@/types';

const ChatHeader: React.FC<ChatHeaderProps> = ({
  apiStatus,
  onClear,
  onRetry,
  hasError,
}) => {
  return (
    <Box
      bg="white"
      p={4}
      mx={4}
      mt={4}
      borderRadius="lg"
      boxShadow="sm"
      borderBottom="1px"
      borderColor="gray.200"
    >
      <HStack justify="space-between" align="center">
        <HStack spacing={4}>
          <Heading size="lg" color="blue.600">
            Chatty 🤖
          </Heading>
          {apiStatus && (
            <Badge
              colorScheme={apiStatus.status === 'healthy' ? 'green' : 'red'}
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
            >
              {apiStatus.status === 'healthy' ? 'Online' : 'Offline'}
            </Badge>
          )}
        </HStack>
        
        <HStack spacing={2}>
          {hasError && onRetry && (
            <Tooltip label="Retry last message">
              <IconButton
                aria-label="Retry last message"
                icon={<MdRefresh />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={onRetry}
              />
            </Tooltip>
          )}
          <Tooltip label="Clear conversation">
            <IconButton
              aria-label="Clear conversation"
              icon={<MdDelete />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={onClear}
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Box>
  );
};

export default ChatHeader;
