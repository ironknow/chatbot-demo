import React from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
`;

const TypingIndicator: React.FC = () => {
  return (
    <Box py={6} px={4} bg="gray.50" borderBottom="1px" borderColor="gray.100">
      <HStack align="flex-start" spacing={4} maxW="4xl" mx="auto">
        {/* Avatar */}
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg="green.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          mt={1}
        >
          <Text fontSize="sm" color="white" fontWeight="bold">
            AI
          </Text>
        </Box>

        {/* Typing Animation */}
        <Box flex="1">
          <HStack spacing={1} mt={2}>
            <Box
              w="8px"
              h="8px"
              bg="gray.400"
              borderRadius="full"
              animation={`${bounce} 1.4s infinite ease-in-out`}
            />
            <Box
              w="8px"
              h="8px"
              bg="gray.400"
              borderRadius="full"
              animation={`${bounce} 1.4s infinite ease-in-out 0.2s`}
            />
            <Box
              w="8px"
              h="8px"
              bg="gray.400"
              borderRadius="full"
              animation={`${bounce} 1.4s infinite ease-in-out 0.4s`}
            />
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default TypingIndicator;
