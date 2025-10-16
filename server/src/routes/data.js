import express from 'express';
import pool from "../db.js";

const router = express.Router();

// Get all questions
router.get('/questions', async (req, res) => {
  try {
    const { category, difficulty, persona_id } = req.query;
    
    let query = 'SELECT * FROM questions WHERE is_active = true';
    const params = [];
    let paramCount = 1;
    
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (difficulty) {
      query += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }
    
    if (persona_id) {
      query += ` AND id IN (
        SELECT question_id FROM question_personas WHERE persona_id = $${paramCount}
      )`;
      params.push(persona_id);
      paramCount++;
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    res.json({ 
      questions: result.rows,
      total: result.rows.length 
    });
    
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Error fetching questions' });
  }
});

// Get single question
router.get('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const questionResult = await pool.query(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );
    
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const personasResult = await pool.query(
      `SELECT p.* FROM personas p
       JOIN question_personas qp ON p.id = qp.persona_id
       WHERE qp.question_id = $1`,
      [id]
    );
    
    const question = questionResult.rows[0];
    question.personas = personasResult.rows;
    
    res.json({ question });
    
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Error fetching question' });
  }
});

// Get all personas
router.get('/personas', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM personas ORDER BY id'
    );
    
    res.json({ 
      personas: result.rows,
      total: result.rows.length 
    });
    
  } catch (error) {
    console.error('Get personas error:', error);
    res.status(500).json({ error: 'Error fetching personas' });
  }
});

// Get single persona
router.get('/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const personaResult = await pool.query(
      'SELECT * FROM personas WHERE id = $1',
      [id]
    );
    
    if (personaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    
    const questionsResult = await pool.query(
      `SELECT q.* FROM questions q
       JOIN question_personas qp ON q.id = qp.question_id
       WHERE qp.persona_id = $1 AND q.is_active = true
       ORDER BY q.category, q.id`,
      [id]
    );
    
    const persona = personaResult.rows[0];
    persona.questions = questionsResult.rows;
    
    res.json({ persona });
    
  } catch (error) {
    console.error('Get persona error:', error);
    res.status(500).json({ error: 'Error fetching persona' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         category,
         COUNT(*) as question_count
       FROM questions
       WHERE is_active = true
       GROUP BY category
       ORDER BY category`
    );
    
    res.json({ 
      categories: result.rows,
      total: result.rows.length 
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

export default router;