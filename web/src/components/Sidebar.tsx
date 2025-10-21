import React, { memo } from "react";
import { Box, VStack, HStack, Text, Button, Spinner, Center } from "@chakra-ui/react";
import { MdAdd, MdChat } from "react-icons/md";
import { Conversation } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@/contexts";

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
    isLoading
  }) => {
    const { theme } = useTheme();

    // Theme-aware colors using your system
    const sidebarBg = theme === "light" ? "gray.50" : "gray.900";
    const borderColor = theme === "light" ? "gray.200" : "gray.700";
    const headerTextColor = theme === "light" ? "gray.900" : "white";
    const loadingTextColor = theme === "light" ? "gray.500" : "gray.400";
    const emptyIconBg = theme === "light" ? "gray.100" : "gray.800";
    const emptyTextColor = theme === "light" ? "gray.500" : "gray.400";
    const emptySubTextColor = theme === "light" ? "gray.400" : "gray.500";
    const footerTextColor = theme === "light" ? "gray.500" : "gray.400";

    // Conversation button colors
    const activeBg = theme === "light" ? "blue.50" : "blue.900";
    const activeBorder = theme === "light" ? "blue.200" : "blue.800";
    const hoverBg = theme === "light" ? "blue.100" : "blue.800";
    const inactiveHoverBg = theme === "light" ? "gray.100" : "gray.800";
    const activeTextColor = theme === "light" ? "blue.900" : "blue.100";
    const inactiveTextColor = theme === "light" ? "gray.900" : "gray.100";
    const activeTimeColor = theme === "light" ? "blue.600" : "blue.400";
    const inactiveTimeColor = theme === "light" ? "gray.400" : "gray.500";
    const activeSubTextColor = theme === "light" ? "blue.700" : "blue.300";
    const inactiveSubTextColor = theme === "light" ? "gray.500" : "gray.400";
    const activeDotColor = theme === "light" ? "blue.600" : "blue.400";
    const formatLastMessage = (conversation: Conversation): string => {
      if (conversation.messages && conversation.messages.length > 0) {
        const lastMessage = conversation.messages[0];
        return lastMessage.text.length > 50
          ? `${lastMessage.text.substring(0, 50)}...`
          : lastMessage.text;
      }
      return 'No messages yet';
    };

    const formatTime = (dateString: string): string => {
      try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
      } catch {
        return 'Unknown time';
      }
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
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        shadow="xl"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold" color={headerTextColor}>
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
                <Text fontSize="sm" color={loadingTextColor}>
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
                  bg={emptyIconBg}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <MdChat size={32} color="#9CA3AF" />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="md" fontWeight="medium" color={emptyTextColor}>
                    No conversations yet
                  </Text>
                  <Text fontSize="sm" color={emptySubTextColor}>
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
                  bg={currentConversationId === conversation.id ? activeBg : "transparent"}
                  border={currentConversationId === conversation.id ? "1px" : "none"}
                  borderColor={currentConversationId === conversation.id ? activeBorder : "transparent"}
                  _hover={{
                    bg: currentConversationId === conversation.id ? hoverBg : inactiveHoverBg
                  }}
                  transition="all 0.2s"
                  position="relative"
                >
                  <VStack align="stretch" spacing={2} w="full">
                    <HStack justify="space-between" align="flex-start">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={currentConversationId === conversation.id ? activeTextColor : inactiveTextColor}
                        noOfLines={1}
                        flex="1"
                      >
                        {conversation.title || 'Untitled Conversation'}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={currentConversationId === conversation.id ? activeTimeColor : inactiveTimeColor}
                      >
                        {formatTime(conversation.updatedAt)}
                      </Text>
                    </HStack>

                    <Text
                      fontSize="xs"
                      color={currentConversationId === conversation.id ? activeSubTextColor : inactiveSubTextColor}
                      noOfLines={1}
                    >
                      {formatLastMessage(conversation)}
                    </Text>

                    {conversation._count && (
                      <HStack justify="space-between" align="center">
                        <Text
                          fontSize="xs"
                          color={currentConversationId === conversation.id ? activeTimeColor : inactiveTimeColor}
                        >
                          {conversation._count.messages} messages
                        </Text>
                        {currentConversationId === conversation.id && (
                          <Box
                            w={2}
                            h={2}
                            bg={activeDotColor}
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
        <Box p={4} borderTop="1px" borderColor={borderColor}>
          <Text fontSize="xs" color={footerTextColor} textAlign="center">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        </Box>
      </Box>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
