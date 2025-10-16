import express from 'express';
import authenticate from '../routes/auth.js';
import {
  generateCoachResponse,
  getConversationSummary,
  generateConversationFeedback,
} from '../services/aiCoach.js';

const router = express.Router();
router.use(authenticate);

// Start conversation
router.post('/start', async (req, res) => {
  const { sessionId, message } = req.body;

  try {
    if (!sessionId || !message) {
      return res.status(400).json({ 
        error: 'Session ID and message are required' 
      });
    }

    const response = await generateCoachResponse(
      sessionId,
      req.userId,
      message
    );

    res.json({
      success: true,
      aiResponse: response.message,
      turnNumber: response.turnNumber,
    });

  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ 
      error: 'Error starting conversation',
      details: error.message 
    });
  }
});

// Continue conversation
router.post('/continue', async (req, res) => {
  const { sessionId, message } = req.body;

  try {
    if (!sessionId || !message) {
      return res.status(400).json({ 
        error: 'Session ID and message are required' 
      });
    }

    const response = await generateCoachResponse(
      sessionId,
      req.userId,
      message
    );

    res.json({
      success: true,
      aiResponse: response.message,
      turnNumber: response.turnNumber,
    });

  } catch (error) {
    console.error('Continue conversation error:', error);
    res.status(500).json({ 
      error: 'Error continuing conversation',
      details: error.message 
    });
  }
});

// Get conversation history
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const summary = await getConversationSummary(sessionId, req.userId);
    res.json({ 
      success: true, 
      conversation: summary 
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Error fetching conversation' });
  }
});

// Get AI feedback
router.post('/:sessionId/feedback', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await generateConversationFeedback(sessionId, req.userId);
    res.json({ 
      success: true, 
      feedback: result.feedback 
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Error generating feedback' });
  }
});

export default router;