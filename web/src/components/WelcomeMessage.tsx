import React, { memo, useMemo } from "react";
import { Box, Text, VStack, SimpleGrid } from "@chakra-ui/react";
import { MdLightbulb, MdCode, MdLanguage, MdSchool } from "react-icons/md";
import { useTheme } from "@/contexts";
import { Button } from "@/components";
import { getTextColor, WELCOME_SUGGESTIONS } from "@/theme/styles";

const WelcomeMessage: React.FC = memo(() => {
  const { theme } = useTheme();

  const iconComponents = useMemo(
    () => ({
      MdLightbulb,
      MdCode,
      MdLanguage,
      MdSchool,
    }),
    [],
  );

  const suggestionCards = useMemo(
    () => (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full" maxW="4xl">
        {WELCOME_SUGGESTIONS.map((suggestion, index) => {
          const IconComponent =
            iconComponents[suggestion.icon as keyof typeof iconComponents];
          return (
            <Button
              key={index}
              variant="outline"
              size="lg"
              h="auto"
              p={6}
              justifyContent="flex-start"
              textAlign="left"
              leftIcon={<IconComponent color={`${suggestion.color}.500`} />}
            >
              <Text fontSize="md">{suggestion.text}</Text>
            </Button>
          );
        })}
      </SimpleGrid>
    ),
    [iconComponents],
  );

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

        {/* Suggestion Cards */}
        {suggestionCards}

        {/* Footer Text */}
        <Text fontSize="sm" color={getTextColor(theme, "tertiary")} mt={8}>
          Chatty can make mistakes. Consider checking important information.
        </Text>
      </VStack>
    </Box>
  );
});

export default WelcomeMessage;
