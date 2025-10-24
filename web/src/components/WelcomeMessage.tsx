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
        </VStack>
      </VStack>
    </Box>
  );
});

export default WelcomeMessage;
