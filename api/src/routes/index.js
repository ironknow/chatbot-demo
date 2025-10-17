import express from "express";
import chatRoutes from "./chatRoutes.js";
import chatController from "../controllers/chatController.js";

const router = express.Router();

// Health check route
router.get("/health", chatController.healthCheck);

// Chat API routes
router.use("/chat", chatRoutes);

export default router;
