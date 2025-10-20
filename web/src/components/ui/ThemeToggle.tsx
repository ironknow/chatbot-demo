import React from "react";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useTheme } from "@/contexts";
import IconButton from "./IconButton";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "solid" | "outline";
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = "sm",
  variant = "ghost",
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      aria-label="Toggle theme"
      icon={theme === "light" ? <MdDarkMode /> : <MdLightMode />}
      size={size}
      variant={variant}
      onClick={toggleTheme}
      tooltip={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    />
  );
};

export default ThemeToggle;
