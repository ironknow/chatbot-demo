import React from "react";
import { Box, HStack, Textarea, IconButton, Text } from "@chakra-ui/react";
import { MdSend, MdAttachFile } from "react-icons/md";
import { ChatInputProps } from "@/types";

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  disabled,
  isTyping,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box position="relative">
      <HStack
        spacing={3}
        p={3}
        bg="white"
        borderRadius="xl"
        border="1px"
        borderColor="gray.300"
        _focusWithin={{
          borderColor: "blue.500",
          boxShadow: "0 0 0 1px #3182ce",
        }}
      >
        <IconButton
          aria-label="Attach file"
          icon={<MdAttachFile />}
          size="sm"
          variant="ghost"
          colorScheme="gray"
          isDisabled={disabled}
        />

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Chatty..."
          onKeyDown={handleKeyDown}
          disabled={disabled}
          resize="none"
          border="none"
          _focus={{
            boxShadow: "none",
          }}
          _placeholder={{
            color: "gray.500",
          }}
          minH="24px"
          maxH="200px"
          fontSize="md"
          lineHeight="1.5"
        />

        <IconButton
          aria-label="Send message"
          icon={<MdSend />}
          size="sm"
          colorScheme="blue"
          onClick={onSend}
          disabled={!input.trim() || disabled}
          isLoading={isLoading}
        />
      </HStack>

      <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
        Chatty can make mistakes. Consider checking important information.
      </Text>
    </Box>
  );
};

export default ChatInput;
