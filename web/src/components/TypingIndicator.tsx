import React, { memo, useMemo } from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useTheme } from "@/contexts";
import { getCommonStyles, getAvatarConfig } from "@/theme/styles";

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
`;

const TypingIndicator: React.FC = memo(() => {
  const { theme } = useTheme();

  const styles = useMemo(() => getCommonStyles(theme), [theme]);
  const avatarConfig = useMemo(() => getAvatarConfig("bot"), []);

  const dots = useMemo(
    () => [{ delay: "0s" }, { delay: "0.2s" }, { delay: "0.4s" }],
    [],
  );

  return (
    <Box
      py={6}
      px={4}
      bg={styles.message.bot.bg}
      borderBottom="1px"
      borderColor={styles.border.borderColor}
    >
      <HStack align="flex-start" spacing={4} maxW="4xl" mx="auto">
        {/* Avatar */}
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg={avatarConfig.bg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          mt={1}
        >
          <Text fontSize="sm" color="white" fontWeight="bold">
            {avatarConfig.text}
          </Text>
        </Box>

        {/* Typing Animation */}
        <Box flex="1">
          <HStack spacing={1} mt={2}>
            {dots.map((dot, index) => (
              <Box
                key={index}
                w="8px"
                h="8px"
                bg="gray.400"
                borderRadius="full"
                animation={`${bounce} 1.4s infinite ease-in-out ${dot.delay}`}
              />
            ))}
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
});

export default TypingIndicator;
