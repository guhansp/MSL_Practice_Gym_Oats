import { verifyToken } from "../middleware/authValidate.js";
import pool from '../db/config.js';
import express from "express";
const router = express.Router();

router.get("/userData", verifyToken, async (req, res) => {  
  try {
    const userId = req.user.userId;
    console.log("Fetching dashboard for user ID:", userId);

    const result = await pool.query(
      "SELECT * FROM user_progress WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(204).json({ message: "No progress data found" });

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
