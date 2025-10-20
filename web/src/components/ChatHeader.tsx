import React from "react";
import { Box, HStack, Text, IconButton, Tooltip } from "@chakra-ui/react";
import { MdRefresh, MdDelete, MdMoreVert, MdMenu } from "react-icons/md";
import { ChatHeaderProps } from "@/types";

const ChatHeader: React.FC<ChatHeaderProps> = ({
  apiStatus,
  onClear,
  onRetry,
  hasError,
  sidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" px={4} py={3}>
      <HStack justify="space-between" align="center" maxW="4xl" mx="auto">
        <HStack spacing={3}>
          <IconButton
            aria-label="Toggle sidebar"
            icon={<MdMenu />}
            size="sm"
            variant="ghost"
            colorScheme="gray"
            onClick={onToggleSidebar}
          />
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            Chatty
          </Text>
          {apiStatus && (
            <Box
              px={2}
              py={1}
              borderRadius="md"
              bg={apiStatus.status === "healthy" ? "green.100" : "red.100"}
              color={apiStatus.status === "healthy" ? "green.700" : "red.700"}
              fontSize="xs"
              fontWeight="medium"
            >
              {apiStatus.status === "healthy" ? "Online" : "Offline"}
            </Box>
          )}
        </HStack>

        <HStack spacing={1}>
          {hasError && onRetry && (
            <Tooltip label="Regenerate response">
              <IconButton
                aria-label="Regenerate response"
                icon={<MdRefresh />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={onRetry}
              />
            </Tooltip>
          )}
          <Tooltip label="New chat">
            <IconButton
              aria-label="New chat"
              icon={<MdDelete />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={onClear}
            />
          </Tooltip>
          <IconButton
            aria-label="More options"
            icon={<MdMoreVert />}
            size="sm"
            variant="ghost"
            colorScheme="gray"
          />
        </HStack>
      </HStack>
    </Box>
  );
};

export default ChatHeader;
