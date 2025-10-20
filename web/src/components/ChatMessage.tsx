import React, { memo, useMemo } from "react";
import { Box, Text, HStack, IconButton, Tooltip } from "@chakra-ui/react";
import {
  MdThumbUp,
  MdThumbDown,
  MdContentCopy,
  MdRefresh,
} from "react-icons/md";
import { ChatMessageProps } from "@/types";
import { useTheme } from "@/contexts";
import {
  getCommonStyles,
  getAvatarConfig,
  MESSAGE_ACTIONS,
} from "@/theme/styles";

const ChatMessage: React.FC<ChatMessageProps> = memo(({ message, index }) => {
  const isUser = message.sender === "user";
  const { theme } = useTheme();

  const styles = useMemo(() => getCommonStyles(theme), [theme]);
  const avatarConfig = useMemo(
    () => getAvatarConfig(isUser ? "user" : "bot"),
    [isUser],
  );

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
      bg={isUser ? styles.message.user.bg : styles.message.bot.bg}
      borderBottom="1px"
      borderColor={styles.border.borderColor}
    >
      <HStack align="flex-start" spacing={4} maxW="4xl" mx="auto">
        {/* Avatar */}
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg={avatarConfig.bg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          mt={1}
        >
          <Text fontSize="sm" color="white" fontWeight="bold">
            {avatarConfig.text}
          </Text>
        </Box>

        {/* Message Content */}
        <Box flex="1">
          <Text
            fontSize="md"
            lineHeight="1.6"
            color={styles.container.color}
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
