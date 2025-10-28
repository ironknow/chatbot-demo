import React from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  MdMoreVert,
  MdShare,
  MdEdit,
  MdArchive,
  MdDelete,
} from "react-icons/md";
import { Conversation } from "@/types";
import { useThemeColors } from "@/theme/colors";

interface ConversationMenuProps {
  conversation: Conversation;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDelete: (conversationId: string) => void;
}

const ConversationMenu: React.FC<ConversationMenuProps> = ({
  conversation,
  isOpen,
  onOpen,
  onClose,
  onDelete,
}) => {
  const colors = useThemeColors();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      onDelete(conversation.id);
    }
  };

  return (
    <Box
      position="absolute"
      right={2}
      top="50%"
      transform="translateY(-50%)"
      opacity={isOpen ? 1 : 0}
      _groupHover={{ opacity: 1 }}
      transition="opacity 0.2s"
      zIndex={10}
      onClick={(e) => e.stopPropagation()}
    >
      <Menu
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom-start"
        isLazy
        lazyBehavior="unmount"
      >
        <MenuButton
          as={IconButton}
          aria-label="Conversation options"
          icon={<MdMoreVert />}
          size="xs"
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <MenuList
          fontSize="xs"
          bg={colors.background.primary}
          borderColor={colors.border.primary}
          shadow="xl"
          zIndex={9999}
          minW="auto"
          w="auto"
          py={0}
        >
          <MenuItem
            icon={<MdShare />}
            fontSize="xs"
            onClick={(e) => e.stopPropagation()}
          >
            Share
          </MenuItem>
          <MenuItem
            icon={<MdEdit />}
            fontSize="xs"
            onClick={(e) => e.stopPropagation()}
          >
            Rename
          </MenuItem>
          <MenuItem
            icon={<MdArchive />}
            fontSize="xs"
            onClick={(e) => e.stopPropagation()}
          >
            Archive
          </MenuItem>
          <MenuItem
            icon={<MdDelete />}
            fontSize="xs"
            color="red.500"
            onClick={handleDelete}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default ConversationMenu;
