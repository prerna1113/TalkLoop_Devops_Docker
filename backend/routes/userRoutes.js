import express from "express";
import { registerUser, authUser, allUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", registerUser);
router.post("/login", authUser);

// Protected route for searching users
router.get("/", protect, allUsers);

export default router;
