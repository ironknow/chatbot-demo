import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, VStack, Text, Button } from "@chakra-ui/react";
import { MdRefresh, MdError } from "react-icons/md";
import { useThemeColors } from "@/theme/colors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const colors = useThemeColors();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={colors.background.primary}
      px={4}
    >
      <VStack spacing={6} maxW="md" textAlign="center">
        <Box
          w={16}
          h={16}
          borderRadius="full"
          bg="red.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <MdError size={32} color="red" />
        </Box>

        <VStack spacing={3}>
          <Text fontSize="xl" fontWeight="bold" color={colors.text.primary}>
            Oops! Something went wrong
          </Text>
          <Text fontSize="md" color={colors.text.secondary}>
            We encountered an unexpected error. Please try refreshing the page.
          </Text>
          {error && (
            <Text
              fontSize="sm"
              color={colors.text.tertiary}
              fontFamily="mono"
              bg={colors.background.secondary}
              p={3}
              borderRadius="md"
              border="1px"
              borderColor={colors.border.primary}
              maxW="full"
              overflow="auto"
            >
              {error.message}
            </Text>
          )}
        </VStack>

        <Button
          leftIcon={<MdRefresh />}
          onClick={handleRetry}
          variant="primary"
          size="lg"
        >
          Refresh Page
        </Button>
      </VStack>
    </Box>
  );
};

export default ErrorBoundary;
