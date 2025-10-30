import groqService from "./groqService.js";
import conversationService from "./conversationService.js";
import flowTrackingService from "./flowTrackingService.js";
import { CONFIG } from "../config/chatConfig.js";
import type {
  Message,
  FlowStep,
  ChatResponse,
  GroqResponse,
} from "../types/index.js";

export class MessageProcessingService {
  // Process backend step
  async processBackendStep(
    userMessage: string,
    conversationId: string,
    flowSteps: FlowStep[],
  ): Promise<Message[]> {
    const backendStartTime = Date.now();

    const step = flowTrackingService.createBackendStep(CONFIG.STATUS.ACTIVE, {
      message: userMessage,
      conversationId,
    });
    flowSteps.push(step);

    const conversationHistory =
      await conversationService.getConversation(conversationId);
    const backendDuration = Date.now() - backendStartTime;

    flowTrackingService.completeStep(step, backendDuration, {
      conversationHistoryLength: conversationHistory.length,
    });

    return conversationHistory;
  }

  // Process AI step
  async processAIStep(
    userMessage: string,
    conversationHistory: Message[],
    flowSteps: FlowStep[],
  ): Promise<GroqResponse> {
    const aiStartTime = Date.now();

    const step = flowTrackingService.createAIStep(CONFIG.STATUS.ACTIVE, {
      message: userMessage,
    });
    flowSteps.push(step);

    const aiResponseData = await groqService.getAIResponseWithFlowData(
      userMessage,
      conversationHistory,
    );
    const aiDuration = Date.now() - aiStartTime;

    flowTrackingService.completeStep(step, aiDuration, {
      response: aiResponseData.response || "",
      ragUsed: aiResponseData.ragUsed,
      ragContext: aiResponseData.ragContext,
      model: aiResponseData.model,
      tokens: aiResponseData.tokens,
    });

    return aiResponseData;
  }

  // Process response step
  async processResponseStep(
    userMessage: string,
    conversationId: string,
    conversationHistory: Message[],
    aiResponseData: GroqResponse,
    flowSteps: FlowStep[],
  ): Promise<void> {
    const responseStartTime = Date.now();

    const step = flowTrackingService.createResponseStep(CONFIG.STATUS.ACTIVE, {
      response: aiResponseData.response || "",
    });
    flowSteps.push(step);

    await conversationService.storeConversation(
      conversationId,
      conversationHistory,
      userMessage,
      aiResponseData.response || "",
    );

    const responseDuration = Date.now() - responseStartTime;

    flowTrackingService.completeStep(step, responseDuration, {
      conversationStored: true,
    });
  }

  // Process complete message flow
  async processMessage(
    userMessage: string,
    conversationId: string,
    flowSteps: FlowStep[],
    startTime: number,
  ): Promise<ChatResponse> {
    // Step 1: Backend Processing
    const conversationHistory = await this.processBackendStep(
      userMessage,
      conversationId,
      flowSteps,
    );

    // Step 2: AI Processing
    const aiResponseData = await this.processAIStep(
      userMessage,
      conversationHistory,
      flowSteps,
    );

    // Step 3: Response Return
    await this.processResponseStep(
      userMessage,
      conversationId,
      conversationHistory,
      aiResponseData,
      flowSteps,
    );

    const totalDuration = Date.now() - startTime;

    return {
      reply: aiResponseData.response || "",
      conversationId: conversationId || CONFIG.CONVERSATION.DEFAULT_ID,
      timestamp: new Date().toISOString(),
      flowData: flowTrackingService.createFlowDataResponse(
        flowSteps,
        totalDuration,
        {
          ragUsed: aiResponseData.ragUsed,
          webSearchUsed: aiResponseData.webSearchUsed,
          model: aiResponseData.model,
        },
      ),
    };
  }

  // Handle flow error
  handleFlowError(
    error: Error,
    currentStep: string | null,
    flowSteps: FlowStep[],
  ): void {
    if (currentStep && flowSteps.length > 0) {
      flowTrackingService.markStepAsErrorById(flowSteps, currentStep, error);
    }
  }
}

export default new MessageProcessingService();
