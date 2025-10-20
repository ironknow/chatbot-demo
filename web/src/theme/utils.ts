import { Theme } from "@/contexts";
import { THEME_COLORS, THEME_CONFIG, AVATAR_CONFIG } from "./constants";

// Theme-aware color utilities
export const getThemeColors = (theme: Theme) => THEME_COLORS[theme];

// Background color utilities
export const getBackgroundColor = (
  theme: Theme,
  variant: "primary" | "secondary" | "tertiary" = "primary",
) => {
  return getThemeColors(theme).background[variant];
};

// Text color utilities
export const getTextColor = (
  theme: Theme,
  variant: "primary" | "secondary" | "tertiary" = "primary",
) => {
  return getThemeColors(theme).text[variant];
};

// Border color utilities
export const getBorderColor = (
  theme: Theme,
  variant: "primary" | "secondary" = "primary",
) => {
  return getThemeColors(theme).border[variant];
};

// Status color utilities
export const getStatusColors = (theme: Theme, status: "online" | "offline") => {
  const colors = getThemeColors(theme).status;
  return {
    bg: colors[status],
    text: status === "online" ? colors.onlineText : colors.offlineText,
  };
};

// Avatar configuration utilities
export const getAvatarConfig = (type: "user" | "bot") => AVATAR_CONFIG[type];

// Layout utilities
export const getLayoutStyles = () => ({
  sidebarWidth: THEME_CONFIG.SIDEBAR_WIDTH,
  maxContentWidth: THEME_CONFIG.MAX_CONTENT_WIDTH,
  contentPadding: THEME_CONFIG.CONTENT_PADDING,
  messagePadding: THEME_CONFIG.MESSAGE_PADDING,
  avatarSize: THEME_CONFIG.AVATAR_SIZE,
});

// Animation utilities
export const getAnimationStyles = () => ({
  transition: THEME_CONFIG.TRANSITION_DURATION,
  typingDelay: {
    min: THEME_CONFIG.TYPING_DELAY_MIN,
    max: THEME_CONFIG.TYPING_DELAY_MAX,
  },
});

// Common component styles
export const getCommonStyles = (theme: Theme) => ({
  container: {
    bg: getBackgroundColor(theme),
    color: getTextColor(theme),
  },
  border: {
    borderColor: getBorderColor(theme),
  },
  card: {
    bg: getBackgroundColor(theme, "primary"),
    borderColor: getBorderColor(theme),
  },
  message: {
    user: {
      bg: getBackgroundColor(theme, "primary"),
    },
    bot: {
      bg: getBackgroundColor(theme, "secondary"),
    },
  },
});

// Responsive utilities
export const getResponsiveStyles = () => ({
  sidebar: {
    base: 0,
    md: "260px",
  },
  content: {
    base: "100%",
    md: "calc(100% - 260px)",
  },
});

// Focus and hover utilities
export const getInteractiveStyles = (theme: Theme) => ({
  focus: {
    borderColor: theme === "light" ? "blue.500" : "blue.400",
    boxShadow: `0 0 0 1px ${theme === "light" ? "blue.500" : "blue.400"}`,
  },
  hover: {
    transform: "translateY(-1px)",
    boxShadow: "lg",
  },
  active: {
    transform: "translateY(0)",
  },
});
