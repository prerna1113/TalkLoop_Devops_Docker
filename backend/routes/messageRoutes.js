import express from "express";
import { allMessages, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch all messages in a chat
router.route("/:chatId").get(protect, allMessages);

// Send a new message
router.route("/").post(protect, sendMessage);

export default router;
