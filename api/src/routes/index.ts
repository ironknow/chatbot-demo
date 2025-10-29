import { Router } from "express";
import chatRoutes from "./chatRoutes.js";
import chatController from "../controllers/chatController.js";

const router: Router = Router();

// Health check route
router.get("/health", chatController.healthCheck.bind(chatController));

// Chat API routes
router.use("/chat", chatRoutes);

export default router;
