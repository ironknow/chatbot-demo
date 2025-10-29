import { useState, useCallback, useRef } from "react";
import {
  MdInput,
  MdSend,
  MdApi,
  MdPsychology,
  MdStorage,
  MdRefresh,
  MdCheckCircle,
} from "react-icons/md";
import { FlowStep } from "../types/flow";

interface UseFlowTrackingReturn {
  currentStep: string | null;
  flowSteps: FlowStep[];
  isProcessing: boolean;
  startFlow: () => void;
  setStep: (stepId: string, data?: any) => void;
  completeStep: (stepId: string, duration?: number) => void;
  errorStep: (stepId: string, error: string) => void;
  completeFlow: () => void;
  clearFlow: () => void;
}

export const useFlowTracking = (): UseFlowTrackingReturn => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const stepStartTimes = useRef<Map<string, number>>(new Map());

  // Initialize flow steps
  const [flowSteps, setSteps] = useState<FlowStep[]>([
    {
      id: "user-input",
      name: "User Input",
      description: "User types message in ChatInput component",
      icon: MdInput,
      status: "pending",
    },
    {
      id: "input-processing",
      name: "Input Processing",
      description: "useChat hook processes input and validates",
      icon: MdSend,
      status: "pending",
    },
    {
      id: "api-call",
      name: "API Call",
      description: "chatService sends HTTP request to backend",
      icon: MdApi,
      status: "pending",
    },
    {
      id: "backend-processing",
      name: "Backend Processing",
      description: "ChatController receives and processes request",
      icon: MdStorage,
      status: "pending",
    },
    {
      id: "ai-processing",
      name: "AI Processing",
      description: "GroqService generates response with optional RAG",
      icon: MdPsychology,
      status: "pending",
    },
    {
      id: "response-return",
      name: "Response Return",
      description: "Response sent back through API to frontend",
      icon: MdRefresh,
      status: "pending",
    },
    {
      id: "ui-update",
      name: "UI Update",
      description: "ChatMessage component displays the response",
      icon: MdCheckCircle,
      status: "pending",
    },
  ]);

  const startFlow = useCallback(() => {
    setIsProcessing(true);
    setCurrentStep("user-input");
    stepStartTimes.current.clear();
  }, []);

  const setStep = useCallback((stepId: string, data?: any) => {
    setCurrentStep(stepId);
    stepStartTimes.current.set(stepId, Date.now());

    // Update the step with data
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              status: "active" as const,
              data,
              timestamp: new Date().toISOString(),
            }
          : step,
      ),
    );
  }, []);

  const completeStep = useCallback((stepId: string, duration?: number) => {
    const startTime = stepStartTimes.current.get(stepId);
    const actualDuration = duration || (startTime ? Date.now() - startTime : 0);

    // Update the step to completed status
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? { ...step, status: "completed" as const, duration: actualDuration }
          : step,
      ),
    );
  }, []);

  const errorStep = useCallback((stepId: string, error: string) => {
    const startTime = stepStartTimes.current.get(stepId);
    const duration = startTime ? Date.now() - startTime : 0;

    // Update the step to error status
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? { ...step, status: "error" as const, duration, data: { error } }
          : step,
      ),
    );
  }, []);

  const completeFlow = useCallback(() => {
    setIsProcessing(false);
    setCurrentStep(null);
  }, []);

  const clearFlow = useCallback(() => {
    setIsProcessing(false);
    setCurrentStep(null);
    stepStartTimes.current.clear();
    // Reset all steps to pending
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        status: "pending" as const,
        data: undefined,
        duration: undefined,
      })),
    );
  }, []);

  return {
    currentStep,
    flowSteps,
    isProcessing,
    startFlow,
    setStep,
    completeStep,
    errorStep,
    completeFlow,
    clearFlow,
  };
};
