import React, { memo } from "react";
import { Box, VStack, HStack, Text, Divider, Button, IconButton, Spinner, Center } from "@chakra-ui/react";
import { MdAdd, MdChat, MdMoreVert } from "react-icons/md";
import { Conversation } from "@/types";
import { formatDistanceToNow } from "date-fns";

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
        bg="gray.50"
        _dark={{ bg: "gray.900", borderColor: "gray.700" }}
        borderRight="1px"
        borderColor="gray.200"
        shadow="xl"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Box p={4} borderBottom="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" _dark={{ color: "white" }}>
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
                <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
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
                  bg="gray.100"
                  _dark={{ bg: "gray.800" }}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <MdChat size={32} color="#9CA3AF" />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="md" fontWeight="medium" color="gray.500" _dark={{ color: "gray.400" }}>
                    No conversations yet
                  </Text>
                  <Text fontSize="sm" color="gray.400" _dark={{ color: "gray.500" }}>
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
                  bg={currentConversationId === conversation.id ? "blue.50" : "transparent"}
                  _dark={{
                    bg: currentConversationId === conversation.id ? "blue.900" : "transparent",
                    borderColor: currentConversationId === conversation.id ? "blue.800" : "transparent"
                  }}
                  border={currentConversationId === conversation.id ? "1px" : "none"}
                  borderColor={currentConversationId === conversation.id ? "blue.200" : "transparent"}
                  _hover={{
                    bg: currentConversationId === conversation.id ? "blue.100" : "gray.100",
                    _dark: {
                      bg: currentConversationId === conversation.id ? "blue.800" : "gray.800"
                    }
                  }}
                  transition="all 0.2s"
                  position="relative"
                >
                  <VStack align="stretch" spacing={2} w="full">
                    <HStack justify="space-between" align="flex-start">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={currentConversationId === conversation.id ? "blue.900" : "gray.900"}
                        _dark={{
                          color: currentConversationId === conversation.id ? "blue.100" : "gray.100"
                        }}
                        noOfLines={1}
                        flex="1"
                      >
                        {conversation.title || 'Untitled Conversation'}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={currentConversationId === conversation.id ? "blue.600" : "gray.400"}
                        _dark={{
                          color: currentConversationId === conversation.id ? "blue.400" : "gray.500"
                        }}
                      >
                        {formatTime(conversation.updatedAt)}
                      </Text>
                    </HStack>

                    <Text
                      fontSize="xs"
                      color={currentConversationId === conversation.id ? "blue.700" : "gray.500"}
                      _dark={{
                        color: currentConversationId === conversation.id ? "blue.300" : "gray.400"
                      }}
                      noOfLines={1}
                    >
                      {formatLastMessage(conversation)}
                    </Text>

                    {conversation._count && (
                      <HStack justify="space-between" align="center">
                        <Text
                          fontSize="xs"
                          color={currentConversationId === conversation.id ? "blue.600" : "gray.400"}
                          _dark={{
                            color: currentConversationId === conversation.id ? "blue.400" : "gray.500"
                          }}
                        >
                          {conversation._count.messages} messages
                        </Text>
                        {currentConversationId === conversation.id && (
                          <Box
                            w={2}
                            h={2}
                            bg="blue.600"
                            _dark={{ bg: "blue.400" }}
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
        <Box p={4} borderTop="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
          <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }} textAlign="center">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        </Box>
      </Box>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
