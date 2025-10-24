import { useColorModeValue } from "@chakra-ui/react";

// Centralized color system using useColorModeValue
export const useThemeColors = () => {
    return {
        // Background colors
        background: {
            primary: useColorModeValue("gray.50", "gray.900"),
            secondary: useColorModeValue("white", "gray.800"),
            tertiary: useColorModeValue("gray.100", "gray.700"),
        },

        // Text colors
        text: {
            primary: useColorModeValue("gray.900", "white"),
            secondary: useColorModeValue("gray.600", "gray.300"),
            tertiary: useColorModeValue("gray.500", "gray.400"),
            muted: useColorModeValue("gray.400", "gray.500"),
        },

        // Border colors
        border: {
            primary: useColorModeValue("gray.200", "gray.700"),
            secondary: useColorModeValue("gray.300", "gray.600"),
        },

        // Interactive colors
        interactive: {
            hover: useColorModeValue("gray.100", "gray.700"),
            active: useColorModeValue("gray.200", "gray.600"),
        },

        // Accent colors (for status indicators, highlights, etc.)
        accent: {
            primary: useColorModeValue("blue.500", "blue.400"),
            success: useColorModeValue("green.500", "green.400"),
            error: useColorModeValue("red.500", "red.400"),
            warning: useColorModeValue("yellow.500", "yellow.400"),
        },

        // Blue theme colors (for active states, buttons, etc.)
        blue: {
            bg: useColorModeValue("blue.50", "blue.900"),
            bgHover: useColorModeValue("blue.100", "blue.800"),
            border: useColorModeValue("blue.200", "blue.800"),
            text: useColorModeValue("blue.900", "blue.100"),
            textSecondary: useColorModeValue("blue.700", "blue.300"),
            textMuted: useColorModeValue("blue.600", "blue.400"),
            dot: useColorModeValue("blue.600", "blue.400"),
        },

        // Button colors
        button: {
            primary: {
                colorScheme: useColorModeValue("blue", "purple"),
                color: "white",
            },
            secondary: {
                color: useColorModeValue("gray.800", "white"),
                bg: useColorModeValue("gray.100", "gray.600"),
                hoverBg: useColorModeValue("gray.200", "gray.500"),
            },
            ghost: {
                color: useColorModeValue("gray.600", "gray.300"),
                hoverBg: useColorModeValue("gray.100", "gray.700"),
            },
            outline: {
                color: useColorModeValue("gray.700", "gray.300"),
                borderColor: useColorModeValue("gray.300", "gray.500"),
                hoverBg: useColorModeValue("gray.50", "gray.600"),
                hoverBorderColor: useColorModeValue("gray.400", "gray.400"),
            },
        },
    };
};
