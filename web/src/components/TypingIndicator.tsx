import React from 'react';
import { Box, HStack, Avatar } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

const TypingIndicator: React.FC = () => {
  return (
    <HStack spacing={3} align="flex-start" justify="flex-start">
      <Avatar
        size="sm"
        name="Bot"
        src="https://bit.ly/broken-link"
        bg="blue.500"
      />
      
      <Box
        bg="gray.100"
        color="gray.800"
        px={4}
        py={3}
        borderRadius="lg"
        maxW="100px"
      >
        <HStack spacing={1}>
          <Box
            w="6px"
            h="6px"
            bg="gray.400"
            borderRadius="full"
            animation={`${bounce} 1.4s infinite ease-in-out`}
          />
          <Box
            w="6px"
            h="6px"
            bg="gray.400"
            borderRadius="full"
            animation={`${bounce} 1.4s infinite ease-in-out 0.2s`}
          />
          <Box
            w="6px"
            h="6px"
            bg="gray.400"
            borderRadius="full"
            animation={`${bounce} 1.4s infinite ease-in-out 0.4s`}
          />
        </HStack>
      </Box>
    </HStack>
  );
};

export default TypingIndicator;
