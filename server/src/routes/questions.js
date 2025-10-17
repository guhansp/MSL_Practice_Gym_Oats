import express from "express";
import pool from "../db/config.js   ";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        q.id,
        q.category,
        q.question,
        q.difficulty,
        q.context,
        q.tags,
        q.key_themes,
        q.estimated_response_time,
        q.is_active,
        COALESCE(
          json_agg(qp.persona_id ORDER BY qp.persona_id)
          FILTER (WHERE qp.persona_id IS NOT NULL),
          '[]'
        ) AS personas
      FROM questions q
      LEFT JOIN question_personas qp ON q.id = qp.question_id
      WHERE q.is_active = TRUE
      GROUP BY q.id
      ORDER BY q.id;
    `;

    const result = await pool.query(query);

    res.status(200).json({
      message: "Questions loaded successfully",
      total: result.rowCount,
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
