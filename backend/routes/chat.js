import express from 'express';
import { sendChatMessage, executeCommand } from '../services/claude-code.js';

const router = express.Router();

/**
 * POST /api/chat/message
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Chat message: "${message.substring(0, 50)}..."`);

    const result = await sendChatMessage(message, sessionId);

    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/end-day
 */
router.post('/end-day', async (req, res) => {
  try {
    console.log('Generating episode log...');

    const prompt = `Generate today's episode log. Review today's chat history and briefing. Save to Memory/episode_logs/${new Date().toISOString().split('T')[0]}.md`;

    const output = await executeCommand(prompt);

    res.json({
      success: true,
      message: 'Episode log generated successfully',
      output
    });
  } catch (error) {
    console.error('Episode log generation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
