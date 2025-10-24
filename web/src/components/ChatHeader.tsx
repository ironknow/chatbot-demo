import React, { memo, useMemo } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import {
  MdRefresh,
  MdDelete,
  MdMoreVert,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { ChatHeaderProps } from "@/types";
import { ThemeToggle, IconButton } from "@/components";
import { useThemeColors } from "@/theme/colors";

const ChatHeader: React.FC<ChatHeaderProps> = memo(
  ({ apiStatus, onClear, onRetry, hasError, onToggleFlow, showFlow }) => {
    const colors = useThemeColors();

    const statusColors = useMemo(() => {
      if (!apiStatus) return null;
      const isOnline = apiStatus.status === "healthy";
      return {
        bg: isOnline ? "green.100" : "red.100",
        text: isOnline ? "green.800" : "red.800",
      };
    }, [apiStatus]);

    return (
      <Box
        bg={colors.background.primary}
        borderBottom="1px"
        borderColor={colors.border.primary}
        px={4}
        py={3}
      >
        <HStack justify="space-between" align="center" maxW="4xl" mx="auto">
          <HStack spacing={3}>
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={colors.text.primary}
            >
              Chatty
            </Text>
            {apiStatus && statusColors && (
              <Box
                px={2}
                py={1}
                borderRadius="md"
                bg={statusColors.bg}
                color={statusColors.text}
                fontSize="xs"
                fontWeight="medium"
              >
                {apiStatus.status === "healthy" ? "Online" : "Offline"}
              </Box>
            )}
          </HStack>

          <HStack spacing={1}>
            {hasError && onRetry && (
              <IconButton
                aria-label="Regenerate response"
                icon={<MdRefresh />}
                size="sm"
                variant="ghost"
                onClick={onRetry}
                tooltip="Regenerate response"
              />
            )}
            <IconButton
              aria-label="New chat"
              icon={<MdDelete />}
              size="sm"
              variant="ghost"
              onClick={onClear}
              tooltip="New chat"
            />
            <ThemeToggle />
            {onToggleFlow && (
              <IconButton
                aria-label={showFlow ? "Hide flow" : "Show flow"}
                icon={showFlow ? <MdVisibilityOff /> : <MdVisibility />}
                size="sm"
                variant="ghost"
                onClick={onToggleFlow}
                tooltip={showFlow ? "Hide flow" : "Show flow"}
              />
            )}
            <IconButton
              aria-label="More options"
              icon={<MdMoreVert />}
              size="sm"
              variant="ghost"
              tooltip="More options"
            />
          </HStack>
        </HStack>
      </Box>
    );
  },
);

export default ChatHeader;
