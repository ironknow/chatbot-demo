import React, { memo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { MdAdd, MdChat } from "react-icons/md";
import { Conversation } from "@/types";
import { useThemeColors } from "@/theme/colors";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = memo(
  ({
    isOpen,
    onToggle,
    conversations,
    currentConversationId,
    onSelectConversation,
    onCreateNew,
    isLoading,
  }) => {
    const colors = useThemeColors();
    const formatLastMessage = (conversation: Conversation): string => {
      if (conversation.messages && conversation.messages.length > 0) {
        const lastMessage = conversation.messages[0];
        return lastMessage.text.length > 50
          ? `${lastMessage.text.substring(0, 50)}...`
          : lastMessage.text;
      }
      return "";
    };

    if (!isOpen) return null;

    return (
      <Box
        position="fixed"
        left={0}
        top={0}
        zIndex={10}
        w="320px"
        h="100vh"
        bg={colors.background.primary}
        borderRight="1px"
        borderColor={colors.border.primary}
        shadow="xl"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Box p={4} borderBottom="1px" borderColor={colors.border.primary}>
          <HStack justify="space-between" align="center">
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={colors.text.primary}
            >
              Conversations
            </Text>
            <Button
              leftIcon={<MdAdd />}
              onClick={onCreateNew}
              size="sm"
              colorScheme="blue"
              borderRadius="md"
              disabled={isLoading}
              _hover={{ transform: "translateY(-1px)" }}
              transition="all 0.2s"
            >
              New Chat
            </Button>
          </HStack>
        </Box>

        {/* Conversation List */}
        <Box flex="1" overflowY="auto">
          {isLoading ? (
            <Center p={4}>
              <VStack spacing={2}>
                <Spinner color="blue.500" size="sm" />
                <Text fontSize="sm" color={colors.text.tertiary}>
                  Loading conversations...
                </Text>
              </VStack>
            </Center>
          ) : conversations.length === 0 ? (
            <Center p={6}>
              <VStack spacing={4}>
                <Box
                  w={16}
                  h={16}
                  bg={colors.background.tertiary}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <MdChat size={32} color="#9CA3AF" />
                </Box>
                <VStack spacing={2}>
                  <Text
                    fontSize="md"
                    fontWeight="medium"
                    color={colors.text.secondary}
                  >
                    No conversations yet
                  </Text>
                  <Text fontSize="sm" color={colors.text.muted}>
                    Start a new conversation to begin!
                  </Text>
                </VStack>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={1} p={2} align="stretch">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  variant="ghost"
                  justifyContent="flex-start"
                  h="auto"
                  p={3}
                  borderRadius="md"
                  bg={
                    currentConversationId === conversation.id
                      ? colors.blue.bg
                      : "transparent"
                  }
                  border={
                    currentConversationId === conversation.id
                      ? "1px"
                      : "1px solid transparent"
                  }
                  borderColor={
                    currentConversationId === conversation.id
                      ? colors.blue.border
                      : "transparent"
                  }
                  _hover={{
                    bg:
                      currentConversationId === conversation.id
                        ? colors.blue.bgHover
                        : colors.interactive.hover,
                    transform: "none",
                  }}
                  _active={{
                    transform: "none",
                  }}
                  transition="background-color 0.2s"
                  position="relative"
                >
                  <VStack align="stretch" spacing={2} w="full">
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={
                        currentConversationId === conversation.id
                          ? colors.blue.text
                          : colors.text.primary
                      }
                      noOfLines={1}
                      textAlign="left"
                    >
                      {conversation.title || "Untitled Conversation"}
                    </Text>

                    {formatLastMessage(conversation) && (
                      <Text
                        fontSize="xs"
                        color={
                          currentConversationId === conversation.id
                            ? colors.blue.textSecondary
                            : colors.text.secondary
                        }
                        noOfLines={1}
                        textAlign="left"
                      >
                        {formatLastMessage(conversation)}
                      </Text>
                    )}

                    {conversation._count && (
                      <HStack justify="space-between" align="center">
                        <Text
                          fontSize="xs"
                          color={
                            currentConversationId === conversation.id
                              ? colors.blue.textMuted
                              : colors.text.muted
                          }
                        >
                          {conversation._count.messages} messages
                        </Text>
                        {currentConversationId === conversation.id && (
                          <Box
                            w={2}
                            h={2}
                            bg={colors.blue.dot}
                            borderRadius="full"
                          />
                        )}
                      </HStack>
                    )}
                  </VStack>
                </Button>
              ))}
            </VStack>
          )}
        </Box>

        {/* Footer */}
        <Box p={4} borderTop="1px" borderColor={colors.border.primary}>
          <Text fontSize="xs" color={colors.text.tertiary} textAlign="center">
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </Text>
        </Box>
      </Box>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
