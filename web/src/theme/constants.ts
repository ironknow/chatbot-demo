import { MessageAction, WelcomeSuggestion, ThemeColors } from "./types";

// Theme constants and configuration
export const THEME_CONFIG = {
  // Layout constants
  SIDEBAR_WIDTH: "260px",
  MAX_CONTENT_WIDTH: "4xl",

  // Animation durations
  TRANSITION_DURATION: "0.2s",
  TYPING_DELAY_MIN: 1000,
  TYPING_DELAY_MAX: 2000,

  // Spacing
  CONTENT_PADDING: 4,
  MESSAGE_PADDING: 6,

  // Avatar sizes
  AVATAR_SIZE: 8,

  // Border radius
  BORDER_RADIUS: "md",
  BORDER_RADIUS_LG: "lg",
  BORDER_RADIUS_FULL: "full",
} as const;

// Color mappings for consistent theming
export const THEME_COLORS: ThemeColors = {
  light: {
    background: {
      primary: "white",
      secondary: "gray.50",
      tertiary: "gray.100",
    },
    text: {
      primary: "gray.800",
      secondary: "gray.600",
      tertiary: "gray.500",
    },
    border: {
      primary: "gray.200",
      secondary: "gray.100",
    },
    status: {
      online: "green.100",
      offline: "red.100",
      onlineText: "green.700",
      offlineText: "red.700",
    },
  },
  dark: {
    background: {
      primary: "gray.800",
      secondary: "gray.700",
      tertiary: "gray.600",
    },
    text: {
      primary: "white",
      secondary: "gray.300",
      tertiary: "gray.400",
    },
    border: {
      primary: "gray.700",
      secondary: "gray.600",
    },
    status: {
      online: "green.100",
      offline: "red.100",
      onlineText: "green.700",
      offlineText: "red.700",
    },
  },
} as const;

// Avatar configurations
export const AVATAR_CONFIG = {
  user: {
    bg: "blue.500",
    text: "U",
  },
  bot: {
    bg: "green.500",
    text: "AI",
  },
} as const;

// Message action configurations
export const MESSAGE_ACTIONS: MessageAction[] = [
  { icon: "MdThumbUp", label: "Good response", ariaLabel: "Good response" },
  { icon: "MdThumbDown", label: "Bad response", ariaLabel: "Bad response" },
  { icon: "MdContentCopy", label: "Copy", ariaLabel: "Copy" },
  { icon: "MdRefresh", label: "Regenerate", ariaLabel: "Regenerate" },
];

// Welcome message suggestions
export const WELCOME_SUGGESTIONS: WelcomeSuggestion[] = [
  { icon: "MdLightbulb", text: "Explain quantum computing", color: "blue" },
  { icon: "MdCode", text: "Write a Python function", color: "green" },
  { icon: "MdLanguage", text: "Translate 'Hello' to Spanish", color: "purple" },
  { icon: "MdSchool", text: "Explain photosynthesis", color: "orange" },
];
