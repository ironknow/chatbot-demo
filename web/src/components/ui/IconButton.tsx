import React from "react";
import {
  IconButton as ChakraIconButton,
  IconButtonProps as ChakraIconButtonProps,
  Tooltip,
} from "@chakra-ui/react";
import { useTheme } from "@/contexts";
import { getIconButtonStyles } from "@/theme/styles";

interface IconButtonProps extends ChakraIconButtonProps {
  tooltip?: string;
  icon: React.ReactElement;
}

const IconButton: React.FC<IconButtonProps> = ({ tooltip, icon, ...props }) => {
  const { theme } = useTheme();
  const styles = getIconButtonStyles(theme);

  const button = (
    <ChakraIconButton
      variant="ghost"
      transition="all 0.2s"
      icon={icon}
      {...styles}
      {...props}
    />
  );

  return tooltip ? <Tooltip label={tooltip}>{button}</Tooltip> : button;
};

export default IconButton;
