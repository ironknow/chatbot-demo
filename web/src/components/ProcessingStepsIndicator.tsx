import React, { memo } from "react";
import {
  Box,
  HStack,
  Text,
  VStack,
  CircularProgress,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import {
  MdCheckCircle,
  MdError,
  MdHourglassEmpty,
  MdSearch,
  MdPsychology,
  MdStorage,
  MdRefresh,
  MdPublic,
} from "react-icons/md";
import { useThemeColors } from "@/theme/colors";

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "active" | "completed" | "error" | "skipped";
  timestamp?: string;
  data?: any;
}

interface ProcessingStepsIndicatorProps {
  steps: ProcessingStep[];
  isVisible?: boolean;
}

const stepIcons: Record<string, React.ElementType> = {
  "backend-processing": MdStorage,
  "rag-processing": MdSearch,
  "web-search-processing": MdPublic,
  "ai-processing": MdPsychology,
  thinking: MdPsychology,
  "response-processing": MdRefresh,
};

const getStepIcon = (stepId: string): React.ElementType => {
  return stepIcons[stepId] || MdHourglassEmpty;
};

const ProcessingStepsIndicator: React.FC<ProcessingStepsIndicatorProps> = memo(
  ({ steps, isVisible = true }) => {
    const colors = useThemeColors();

    if (!isVisible || steps.length === 0) {
      return null;
    }

    return (
      <Box
        py={4}
        px={4}
        bg={colors.background.secondary}
        borderBottom="1px"
        borderColor={colors.border.primary}
      >
        <HStack align="flex-start" spacing={4} maxW="4xl" mx="auto">
          {/* Avatar */}
          <Box
            w={8}
            h={8}
            borderRadius="full"
            bg="blue.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            mt={1}
          >
            <Text fontSize="sm" color="white" fontWeight="bold">
              B
            </Text>
          </Box>

          {/* Steps */}
          <Box flex="1">
            <VStack align="stretch" spacing={2}>
              {steps.map((step) => {
                const IconComponent = getStepIcon(step.id);
                const isActive = step.status === "active";
                const isCompleted =
                  step.status === "completed" || step.status === "skipped";
                const isError = step.status === "error";

                return (
                  <Tooltip
                    key={step.id}
                    label={step.description}
                    placement="right"
                  >
                    <HStack
                      spacing={3}
                      p={2}
                      borderRadius="md"
                      bg={isActive ? colors.background.primary : "transparent"}
                      borderLeft="3px solid"
                      borderColor={
                        isError
                          ? "red.500"
                          : isCompleted
                            ? "green.500"
                            : isActive
                              ? "blue.500"
                              : "gray.300"
                      }
                      transition="all 0.2s"
                    >
                      {/* Status Icon */}
                      <Box flexShrink={0}>
                        {isActive ? (
                          <CircularProgress
                            isIndeterminate
                            size="20px"
                            color="blue.500"
                          />
                        ) : isCompleted ? (
                          <Icon
                            as={MdCheckCircle}
                            color={
                              step.status === "skipped"
                                ? "gray.400"
                                : "green.500"
                            }
                            boxSize="20px"
                          />
                        ) : isError ? (
                          <Icon as={MdError} color="red.500" boxSize="20px" />
                        ) : (
                          <Icon
                            as={MdHourglassEmpty}
                            color="gray.400"
                            boxSize="20px"
                          />
                        )}
                      </Box>

                      {/* Step Icon */}
                      <Icon
                        as={IconComponent}
                        color={
                          isActive
                            ? "blue.500"
                            : isCompleted
                              ? "green.500"
                              : "gray.400"
                        }
                        boxSize="18px"
                      />

                      {/* Step Info */}
                      <VStack align="flex-start" spacing={0} flex="1">
                        <Text
                          fontSize="sm"
                          fontWeight={isActive ? "semibold" : "normal"}
                          color={
                            isActive
                              ? colors.text.primary
                              : isCompleted
                                ? colors.text.secondary
                                : colors.text.tertiary
                          }
                        >
                          {step.name}
                          {step.status === "skipped" && (
                            <Text
                              as="span"
                              color="gray.400"
                              fontSize="xs"
                              ml={2}
                            >
                              (skipped)
                            </Text>
                          )}
                        </Text>
                        {step.description && (
                          <Text
                            fontSize="xs"
                            color={colors.text.tertiary}
                            noOfLines={1}
                          >
                            {step.description}
                          </Text>
                        )}
                        {step.data && Object.keys(step.data).length > 0 && (
                          <Text fontSize="xs" color={colors.text.tertiary}>
                            {step.data.ragUsed && "• RAG used"}
                            {step.data.webSearchUsed && "• Web search used"}
                            {step.data.model && `• Model: ${step.data.model}`}
                            {step.data.tokens &&
                              `• Tokens: ${step.data.tokens}`}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Tooltip>
                );
              })}
            </VStack>
          </Box>
        </HStack>
      </Box>
    );
  },
);

ProcessingStepsIndicator.displayName = "ProcessingStepsIndicator";

export default ProcessingStepsIndicator;
