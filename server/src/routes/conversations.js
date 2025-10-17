// src/routes/conversations.js
import express from "express";
import { verifyToken } from "../middleware/authValidate.js";
import {
  generateCoachResponse,
  getConversationSummary,
  generateConversationFeedback,
} from "../services/aiCoach.js";

const router = express.Router();

/**
 * Start conversation (first user turn)
 */
router.post("/start", verifyToken, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.userId || req.user?.user_id || req.user?.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized (no userId)" });
    if (!sessionId || !message) {
      return res.status(400).json({ error: "Session ID and message are required" });
    }

    const response = await generateCoachResponse(sessionId, userId, message);

    res.json({
      success: true,
      aiResponse: response.message,
      turnNumber: response.turnNumber,
    });
  } catch (error) {
    console.error("Start conversation error:", error);
    res.status(500).json({ error: "Error starting conversation", details: error.message });
  }
});

/**
 * Continue conversation (subsequent user turns)
 */
router.post("/continue", verifyToken, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.userId || req.user?.user_id || req.user?.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized (no userId)" });
    if (!sessionId || !message) {
      return res.status(400).json({ error: "Session ID and message are required" });
    }

    const response = await generateCoachResponse(sessionId, userId, message);

    res.json({
      success: true,
      aiResponse: response.message,
      turnNumber: response.turnNumber,
    });
  } catch (error) {
    console.error("Continue conversation error:", error);
    res.status(500).json({ error: "Error continuing conversation", details: error.message });
  }
});

/**
 * Get conversation transcript
 */
router.get("/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId || req.user?.user_id || req.user?.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized (no userId)" });

    const summary = await getConversationSummary(sessionId, userId);
    res.json({ success: true, conversation: summary });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "Error fetching conversation", details: error.message });
  }
});

/**
 * Generate AI feedback summary
 */
router.post("/:sessionId/feedback", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId || req.user?.user_id || req.user?.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized (no userId)" });

    const result = await generateConversationFeedback(sessionId, userId);
    res.json({ success: true, feedback: result.feedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({ error: "Error generating feedback", details: error.message });
  }
});

export default router;
