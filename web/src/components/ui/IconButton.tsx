import React from "react";
import {
  IconButton as ChakraIconButton,
  IconButtonProps as ChakraIconButtonProps,
  Tooltip,
} from "@chakra-ui/react";
import { useThemeColors } from "@/theme/colors";

interface IconButtonProps extends ChakraIconButtonProps {
  tooltip?: string;
  icon: React.ReactElement;
}

const IconButton: React.FC<IconButtonProps> = ({ tooltip, icon, ...props }) => {
  const colors = useThemeColors();

  const button = (
    <ChakraIconButton
      variant="ghost"
      transition="all 0.2s"
      icon={icon}
      color={colors.text.secondary}
      _hover={{
        bg: colors.interactive.hover,
        transform: "scale(1.05)",
      }}
      _active={{
        transform: "scale(0.95)",
      }}
      {...props}
    />
  );

  return tooltip ? <Tooltip label={tooltip}>{button}</Tooltip> : button;
};

export default IconButton;
