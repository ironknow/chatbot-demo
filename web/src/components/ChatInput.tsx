import React, { memo, useCallback } from "react";
import { Box, Text } from "@chakra-ui/react";
import { MdSend, MdAttachFile } from "react-icons/md";
import { ChatInputProps } from "@/types";
import { useTheme } from "@/contexts";
import { Textarea } from "@/components";
import { getTextColor } from "@/theme/styles";

const ChatInput: React.FC<ChatInputProps> = memo(
  ({ input, setInput, onSend, disabled, isTyping, isLoading }) => {
    const { theme } = useTheme();

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !disabled) {
          e.preventDefault();
          onSend();
        }
      },
      [disabled, onSend],
    );

    return (
      <Box position="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Chatty..."
          onKeyDown={handleKeyDown}
          disabled={disabled}
          minH="24px"
          maxH="200px"
          fontSize="md"
          lineHeight="1.5"
          leftIcon={<MdAttachFile />}
          rightIcon={<MdSend />}
          onRightIconClick={onSend}
        />

        <Text
          fontSize="xs"
          color={getTextColor(theme, "tertiary")}
          mt={2}
          textAlign="center"
        >
          Chatty can make mistakes. Consider checking important information.
        </Text>
      </Box>
    );
  },
);

export default ChatInput;
