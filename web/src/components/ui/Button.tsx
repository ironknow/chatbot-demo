import React from "react";
import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import { useThemeColors } from "@/theme/colors";

interface CustomButtonProps extends ChakraButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "outline";
}

const Button: React.FC<CustomButtonProps> = ({
  variant = "primary",
  children,
  ...props
}) => {
  const colors = useThemeColors();

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          colorScheme: colors.button.primary.colorScheme,
          variant: "solid",
          color: colors.button.primary.color,
          _hover: {
            transform: "translateY(-1px)",
            boxShadow: "lg",
          },
          _active: {
            transform: "translateY(0)",
          },
        };
      case "secondary":
        return {
          colorScheme: "gray",
          variant: "solid",
          color: colors.button.secondary.color,
          bg: colors.button.secondary.bg,
          _hover: {
            bg: colors.button.secondary.hoverBg,
            transform: "translateY(-1px)",
          },
          _active: {
            transform: "translateY(0)",
          },
        };
      case "ghost":
        return {
          colorScheme: "gray",
          variant: "ghost",
          color: colors.button.ghost.color,
          _hover: {
            bg: colors.button.ghost.hoverBg,
          },
        };
      case "outline":
        return {
          colorScheme: "gray",
          variant: "outline",
          color: colors.button.outline.color,
          borderColor: colors.button.outline.borderColor,
          _hover: {
            bg: colors.button.outline.hoverBg,
            borderColor: colors.button.outline.hoverBorderColor,
          },
        };
      default:
        return {};
    }
  };

  return (
    <ChakraButton
      transition="all 0.2s"
      borderRadius="md"
      fontWeight="medium"
      {...getVariantStyles()}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
