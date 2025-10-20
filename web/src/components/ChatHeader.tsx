import React, { memo, useMemo } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import { MdRefresh, MdDelete, MdMoreVert, MdMenu } from "react-icons/md";
import { ChatHeaderProps } from "@/types";
import { useTheme } from "@/contexts";
import { ThemeToggle, IconButton } from "@/components";
import { getCommonStyles, getStatusColors } from "@/theme/styles";

const ChatHeader: React.FC<ChatHeaderProps> = memo(
  ({ apiStatus, onClear, onRetry, hasError, sidebarOpen, onToggleSidebar }) => {
    const { theme } = useTheme();

    const styles = useMemo(() => getCommonStyles(theme), [theme]);

    const statusColors = useMemo(() => {
      if (!apiStatus) return null;
      return getStatusColors(
        theme,
        apiStatus.status === "healthy" ? "online" : "offline",
      );
    }, [apiStatus, theme]);

    return (
      <Box
        bg={styles.container.bg}
        borderBottom="1px"
        borderColor={styles.border.borderColor}
        px={4}
        py={3}
      >
        <HStack justify="space-between" align="center" maxW="4xl" mx="auto">
          <HStack spacing={3}>
            <IconButton
              aria-label="Toggle sidebar"
              icon={<MdMenu />}
              size="sm"
              variant="ghost"
              onClick={onToggleSidebar}
              tooltip="Toggle sidebar"
            />
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={styles.container.color}
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
