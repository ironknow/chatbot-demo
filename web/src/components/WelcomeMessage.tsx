import React from 'react';
import { Box, Text, VStack, List, ListItem, ListIcon } from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';

const WelcomeMessage: React.FC = () => {
  return (
    <Box
      textAlign="center"
      py={8}
      px={4}
      bgGradient="linear(to-r, blue.50, purple.50)"
      borderRadius="xl"
      border="1px"
      borderColor="blue.200"
    >
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          👋 Welcome! I'm Chatty, your friendly AI assistant.
        </Text>
        
        <Text fontSize="md" color="gray.600">
          Try asking me about:
        </Text>
        
        <List spacing={2} textAlign="left">
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            What's your name?
          </ListItem>
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            What can you help me with?
          </ListItem>
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            What time is it?
          </ListItem>
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            How are you today?
          </ListItem>
        </List>
      </VStack>
    </Box>
  );
};

export default WelcomeMessage;
