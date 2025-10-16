import express from 'express';
import pool from "../db.js";
import authenticate from '../routes/auth.js';

const router = express.Router();
router.use(authenticate);

// Get today's goal
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(
      `SELECT * FROM daily_goals 
       WHERE user_id = $1 AND goal_date = $2`,
      [req.userId, today]
    );
    
    if (result.rows.length === 0) {
      // Create today's goal if it doesn't exist
      const newGoal = await pool.query(
        `INSERT INTO daily_goals (user_id, goal_date, target_sessions)
         VALUES ($1, $2, 3)
         RETURNING *`,
        [req.userId, today]
      );
      return res.json({ goal: newGoal.rows[0] });
    }
    
    res.json({ goal: result.rows[0] });
    
  } catch (error) {
    console.error('Get today goal error:', error);
    res.status(500).json({ error: 'Error fetching goal' });
  }
});

// Set/update today's goal
router.post('/today', async (req, res) => {
  const { targetSessions } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const result = await pool.query(
      `INSERT INTO daily_goals (user_id, goal_date, target_sessions)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, goal_date)
       DO UPDATE SET target_sessions = $3
       RETURNING *`,
      [req.userId, today, targetSessions || 3]
    );
    
    res.json({ goal: result.rows[0] });
    
  } catch (error) {
    console.error('Set goal error:', error);
    res.status(500).json({ error: 'Error setting goal' });
  }
});

// Get goal history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM daily_goals 
       WHERE user_id = $1 
       ORDER BY goal_date DESC 
       LIMIT 30`,
      [req.userId]
    );
    
    res.json({ 
      goals: result.rows,
      total: result.rows.length 
    });
    
  } catch (error) {
    console.error('Get goal history error:', error);
    res.status(500).json({ error: 'Error fetching goal history' });
  }
});

export default router;