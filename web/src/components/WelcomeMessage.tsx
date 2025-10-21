import React, { memo } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import { useThemeColors } from "@/theme/colors";

const WelcomeMessage: React.FC = memo(() => {
  const colors = useThemeColors();

  return (
    <Box textAlign="center" py={12} px={4}>
      <VStack spacing={8} maxW="4xl" mx="auto">
        {/* Main Title */}
        <VStack spacing={4}>
          <Text fontSize="4xl" fontWeight="bold" color={colors.text.primary}>
            How can I help you today?
          </Text>
          <Text
            fontSize="lg"
            color={colors.text.secondary}
            maxW="2xl"
          >
            I'm Chatty, your AI assistant. I can help you with questions,
            creative tasks, analysis, coding, and much more.
          </Text>
        </VStack>

        {/* Footer Text */}
        <Text fontSize="sm" color={colors.text.tertiary} mt={8}>
          Chatty can make mistakes. Consider checking important information.
        </Text>
      </VStack>
    </Box>
  );
});

export default WelcomeMessage;
