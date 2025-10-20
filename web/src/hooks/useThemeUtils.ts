import { useCallback, useMemo } from "react";
import { useTheme } from "@/contexts";
import {
  getCommonStyles,
  getTextColor,
  getStatusColors,
  getAvatarConfig,
} from "@/theme/styles";

// Custom hook for theme-related utilities
export const useThemeUtils = () => {
  const { theme } = useTheme();

  const styles = useMemo(() => getCommonStyles(theme), [theme]);

  const getTextColorUtil = useCallback(
    (variant: "primary" | "secondary" | "tertiary" = "primary") => {
      return getTextColor(theme, variant);
    },
    [theme],
  );

  const getStatusColorUtil = useCallback(
    (status: "online" | "offline") => {
      return getStatusColors(theme, status);
    },
    [theme],
  );

  const getAvatarConfigUtil = useCallback((type: "user" | "bot") => {
    return getAvatarConfig(type);
  }, []);

  return {
    theme,
    styles,
    getTextColor: getTextColorUtil,
    getStatusColors: getStatusColorUtil,
    getAvatarConfig: getAvatarConfigUtil,
  };
};

// Custom hook for scroll behavior
export const useScrollToBottom = () => {
  const scrollToBottom = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return scrollToBottom;
};

// Custom hook for keyboard shortcuts
export const useKeyboardShortcuts = (handlers: Record<string, () => void>) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;

      // Create shortcut key
      const shortcut = [
        ctrlKey || metaKey ? "ctrl" : "",
        shiftKey ? "shift" : "",
        key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+");

      if (handlers[shortcut]) {
        event.preventDefault();
        handlers[shortcut]();
      }
    },
    [handlers],
  );

  return handleKeyDown;
};
