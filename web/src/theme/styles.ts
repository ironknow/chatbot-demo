import { Theme } from "@/contexts";
export * from "./types";
export * from "./constants";
export * from "./utils";

export const getThemeStyles = (theme: Theme) => ({
  colors: {
    icon: theme === "light" ? "gray.600" : "gray.300",
    iconHover: theme === "light" ? "gray.100" : "gray.700",
    primary: {
      bg: theme === "light" ? "blue.500" : "purple.500",
      hover: theme === "light" ? "blue.600" : "purple.600",
      text: "white",
    },
    secondary: {
      bg: theme === "light" ? "gray.100" : "gray.600",
      hover: theme === "light" ? "gray.200" : "gray.500",
      text: theme === "light" ? "gray.800" : "white",
    },
    ghost: {
      text: theme === "light" ? "gray.600" : "gray.300",
      hover: theme === "light" ? "gray.100" : "gray.700",
    },
    outline: {
      border: theme === "light" ? "gray.300" : "gray.500",
      hoverBorder: theme === "light" ? "gray.400" : "gray.400",
      text: theme === "light" ? "gray.700" : "gray.300",
      hover: theme === "light" ? "gray.50" : "gray.600",
    },
  },
  animations: {
    hover: {
      transform: "scale(1.05)",
    },
    active: {
      transform: "scale(0.95)",
    },
    buttonHover: {
      transform: "translateY(-1px)",
    },
    buttonActive: {
      transform: "translateY(0)",
    },
  },
  shadows: {
    primary: "lg",
  },
});

export const getButtonVariantStyles = (variant: string, theme: Theme) => {
  switch (variant) {
    case "primary":
      return {
        colorScheme: theme === "light" ? "blue" : "purple",
        variant: "solid",
        sx: {
          color: "white !important",
          "&:hover": {
            color:
              theme === "light"
                ? "blue.100 !important"
                : "purple.100 !important",
            backgroundColor:
              theme === "light"
                ? "blue.600 !important"
                : "purple.600 !important",
            transform: "translateY(-1px) !important",
            boxShadow: "lg !important",
          },
          "&:active": {
            transform: "translateY(0) !important",
          },
        },
      };
    case "secondary":
      return {
        colorScheme: "gray",
        variant: "solid",
        sx: {
          color: theme === "light" ? "gray.800 !important" : "white !important",
          backgroundColor:
            theme === "light" ? "gray.100 !important" : "gray.600 !important",
          "&:hover": {
            color:
              theme === "light" ? "gray.600 !important" : "gray.200 !important",
            backgroundColor:
              theme === "light" ? "gray.200 !important" : "gray.500 !important",
            transform: "translateY(-1px) !important",
          },
          "&:active": {
            transform: "translateY(0) !important",
          },
        },
      };
    case "ghost":
      return {
        colorScheme: "gray",
        variant: "ghost",
        sx: {
          color:
            theme === "light" ? "gray.600 !important" : "gray.300 !important",
          "&:hover": {
            color:
              theme === "light" ? "gray.800 !important" : "white !important",
            backgroundColor:
              theme === "light" ? "gray.100 !important" : "gray.700 !important",
          },
        },
      };
    case "outline":
      return {
        colorScheme: "gray",
        variant: "outline",
        sx: {
          color:
            theme === "light" ? "gray.700 !important" : "gray.300 !important",
          borderColor:
            theme === "light" ? "gray.300 !important" : "gray.500 !important",
          "&:hover": {
            color:
              theme === "light" ? "gray.900 !important" : "white !important",
            backgroundColor:
              theme === "light" ? "gray.50 !important" : "gray.600 !important",
            borderColor:
              theme === "light" ? "gray.400 !important" : "gray.400 !important",
          },
        },
      };
    default:
      return {};
  }
};

export const getIconButtonStyles = (theme: Theme) => {
  const styles = getThemeStyles(theme);
  return {
    color: styles.colors.icon,
    _hover: {
      bg: styles.colors.iconHover,
      ...styles.animations.hover,
    },
    _active: styles.animations.active,
  };
};
