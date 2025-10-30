import React, { memo, useMemo } from "react";
import { Box, Text, HStack, IconButton, Tooltip } from "@chakra-ui/react";
import {
  MdThumbUp,
  MdThumbDown,
  MdContentCopy,
  MdRefresh,
} from "react-icons/md";
import { ChatMessageProps } from "@/types";
import { useThemeColors } from "@/theme/colors";
import MarkdownRenderer from "./MarkdownRenderer";

const MESSAGE_ACTIONS = [
  { icon: "MdThumbUp", label: "Good response", ariaLabel: "Good response" },
  { icon: "MdThumbDown", label: "Bad response", ariaLabel: "Bad response" },
  { icon: "MdContentCopy", label: "Copy", ariaLabel: "Copy" },
  { icon: "MdRefresh", label: "Regenerate", ariaLabel: "Regenerate" },
];

const ChatMessage: React.FC<ChatMessageProps> = memo(
  ({ message, index: _index }) => {
    const isUser = message.sender === "user";
    const colors = useThemeColors();

    const messageActions = useMemo(() => {
      if (isUser) return null;

      const icons = {
        MdThumbUp,
        MdThumbDown,
        MdContentCopy,
        MdRefresh,
      };

      return (
        <HStack spacing={1} mt={3}>
          {MESSAGE_ACTIONS.map((action) => {
            const IconComponent = icons[action.icon as keyof typeof icons];
            return (
              <Tooltip key={action.label} label={action.label}>
                <IconButton
                  aria-label={action.ariaLabel}
                  icon={<IconComponent />}
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
            );
          })}
        </HStack>
      );
    }, [isUser]);

    return (
      <Box
        py={6}
        px={4}
        bg={isUser ? colors.background.primary : colors.background.secondary}
        borderBottom="1px"
        borderColor={colors.border.primary}
      >
        <HStack align="flex-start" spacing={4} maxW="4xl" mx="auto">
          {/* Avatar */}
          <Box
            w={8}
            h={8}
            borderRadius="full"
            bg={isUser ? "green.500" : "blue.500"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            mt={1}
          >
            <Text fontSize="sm" color="white" fontWeight="bold">
              {isUser ? "U" : "B"}
            </Text>
          </Box>

          {/* Message Content */}
          <Box flex="1" wordBreak="break-word">
            {/* File Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <Box mb={3}>
                <HStack spacing={2} flexWrap="wrap">
                  {message.attachments.map((attachment) => (
                    <Box
                      key={attachment.id}
                      p={2}
                      bg={colors.background.secondary}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={colors.border.primary}
                      maxW="300px"
                    >
                      {attachment.type === "image" && attachment.preview && (
                        <Box mb={2}>
                          <img
                            src={attachment.preview}
                            alt={attachment.file.name}
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        </Box>
                      )}
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={colors.text.primary}
                      >
                        {attachment.file.name}
                      </Text>
                      <Text fontSize="xs" color={colors.text.tertiary}>
                        {(attachment.file.size / 1024).toFixed(1)} KB
                      </Text>
                    </Box>
                  ))}
                </HStack>
              </Box>
            )}

            {isUser ? (
              <Text
                fontSize="md"
                lineHeight="1.6"
                color={colors.text.primary}
                whiteSpace="pre-wrap"
              >
                {message.text}
              </Text>
            ) : (
              <MarkdownRenderer content={message.text} />
            )}

            {/* Message Actions */}
            {messageActions}
          </Box>
        </HStack>
      </Box>
    );
  },
);

export default ChatMessage;
