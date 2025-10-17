import express from "express";
import chatController from "../controllers/chatController.js";

const router = express.Router();

// Chat routes
router.post("/", chatController.sendMessage);
router.get("/:conversationId", chatController.getConversation);
router.delete("/:conversationId", chatController.clearConversation);

export default router;
