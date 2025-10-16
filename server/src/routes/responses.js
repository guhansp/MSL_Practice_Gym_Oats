import express from 'express';
import pool from '../db.js';
import authenticate from '../routes/auth.js';

const router = express.Router();

// Get sample responses for a question (public route)
router.get('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const result = await pool.query(
      `SELECT 
         sr.id,
         sr.response_text,
         sr.response_type,
         sr.key_messages,
         sr.created_at,
         u.first_name,
         u.last_name
       FROM sample_responses sr
       LEFT JOIN users u ON sr.created_by = u.id
       WHERE sr.question_id = $1 AND sr.is_active = true
       ORDER BY sr.created_at DESC`,
      [questionId]
    );
    
    res.json({ 
      responses: result.rows,
      total: result.rows.length 
    });
    
  } catch (error) {
    console.error('Get sample responses error:', error);
    res.status(500).json({ error: 'Error fetching sample responses' });
  }
});

// Create sample response (requires authentication)
router.post('/', authenticate, async (req, res) => {
  const { questionId, responseText, responseType, keyMessages } = req.body;
  
  try {
    if (!questionId || !responseText) {
      return res.status(400).json({ 
        error: 'Question ID and response text are required' 
      });
    }

    // Verify question exists
    const questionCheck = await pool.query(
      'SELECT id FROM questions WHERE id = $1',
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Insert sample response
    const result = await pool.query(
      `INSERT INTO sample_responses 
       (question_id, response_text, response_type, key_messages, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        questionId, 
        responseText, 
        responseType || 'model_answer',
        keyMessages ? JSON.stringify(keyMessages) : null, 
        req.userId
      ]
    );
    
    res.status(201).json({ 
      message: 'Sample response created successfully',
      response: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Create sample response error:', error);
    res.status(500).json({ error: 'Error creating sample response' });
  }
});

// Update sample response
router.patch('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { responseText, responseType, keyMessages, isActive } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE sample_responses 
       SET response_text = COALESCE($1, response_text),
           response_type = COALESCE($2, response_type),
           key_messages = COALESCE($3, key_messages),
           is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING *`,
      [responseText, responseType, keyMessages ? JSON.stringify(keyMessages) : null, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sample response not found' });
    }

    res.json({ 
      message: 'Sample response updated successfully',
      response: result.rows[0] 
    });

  } catch (error) {
    console.error('Update sample response error:', error);
    res.status(500).json({ error: 'Error updating sample response' });
  }
});

// Delete sample response
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM sample_responses WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sample response not found' });
    }

    res.json({ message: 'Sample response deleted successfully' });

  } catch (error) {
    console.error('Delete sample response error:', error);
    res.status(500).json({ error: 'Error deleting sample response' });
  }
});

export default router;