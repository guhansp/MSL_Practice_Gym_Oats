import express from 'express';
import pool from '../db/config.js';
import { verifyToken } from "../middleware/authValidate.js";

const router = express.Router();
router.use(verifyToken);

// Get heatmap data for streak visualization
router.get('/heatmap', async (req, res) => {
  try {
    const { days = 90 } = req.query; // Default to 90 days
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all sessions with category and confidence for the date range
    const result = await pool.query(
      `SELECT 
         DATE(ps.completed_at) as date,
         q.category,
         ps.confidence_rating
       FROM practice_sessions ps
       JOIN questions q ON ps.question_id = q.id
       WHERE ps.user_id = $1 
         AND ps.completed_at IS NOT NULL
         AND ps.completed_at >= $2
         AND ps.completed_at <= $3
       ORDER BY DATE(ps.completed_at) ASC, q.category ASC`,
      [req.userId, startDate, endDate]
    );

    // Group by date - using date as KEY
    const heatmapData = {};
    
    result.rows.forEach((row) => {
      const dateStr = row.date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!heatmapData[dateStr]) {
        heatmapData[dateStr] = [];
      }
      
      heatmapData[dateStr].push({
        category: row.category,
        confidence_score: row.confidence_rating
      });
    });

    // Fill in missing dates with empty arrays
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!heatmapData[dateStr]) {
        heatmapData[dateStr] = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: heatmapData,
      totalDays: parseInt(days),
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ 
      error: 'Error fetching heatmap data' 
    });
  }
});

export default router;