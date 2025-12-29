import express from 'express';
import { executeCommand, loadTodaysBriefing } from '../services/claude-code.js';

const router = express.Router();

/**
 * GET /api/briefing/today
 */
router.get('/today', async (req, res) => {
  try {
    const briefing = await loadTodaysBriefing();

    if (briefing) {
      res.json(briefing);
    } else {
      res.status(404).json({
        error: 'No briefing found for today',
        message: 'Generate one with POST /api/briefing/generate'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/briefing/generate
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('Generating morning brief...');

    const prompt = `Generate today's morning briefing in JSON format. Read files: Memory/identity.md, Memory/goals.md, Tasks/Active/Unified_Week1_Plan.md. Save to briefings/${new Date().toISOString().split('T')[0]}.json`;

    const output = await executeCommand(prompt);

    console.log('Brief generated successfully');

    const briefing = await loadTodaysBriefing();

    res.json({
      success: true,
      briefing,
      message: 'Morning brief generated successfully'
    });
  } catch (error) {
    console.error('Brief generation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
