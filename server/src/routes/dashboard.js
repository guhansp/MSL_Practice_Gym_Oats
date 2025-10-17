import { verifyToken } from "../middleware/authValidate.js";
import pool from "../db/config.js";
import express from "express";
const router = express.Router();

router.get("/userData", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Fetching dashboard for user ID:", userId);

    const result = await pool.query(
      `SELECT up.*, u.first_name, u.last_name 
       FROM user_progress as up 
       LEFT JOIN users as u ON u.id = up.user_id 
       WHERE up.user_id = $1`,
      [userId]
    );

    // If no progress data, create default entry for new user
    if (result.rows.length === 0) {
      const userResult = await pool.query(
        `SELECT first_name, last_name FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return default empty progress data
      const defaultProgress = {
        user_id: userId,
        first_name: userResult.rows[0].first_name,
        last_name: userResult.rows[0].last_name,
        total_sessions: 0,
        total_practice_time_seconds: 0,
        current_streak_days: 0,
        persona_stats: {},
        category_stats: {},
        confidence_trend: []
      };

      return res.json({
        message: "Dashboard data loaded successfully",
        progress: defaultProgress,
      });
    }

    res.json({
      message: "Dashboard data loaded successfully",
      progress: result.rows[0],
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
