import React from "react";
import { Box, Text, VStack, SimpleGrid, Button } from "@chakra-ui/react";
import { MdLightbulb, MdCode, MdLanguage, MdSchool } from "react-icons/md";

const WelcomeMessage: React.FC = () => {
  const suggestions = [
    { icon: MdLightbulb, text: "Explain quantum computing", color: "blue" },
    { icon: MdCode, text: "Write a Python function", color: "green" },
    { icon: MdLanguage, text: "Translate 'Hello' to Spanish", color: "purple" },
    { icon: MdSchool, text: "Explain photosynthesis", color: "orange" },
  ];

  return (
    <Box textAlign="center" py={12} px={4}>
      <VStack spacing={8} maxW="4xl" mx="auto">
        {/* Main Title */}
        <VStack spacing={4}>
          <Text fontSize="4xl" fontWeight="bold" color="gray.800">
            How can I help you today?
          </Text>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            I'm Chatty, your AI assistant. I can help you with questions,
            creative tasks, analysis, coding, and much more.
          </Text>
        </VStack>

        {/* Suggestion Cards */}
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={4}
          w="full"
          maxW="4xl"
        >
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="lg"
              h="auto"
              p={6}
              justifyContent="flex-start"
              textAlign="left"
              bg="white"
              borderColor="gray.200"
              _hover={{
                borderColor: `${suggestion.color}.300`,
                bg: `${suggestion.color}.50`,
              }}
              leftIcon={<suggestion.icon color={`${suggestion.color}.500`} />}
            >
              <Text fontSize="md" color="gray.700">
                {suggestion.text}
              </Text>
            </Button>
          ))}
        </SimpleGrid>

        {/* Footer Text */}
        <Text fontSize="sm" color="gray.500" mt={8}>
          Chatty can make mistakes. Consider checking important information.
        </Text>
      </VStack>
    </Box>
  );
};

export default WelcomeMessage;
