import { CONFIG } from "../config/chatConfig.js";
import type { FlowStep, FlowData } from "../types/index.js";

export class FlowTrackingService {
  // Create a flow step object
  createFlowStep(
    stepConfig: any,
    status: string,
    data: Record<string, any> = {},
  ): FlowStep {
    return {
      id: stepConfig.ID,
      name: stepConfig.NAME,
      description: stepConfig.DESCRIPTION,
      status: status as FlowStep["status"],
      timestamp: new Date().toISOString(),
      data,
    };
  }

  // Create backend processing step
  createBackendStep(status: string, data: Record<string, any> = {}): FlowStep {
    return this.createFlowStep(
      CONFIG.FLOW_STEPS.BACKEND_PROCESSING,
      status,
      data,
    );
  }

  // Create AI processing step
  createAIStep(status: string, data: Record<string, any> = {}): FlowStep {
    return this.createFlowStep(CONFIG.FLOW_STEPS.AI_PROCESSING, status, data);
  }

  // Create response return step
  createResponseStep(status: string, data: Record<string, any> = {}): FlowStep {
    return this.createFlowStep(CONFIG.FLOW_STEPS.RESPONSE_RETURN, status, data);
  }

  // Create error step for empty message
  createEmptyMessageErrorStep(): FlowStep {
    return this.createBackendStep(CONFIG.STATUS.ERROR, {
      error: CONFIG.ERRORS.NO_MESSAGE_PROVIDED,
    });
  }

  // Update step with completion data
  completeStep(
    step: FlowStep,
    duration: number,
    additionalData: Record<string, any> = {},
  ): FlowStep {
    step.status = CONFIG.STATUS.COMPLETED as FlowStep["status"];
    step.duration = duration;
    step.data = {
      ...step.data,
      ...additionalData,
      processingTime: duration,
    };
    return step;
  }

  // Mark step as error
  markStepAsError(step: FlowStep, error: Error): FlowStep {
    step.status = CONFIG.STATUS.ERROR as FlowStep["status"];
    step.data = {
      ...step.data,
      error: error.message,
    };
    return step;
  }

  // Find and mark step as error by ID
  markStepAsErrorById(
    flowSteps: FlowStep[],
    stepId: string,
    error: Error,
  ): FlowStep[] {
    const stepIndex = flowSteps.findIndex((step) => step.id === stepId);
    if (stepIndex >= 0 && flowSteps[stepIndex]) {
      this.markStepAsError(flowSteps[stepIndex], error);
    }
    return flowSteps;
  }

  // Create flow data response
  createFlowDataResponse(
    flowSteps: FlowStep[],
    totalDuration: number,
    additionalData: Record<string, any> = {},
  ): FlowData {
    return {
      steps: flowSteps,
      totalDuration,
      ...additionalData,
    };
  }

  // Create empty message flow data
  createEmptyMessageFlowData(): FlowData {
    return {
      steps: [this.createEmptyMessageErrorStep()],
      totalDuration: 0,
    };
  }
}

export default new FlowTrackingService();
