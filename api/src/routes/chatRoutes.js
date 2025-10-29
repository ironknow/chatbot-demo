import express from "express";
import chatController from "../controllers/chatController.js";

const router = express.Router();

// Chat routes
router.post("/", chatController.sendMessage.bind(chatController));
router.post("/create", chatController.createConversation.bind(chatController));
router.get("/", chatController.getAllConversations.bind(chatController));
router.get(
  "/:conversationId",
  chatController.getConversation.bind(chatController),
);
router.delete(
  "/:conversationId",
  chatController.clearConversation.bind(chatController),
);

// RAG testing route
router.post("/test-rag", chatController.testRAGSearch.bind(chatController));

export default router;
