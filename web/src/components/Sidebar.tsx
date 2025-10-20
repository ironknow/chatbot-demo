import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import {
  MdAdd,
  MdChat,
  MdMoreVert,
  MdSettings,
  MdHelp,
  MdHistory,
} from "react-icons/md";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onNewChat }) => {
  // Mock chat history - in real app this would come from props/state
  const chatHistory = [
    { id: 1, title: "Explain quantum computing", timestamp: "2 hours ago" },
    { id: 2, title: "Write a Python function", timestamp: "Yesterday" },
    { id: 3, title: "Help with React hooks", timestamp: "2 days ago" },
    { id: 4, title: "Translate to Spanish", timestamp: "3 days ago" },
  ];

  const SidebarContent = () => (
    <Box
      w="260px"
      h="100vh"
      bg="gray.900"
      color="white"
      display="flex"
      flexDirection="column"
    >
      {/* New Chat Button */}
      <Box p={3}>
        <Button
          leftIcon={<MdAdd />}
          onClick={onNewChat}
          w="full"
          bg="gray.800"
          color="white"
          _hover={{ bg: "gray.700" }}
          borderRadius="md"
          size="sm"
        >
          New chat
        </Button>
      </Box>

      <Divider borderColor="gray.700" />

      {/* Chat History */}
      <Box flex="1" overflowY="auto" px={3} py={2}>
        <VStack spacing={1} align="stretch">
          {chatHistory.map((chat) => (
            <HStack
              key={chat.id}
              p={2}
              borderRadius="md"
              _hover={{ bg: "gray.800" }}
              cursor="pointer"
              justify="space-between"
            >
              <HStack spacing={2} flex="1" minW={0}>
                <MdChat size={16} />
                <VStack align="start" spacing={0} flex="1" minW={0}>
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {chat.title}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {chat.timestamp}
                  </Text>
                </VStack>
              </HStack>
              <IconButton
                aria-label="More options"
                icon={<MdMoreVert />}
                size="xs"
                variant="ghost"
                colorScheme="gray"
                opacity={0}
                _groupHover={{ opacity: 1 }}
              />
            </HStack>
          ))}
        </VStack>
      </Box>

      <Divider borderColor="gray.700" />

      {/* Bottom Actions */}
      <Box p={3}>
        <VStack spacing={2} align="stretch">
          <Button
            leftIcon={<MdHistory />}
            variant="ghost"
            colorScheme="gray"
            size="sm"
            justifyContent="flex-start"
            _hover={{ bg: "gray.800" }}
          >
            History
          </Button>
          <Button
            leftIcon={<MdSettings />}
            variant="ghost"
            colorScheme="gray"
            size="sm"
            justifyContent="flex-start"
            _hover={{ bg: "gray.800" }}
          >
            Settings
          </Button>
          <Button
            leftIcon={<MdHelp />}
            variant="ghost"
            colorScheme="gray"
            size="sm"
            justifyContent="flex-start"
            _hover={{ bg: "gray.800" }}
          >
            Help & FAQ
          </Button>
        </VStack>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Sidebar */}
      {isOpen && (
        <Box position="fixed" left={0} top={0} zIndex={10}>
          <SidebarContent />
        </Box>
      )}
    </>
  );
};

export default Sidebar;
