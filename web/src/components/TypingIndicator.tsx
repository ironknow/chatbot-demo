import React, { memo, useMemo } from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useThemeColors } from "@/theme/colors";

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
`;

const TypingIndicator: React.FC = memo(() => {
  const colors = useThemeColors();

  const dots = useMemo(
    () => [{ delay: "0s" }, { delay: "0.2s" }, { delay: "0.4s" }],
    [],
  );

  return (
    <Box
      py={6}
      px={4}
      bg={colors.background.secondary}
      borderBottom="1px"
      borderColor={colors.border.primary}
    >
      <HStack align="flex-start" spacing={4} maxW="4xl" mx="auto">
        {/* Avatar */}
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg="blue.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          mt={1}
        >
          <Text fontSize="sm" color="white" fontWeight="bold">
            B
          </Text>
        </Box>

        {/* Typing Animation */}
        <Box flex="1">
          <HStack spacing={1} mt={2}>
            {dots.map((dot, index) => (
              <Box
                key={index}
                w="8px"
                h="8px"
                bg="gray.400"
                borderRadius="full"
                animation={`${bounce} 1.4s infinite ease-in-out ${dot.delay}`}
              />
            ))}
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
});

export default TypingIndicator;
