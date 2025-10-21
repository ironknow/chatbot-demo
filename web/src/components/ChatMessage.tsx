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

const MESSAGE_ACTIONS = [
  { icon: "MdThumbUp", label: "Good response", ariaLabel: "Good response" },
  { icon: "MdThumbDown", label: "Bad response", ariaLabel: "Bad response" },
  { icon: "MdContentCopy", label: "Copy", ariaLabel: "Copy" },
  { icon: "MdRefresh", label: "Regenerate", ariaLabel: "Regenerate" },
];

const ChatMessage: React.FC<ChatMessageProps> = memo(({ message, index }) => {
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
        <Box flex="1">
          <Text
            fontSize="md"
            lineHeight="1.6"
            color={colors.text.primary}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
          >
            {message.text}
          </Text>

          {/* Message Actions */}
          {messageActions}
        </Box>
      </HStack>
    </Box>
  );
});

export default ChatMessage;
