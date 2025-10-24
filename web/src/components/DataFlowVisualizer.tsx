import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Collapse,
  Divider,
  Code,
  Progress,
} from "@chakra-ui/react";
import {
  MdInput,
  MdRefresh,
  MdCheckCircle,
  MdError,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { useThemeColors } from "@/theme/colors";
import { FlowStep } from "@/types";

interface DataFlowVisualizerProps {
  isVisible: boolean;
  onToggle: () => void;
  currentStep?: string;
  flowData?: FlowStep[];
  isProcessing?: boolean;
}

const DataFlowVisualizer: React.FC<DataFlowVisualizerProps> = ({
  isVisible,
  onToggle,
  currentStep,
  flowData = [],
  isProcessing = false,
}) => {
  const colors = useThemeColors();

  const getStatusColor = (status: FlowStep["status"]) => {
    switch (status) {
      case "active":
        return "blue";
      case "completed":
        return "green";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status: FlowStep["status"]) => {
    switch (status) {
      case "active":
        return MdRefresh;
      case "completed":
        return MdCheckCircle;
      case "error":
        return MdError;
      default:
        return MdInput;
    }
  };

  if (!isVisible) return null;

  return (
    <Box
      position="fixed"
      top="20px"
      right="20px"
      width="400px"
      maxHeight="80vh"
      bg={colors.background.secondary}
      border="1px"
      borderColor={colors.border.primary}
      borderRadius="lg"
      boxShadow="lg"
      zIndex={1000}
      overflow="hidden"
    >
      {/* Header */}
      <Box
        p={4}
        borderBottom="1px"
        borderColor={colors.border.primary}
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: colors.interactive.hover }}
      >
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
            Data Flow
          </Text>
          <HStack spacing={2}>
            {isProcessing && (
              <Badge colorScheme="blue" variant="solid">
                Processing
              </Badge>
            )}
            <Icon
              as={MdKeyboardArrowDown}
              color={colors.text.secondary}
              transform={isVisible ? "rotate(180deg)" : "rotate(0deg)"}
              transition="transform 0.2s"
            />
          </HStack>
        </HStack>
      </Box>

      {/* Content */}
      <Collapse in={isVisible} animateOpacity>
        <Box p={4} maxHeight="60vh" overflowY="auto">
          <VStack spacing={4} align="stretch">
            {flowData.length === 0 ? (
              <Text color={colors.text.tertiary} textAlign="center" py={8}>
                No flow data available
              </Text>
            ) : (
              flowData.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = step.status === "completed";
                const isError = step.status === "error";

                return (
                  <Box key={step.id}>
                    <HStack
                      spacing={3}
                      p={3}
                      borderRadius="md"
                      bg={
                        isActive
                          ? colors.background.tertiary
                          : isCompleted
                            ? `${colors.accent.success}20`
                            : "transparent"
                      }
                      border={
                        isActive
                          ? `1px solid ${colors.accent.primary}`
                          : isError
                            ? `1px solid ${colors.accent.error}`
                            : "1px solid transparent"
                      }
                    >
                      <Icon
                        as={getStatusIcon(step.status)}
                        color={
                          isActive
                            ? colors.accent.primary
                            : isCompleted
                              ? colors.accent.success
                              : isError
                                ? colors.accent.error
                                : colors.text.tertiary
                        }
                        boxSize={5}
                      />
                      <VStack align="start" spacing={1} flex="1">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={colors.text.primary}
                        >
                          {step.name}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={colors.text.secondary}
                          lineHeight="short"
                        >
                          {step.description}
                        </Text>
                        {step.duration && (
                          <Text fontSize="xs" color={colors.text.tertiary}>
                            {step.duration}ms
                          </Text>
                        )}
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(step.status)}
                        variant={isActive ? "solid" : "subtle"}
                        fontSize="xs"
                      >
                        {step.status}
                      </Badge>
                    </HStack>

                    {/* Step Data */}
                    {step.data && (
                      <Box mt={2} ml={8}>
                        <Code
                          fontSize="xs"
                          p={2}
                          borderRadius="md"
                          bg={colors.background.tertiary}
                          color={colors.text.secondary}
                          whiteSpace="pre-wrap"
                          wordBreak="break-all"
                        >
                          {JSON.stringify(step.data, null, 2)}
                        </Code>
                      </Box>
                    )}

                    {/* Arrow between steps */}
                    {index < flowData.length - 1 && (
                      <Box display="flex" justifyContent="center" py={2}>
                        <Icon
                          as={MdKeyboardArrowDown}
                          color={colors.text.tertiary}
                          boxSize={4}
                        />
                      </Box>
                    )}
                  </Box>
                );
              })
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <Box mt={4}>
                <Divider mb={3} />
                <HStack spacing={2}>
                  <Progress
                    size="sm"
                    isIndeterminate
                    colorScheme="blue"
                    flex="1"
                  />
                  <Text fontSize="xs" color={colors.text.secondary}>
                    Processing...
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default DataFlowVisualizer;
