import React, { memo, useMemo } from "react";
import { Box, VStack, HStack, Text, Divider } from "@chakra-ui/react";
import {
  MdAdd,
  MdChat,
  MdMoreVert,
  MdSettings,
  MdHelp,
  MdHistory,
} from "react-icons/md";
import { useTheme } from "@/contexts";
import { Button, IconButton } from "@/components";
import { THEME_CONFIG } from "@/theme/styles";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(
  ({ isOpen, onToggle, onNewChat }) => {
    const { theme } = useTheme();

    // Mock chat history - in real app this would come from props/state
    const chatHistory = useMemo(
      () => [
        { id: 1, title: "Explain quantum computing", timestamp: "2 hours ago" },
        { id: 2, title: "Write a Python function", timestamp: "Yesterday" },
        { id: 3, title: "Help with React hooks", timestamp: "2 days ago" },
        { id: 4, title: "Translate to Spanish", timestamp: "3 days ago" },
      ],
      [],
    );

    const bottomActions = useMemo(
      () => [
        { icon: MdHistory, label: "History" },
        { icon: MdSettings, label: "Settings" },
        { icon: MdHelp, label: "Help & FAQ" },
      ],
      [],
    );

    const SidebarContent = memo(() => (
      <Box
        w={THEME_CONFIG.SIDEBAR_WIDTH}
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
            variant="primary"
            borderRadius={THEME_CONFIG.BORDER_RADIUS}
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
                borderRadius={THEME_CONFIG.BORDER_RADIUS}
                _hover={{ bg: theme === "light" ? "gray.800" : "gray.600" }}
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
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  tooltip="More options"
                />
              </HStack>
            ))}
          </VStack>
        </Box>

        <Divider borderColor="gray.700" />

        {/* Bottom Actions */}
        <Box p={3}>
          <VStack spacing={2} align="stretch">
            {bottomActions.map((action) => (
              <Button
                key={action.label}
                leftIcon={<action.icon />}
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
              >
                {action.label}
              </Button>
            ))}
          </VStack>
        </Box>
      </Box>
    ));

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
  },
);

export default Sidebar;
