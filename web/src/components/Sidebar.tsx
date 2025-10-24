import React, { memo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Center,
  IconButton,
} from "@chakra-ui/react";
import { MdAdd, MdChat, MdMenu, MdClose } from "react-icons/md";
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

    // Add CSS keyframes for animation
    React.useEffect(() => {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }, []);
    const formatLastMessage = (conversation: Conversation): string => {
      if (conversation.messages && conversation.messages.length > 0) {
        const lastMessage = conversation.messages[0];
        return lastMessage.text.length > 50
          ? `${lastMessage.text.substring(0, 50)}...`
          : lastMessage.text;
      }
      return "";
    };

    return (
      <Box
        position="fixed"
        left={0}
        top={0}
        zIndex={10}
        w={isOpen ? "320px" : "60px"}
        h="100vh"
        bg={colors.background.primary}
        borderRight="1px"
        borderColor={colors.border.primary}
        shadow="xl"
        display="flex"
        flexDirection="column"
        transition="width 0.3s ease"
      >
        {/* Header */}
        <Box
          px={4}
          py={3}
          borderBottom="1px"
          borderColor={colors.border.primary}
        >
          <HStack justify="space-between" align="center">
            {isOpen ? (
              <IconButton
                aria-label="Close sidebar"
                icon={<MdClose />}
                size="sm"
                variant="ghost"
                onClick={onToggle}
                ml="auto"
              />
            ) : (
              <IconButton
                aria-label="Open sidebar"
                icon={<MdMenu />}
                size="sm"
                variant="ghost"
                onClick={onToggle}
                mx="auto"
              />
            )}
          </HStack>
        </Box>

        {/* Conversation List - Only show when expanded */}
        {isOpen && (
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
              <VStack
                spacing={1}
                p={2}
                align="stretch"
                transition="all 0.3s ease"
              >
                {/* New Chat Button */}
                <Button
                  leftIcon={<MdAdd />}
                  onClick={onCreateNew}
                  variant="ghost"
                  justifyContent="flex-start"
                  h="auto"
                  p={3}
                  borderRadius="md"
                  bg="transparent"
                  border="1px solid transparent"
                  borderColor="transparent"
                  _hover={{
                    bg: colors.interactive.hover,
                    transform: "none",
                  }}
                  _active={{
                    transform: "none",
                  }}
                  transition="background-color 0.2s"
                  position="relative"
                  disabled={isLoading}
                  mb={2}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={colors.text.primary}
                    noOfLines={1}
                    textAlign="left"
                  >
                    New Chat
                  </Text>
                </Button>
                {conversations.map((conversation, index) => (
                  <Button
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation.id)}
                    variant="ghost"
                    justifyContent="flex-start"
                    h="auto"
                    p={3}
                    borderRadius="md"
                    opacity={0}
                    transform="translateY(-10px)"
                    animation={`fadeInUp 0.3s ease ${index * 0.1}s forwards`}
                    bg={
                      currentConversationId === conversation.id
                        ? colors.interactive.active
                        : "transparent"
                    }
                    border="1px solid transparent"
                    _hover={{
                      bg:
                        currentConversationId === conversation.id
                          ? colors.interactive.active
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
                        color={colors.text.primary}
                        noOfLines={1}
                        textAlign="left"
                      >
                        {conversation.title || "Untitled Conversation"}
                      </Text>

                      {formatLastMessage(conversation) && (
                        <Text
                          fontSize="xs"
                          color={colors.text.secondary}
                          noOfLines={1}
                          textAlign="left"
                        >
                          {formatLastMessage(conversation)}
                        </Text>
                      )}

                      {conversation._count && conversation._count.messages > 0 && (
                        <HStack justify="space-between" align="center">
                          <Text
                            fontSize="xs"
                            color={colors.text.muted}
                          >
                            {conversation._count.messages} messages
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Button>
                ))}
              </VStack>
            )}
          </Box>
        )}

        {/* Footer - Only show when expanded */}
        {isOpen && (
          <Box p={4} borderTop="1px" borderColor={colors.border.primary}>
            <Text fontSize="xs" color={colors.text.tertiary} textAlign="center">
              {conversations.length} conversation
              {conversations.length !== 1 ? "s" : ""}
            </Text>
          </Box>
        )}
      </Box>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
