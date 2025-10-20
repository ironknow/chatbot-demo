import React from "react";
import { Box, Text, HStack, IconButton, Tooltip } from "@chakra-ui/react";
import {
  MdThumbUp,
  MdThumbDown,
  MdContentCopy,
  MdRefresh,
} from "react-icons/md";
import { ChatMessageProps } from "@/types";

const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
  const isUser = message.sender === "user";

  return (
    <Box
      py={6}
      px={4}
      bg={isUser ? "white" : "gray.50"}
      borderBottom="1px"
      borderColor="gray.100"
    >
      <HStack align="flex-start" spacing={4} maxW="4xl" mx="auto">
        {/* Avatar */}
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg={isUser ? "blue.500" : "green.500"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          mt={1}
        >
          <Text fontSize="sm" color="white" fontWeight="bold">
            {isUser ? "U" : "AI"}
          </Text>
        </Box>

        {/* Message Content */}
        <Box flex="1">
          <Text
            fontSize="md"
            lineHeight="1.6"
            color="gray.800"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
          >
            {message.text}
          </Text>

          {/* Message Actions */}
          {!isUser && (
            <HStack spacing={1} mt={3}>
              <Tooltip label="Good response">
                <IconButton
                  aria-label="Good response"
                  icon={<MdThumbUp />}
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              <Tooltip label="Bad response">
                <IconButton
                  aria-label="Bad response"
                  icon={<MdThumbDown />}
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              <Tooltip label="Copy">
                <IconButton
                  aria-label="Copy"
                  icon={<MdContentCopy />}
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              <Tooltip label="Regenerate">
                <IconButton
                  aria-label="Regenerate"
                  icon={<MdRefresh />}
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
            </HStack>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

export default ChatMessage;
