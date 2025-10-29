import { CONFIG } from "../config/chatConfig.js";

export class FlowTrackingService {
  // Create a flow step object
  createFlowStep(stepConfig, status, data = {}) {
    return {
      id: stepConfig.ID,
      name: stepConfig.NAME,
      description: stepConfig.DESCRIPTION,
      status,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  // Create backend processing step
  createBackendStep(status, data = {}) {
    return this.createFlowStep(
      CONFIG.FLOW_STEPS.BACKEND_PROCESSING,
      status,
      data,
    );
  }

  // Create AI processing step
  createAIStep(status, data = {}) {
    return this.createFlowStep(CONFIG.FLOW_STEPS.AI_PROCESSING, status, data);
  }

  // Create response return step
  createResponseStep(status, data = {}) {
    return this.createFlowStep(CONFIG.FLOW_STEPS.RESPONSE_RETURN, status, data);
  }

  // Create error step for empty message
  createEmptyMessageErrorStep() {
    return this.createBackendStep(CONFIG.STATUS.ERROR, {
      error: CONFIG.ERRORS.NO_MESSAGE_PROVIDED,
    });
  }

  // Update step with completion data
  completeStep(step, duration, additionalData = {}) {
    step.status = CONFIG.STATUS.COMPLETED;
    step.duration = duration;
    step.data = {
      ...step.data,
      ...additionalData,
      processingTime: duration,
    };
    return step;
  }

  // Mark step as error
  markStepAsError(step, error) {
    step.status = CONFIG.STATUS.ERROR;
    step.data = {
      ...step.data,
      error: error.message,
    };
    return step;
  }

  // Find and mark step as error by ID
  markStepAsErrorById(flowSteps, stepId, error) {
    const stepIndex = flowSteps.findIndex((step) => step.id === stepId);
    if (stepIndex >= 0) {
      this.markStepAsError(flowSteps[stepIndex], error);
    }
    return flowSteps;
  }

  // Create flow data response
  createFlowDataResponse(flowSteps, totalDuration, additionalData = {}) {
    return {
      steps: flowSteps,
      totalDuration,
      ...additionalData,
    };
  }

  // Create empty message flow data
  createEmptyMessageFlowData() {
    return {
      steps: [this.createEmptyMessageErrorStep()],
      totalDuration: 0,
    };
  }
}

export default new FlowTrackingService();
