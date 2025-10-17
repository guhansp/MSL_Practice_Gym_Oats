import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/authValidate.js";

const router = express.Router();


router.post("/", verifyToken, async (req, res) => {
  const { questionId, personaId } = req.body;
   const userId = req.user.userId;
  console.log("Create session request:", req.user);

  try {
    if (!questionId || !personaId) {
      return res
        .status(400)
        .json({ error: "Question ID and Persona ID required" });
    }

    const questionCheck = await pool.query(
      "SELECT id, question, category FROM questions WHERE id = $1",
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const personaCheck = await pool.query(
      "SELECT id, name FROM personas WHERE id = $1",
      [personaId]
    );

    if (personaCheck.rows.length === 0) {
      return res.status(404).json({ error: "Persona not found" });
    }

    const result = await pool.query(
      `INSERT INTO practice_sessions 
       (user_id, question_id, persona_id, started_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, questionId, personaId]
    );

    const session = result.rows[0];
    const question = questionCheck.rows[0];
    const persona = personaCheck.rows[0];

    res.status(201).json({
      message: "Practice session created",
      session: {
        ...session,
        question: question.question,
        category: question.category,
        persona_name: persona.name,
      },
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ error: "Error creating session" });
  }
});

router.get("/",verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT 
         ps.id,
         ps.started_at,
         ps.completed_at,
         ps.confidence_rating,
         ps.user_notes,
         q.id as question_id,
         q.question,
         q.category,
         q.difficulty,
         p.id as persona_id,
         p.name as persona_name,
         CASE 
           WHEN ps.completed_at IS NULL THEN 'in_progress'
           ELSE 'completed'
         END as status
       FROM practice_sessions ps
       LEFT JOIN questions q ON ps.question_id = q.id
       LEFT JOIN personas p ON ps.persona_id = p.id
       WHERE ps.user_id = $1 
       ORDER BY ps.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      sessions: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: "Error fetching sessions" });
  }
});


router.get("/session/:id",verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         ps.*,
         q.question,
         q.category,
         q.difficulty,
         q.context as question_context,
         p.name as persona_name,
         p.specialty,
         u.first_name as user_first_name,
          u.last_name as user_last_name

       FROM practice_sessions ps
       JOIN questions q ON ps.question_id = q.id
       JOIN personas p ON ps.persona_id = p.id
        JOIN users u ON ps.user_id = u.id
       WHERE ps.id = $1 AND ps.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ session: result.rows[0] });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ error: "Error fetching session" });
  }
});


router.patch("/:id/complete",verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    confidenceRating,
    responseQualityRating,
    userNotes,
    recordingText,
    recordingDurationSeconds,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE practice_sessions 
       SET confidence_rating = $1,
           response_quality_rating = $2,
           user_notes = $3,
           recording_text = $4,
           recording_duration_seconds = $5,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        confidenceRating,
        responseQualityRating,
        userNotes,
        recordingText,
        recordingDurationSeconds,
        id,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      message: "Session completed successfully",
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Complete session error:", error);
    res.status(500).json({ error: "Error completing session" });
  }
});


router.get("/statsall",verifyToken, async (req, res) => {
 
  try {
    const userId = req.user.userId;
    
    // Total sessions
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM practice_sessions WHERE user_id = $1",
      [userId]
    );
   

    // Completed sessions
    const completedResult = await pool.query(
      `SELECT COUNT(*) as completed 
       FROM practice_sessions 
       WHERE user_id = $1 AND completed_at IS NOT NULL`,
      [userId]
    );

    // Average confidence
    const avgResult = await pool.query(
      `SELECT AVG(confidence_rating)::numeric(10,2) as avg_confidence 
       FROM practice_sessions 
       WHERE user_id = $1 AND completed_at IS NOT NULL AND confidence_rating IS NOT NULL`,
      [userId]
    );

    // Category breakdown
    const categoryResult = await pool.query(
      `SELECT 
         q.category,
         COUNT(*) as count,
         AVG(ps.confidence_rating)::numeric(10,2) as avg_confidence
       FROM practice_sessions ps
       JOIN questions q ON ps.question_id = q.id
       WHERE ps.user_id = $1 AND ps.completed_at IS NOT NULL
       GROUP BY q.category
       ORDER BY q.category`,
      [req.userId]
    );

    // Persona breakdown
    const personaResult = await pool.query(
      `SELECT 
         ps.persona_id,
         p.name as persona_name,
         COUNT(*) as count,
         AVG(ps.confidence_rating)::numeric(10,2) as avg_confidence
       FROM practice_sessions ps
       JOIN personas p ON ps.persona_id = p.id
       WHERE ps.user_id = $1 AND ps.completed_at IS NOT NULL
       GROUP BY ps.persona_id, p.name`,
      [req.userId]
    );

    // Calculate streak
    const streakResult = await pool.query(
      `SELECT DISTINCT DATE(completed_at) as date 
       FROM practice_sessions 
       WHERE user_id = $1 AND completed_at IS NOT NULL
       ORDER BY date DESC`,
      [req.userId]
    );

    let currentStreak = 0;
    const dates = streakResult.rows.map((r) => r.date);

    if (dates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      for (const dateStr of dates) {
        const sessionDate = new Date(dateStr);
        sessionDate.setHours(0, 0, 0, 0);

        if (sessionDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (sessionDate < checkDate) {
          break;
        }
      }
    }

    // Total practice time
    const timeResult = await pool.query(
      `SELECT SUM(recording_duration_seconds)::integer as total_seconds
       FROM practice_sessions
       WHERE user_id = $1 AND completed_at IS NOT NULL`,
      [req.userId]
    );

    res.json({
      totalSessions: parseInt(totalResult.rows[0].total),
      completedSessions: parseInt(completedResult.rows[0].completed),
      inProgressSessions:
        parseInt(totalResult.rows[0].total) -
        parseInt(completedResult.rows[0].completed),
      avgConfidence: parseFloat(avgResult.rows[0].avg_confidence || 0),
      currentStreak,
      lastPracticeDate: dates[0] || null,
      totalPracticeTimeSeconds: timeResult.rows[0].total_seconds || 0,
      categoryBreakdown: categoryResult.rows,
      personaBreakdown: personaResult.rows,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Error fetching statistics" });
  }
});

// Delete session
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM practice_sessions WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Delete session error:", error);
    res.status(500).json({ error: "Error deleting session" });
  }
});

export default router;
