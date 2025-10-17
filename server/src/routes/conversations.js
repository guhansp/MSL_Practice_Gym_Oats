// src/routes/conversations.js
import express from "express";
import { verifyToken } from "../middleware/authValidate.js";
import {
  generateCoachResponse,
  getConversationSummary,
  generateConversationFeedback,
} from "../services/aiCoach.js";
import pool from "../db/config.js";

const router = express.Router();

/**
 * Start conversation (first user turn)
 */
router.post("/:sessionId/chat", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const { sessionId } = req.params;
    const userId = req.userId || req.user?.user_id || req.user?.userId;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized (no userId)" });

    if (!sessionId || !message) {
      return res
        .status(400)
        .json({ error: "Session ID (param) and message are required" });
    }

    const response = await generateCoachResponse(sessionId, userId, message);

    res.json({
      success: true,
      message: response.message,
      turnNumber: response.turnNumber,
    });
  } catch (error) {
    console.error("Chat message error:", error);
    res.status(500).json({
      error: "Error processing chat message",
      details: error.message,
    });
  }
});

/**
 * Continue conversation (subsequent user turns)
 */
router.post("/continue", verifyToken, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.userId || req.user?.user_id || req.user?.userId;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized (no userId)" });
    if (!sessionId || !message) {
      return res
        .status(400)
        .json({ error: "Session ID and message are required" });
    }

    const response = await generateCoachResponse(sessionId, userId, message);

    res.json({
      success: true,
      aiResponse: response.message,
      turnNumber: response.turnNumber,
    });
  } catch (error) {
    console.error("Continue conversation error:", error);
    res
      .status(500)
      .json({ error: "Error continuing conversation", details: error.message });
  }
});

router.get("/:sessionId/getConversationSummary", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId || req.user?.user_id || req.user?.userId;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized (no userId)" });

    const summary = await getConversationSummary(sessionId, userId);
    res.json({ success: true, conversation: summary });
  } catch (error) {
    console.error("Get conversation error:", error);
    res
      .status(500)
      .json({ error: "Error fetching conversation", details: error.message });
  }
});

router.post("/:sessionId/feedback", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId || req.user?.user_id || req.user?.userId;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized (no userId)" });

    const result = await generateConversationFeedback(sessionId, userId);
    console.log("Feedback result:", result);
    res.json({ success: true, feedback: result.feedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    res
      .status(500)
      .json({ error: "Error generating feedback", details: error.message });
  }
});

router.post("/:sessionId/selfassess", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId || req.user?.user_id || req.user?.userId;
    const { user_notes, clarity_score, variability_score, polarity_score } =
      req.body;

    if (
      !user_notes ||
      clarity_score === undefined ||
      variability_score === undefined ||
      polarity_score === undefined
    ) {
      return res.status(400).json({
        error:
          "user_notes, clarity_score, variability_score and polarity_score are required",
      });
    }

    if (!userId)
      return res.status(401).json({ error: "Unauthorized (no userId)" });

    await pool.query(
      `UPDATE practice_sessions 
      SET 
      user_notes = $1,
      clarity_score = $2,
      variability_score = $3,
      polarity_score = $4          
       WHERE id = $5 AND user_id = $6`,
      [
        user_notes,
        clarity_score,
        variability_score,
        polarity_score,
        sessionId,
        userId,
      ]
    );

    res.json({ success: true, message: "Self assessment saved successfully" });
  } catch (error) {
    console.error("Self assess error:", error);
    res
      .status(500)
      .json({ error: "Error Self assess", details: error.message });
  }
});

export default router;
