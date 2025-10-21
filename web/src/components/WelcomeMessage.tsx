import React, { memo } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import { useTheme } from "@/contexts";
import { getTextColor } from "@/theme/styles";

const WelcomeMessage: React.FC = memo(() => {
  const { theme } = useTheme();

  return (
    <Box textAlign="center" py={12} px={4}>
      <VStack spacing={8} maxW="4xl" mx="auto">
        {/* Main Title */}
        <VStack spacing={4}>
          <Text fontSize="4xl" fontWeight="bold" color={getTextColor(theme)}>
            How can I help you today?
          </Text>
          <Text
            fontSize="lg"
            color={getTextColor(theme, "secondary")}
            maxW="2xl"
          >
            I'm Chatty, your AI assistant. I can help you with questions,
            creative tasks, analysis, coding, and much more.
          </Text>
        </VStack>

        {/* Footer Text */}
        <Text fontSize="sm" color={getTextColor(theme, "tertiary")} mt={8}>
          Chatty can make mistakes. Consider checking important information.
        </Text>
      </VStack>
    </Box>
  );
});

export default WelcomeMessage;
