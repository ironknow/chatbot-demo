import React from "react";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useColorMode } from "@chakra-ui/react";
import IconButton from "./IconButton";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "solid" | "outline";
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = "sm",
  variant = "ghost",
}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle theme"
      icon={colorMode === "light" ? <MdDarkMode /> : <MdLightMode />}
      size={size}
      variant={variant}
      onClick={toggleColorMode}
      tooltip={`Switch to ${colorMode === "light" ? "dark" : "light"} theme`}
    />
  );
};

export default ThemeToggle;
