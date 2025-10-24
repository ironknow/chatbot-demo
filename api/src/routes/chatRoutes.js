import express from "express";
import chatController from "../controllers/chatController.js";

const router = express.Router();

// Chat routes
router.post("/", chatController.sendMessage);
router.get("/", chatController.getAllConversations);
router.get("/:conversationId", chatController.getConversation);
router.delete("/:conversationId", chatController.clearConversation);

// RAG testing route
router.post("/test-rag", chatController.testRAGSearch);

export default router;
