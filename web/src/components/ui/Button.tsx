import React from "react";
import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import { useTheme } from "@/contexts";
import { getButtonVariantStyles } from "@/theme/styles";

interface CustomButtonProps extends ChakraButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "outline";
}

const Button: React.FC<CustomButtonProps> = ({
  variant = "primary",
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = getButtonVariantStyles(variant, theme);

  return (
    <ChakraButton
      transition="all 0.2s"
      borderRadius="md"
      fontWeight="medium"
      {...styles}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
