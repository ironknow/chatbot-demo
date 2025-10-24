import React, { memo, useCallback, useRef, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { MdSend, MdAttachFile } from "react-icons/md";
import { ChatInputProps } from "@/types";
import { Textarea } from "@/components";

const ChatInput: React.FC<ChatInputProps> = memo(
  ({ input, setInput, onSend, disabled, isTyping, isLoading }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !disabled) {
          e.preventDefault();
          onSend();
        }
      },
      [disabled, onSend],
    );

    // Maintain focus after sending message
    useEffect(() => {
      if (input === "" && !isTyping && textareaRef.current) {
        // Small delay to ensure the component has re-rendered
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
    }, [input, isTyping]);

    return (
      <Box position="relative">
        <Textarea
          ref={textareaRef}
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
      </Box>
    );
  },
);

export default ChatInput;
