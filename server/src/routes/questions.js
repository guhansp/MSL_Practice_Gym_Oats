import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, category, question, difficulty, context, tags, key_themes, estimated_response_time, is_active FROM questions WHERE is_active = TRUE ORDER BY id"
    );
    res.status(200).json({
      message: "Questions loaded successfully",
      total: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching questions from database:", err);
    res.status(500).json({ message: "Failed to load questions" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    const result = await pool.query(
      "SELECT id, category, question, difficulty, context, tags, key_themes, estimated_response_time FROM questions WHERE id = $1",
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Question loaded successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Error fetching question by ID:", err);
    res.status(500).json({ message: "Failed to load question" });
  }
});

router.get("/:id/personas", async (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    const result = await pool.query(
      "SELECT persona_id FROM question_personas WHERE question_id = $1",
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No personas found for this question" });
    }

    
    const personaIds = result.rows.map(r => r.persona_id);

    res.status(200).json({
      message: "Persona IDs retrieved successfully",
      personas: personaIds
    });
  } catch (err) {
    console.error("Error fetching personas for question:", err);
    res.status(500).json({ message: "Failed to load question personas" });
  }
});

export default router;
