import express from 'express';
import { readFile } from '../services/claude-code.js';

const router = express.Router();

/**
 * GET /api/files/:path
 */
router.get('/:path(*)', async (req, res) => {
  try {
    const filePath = req.params.path;

    // Security: Don't allow parent directory traversal
    if (filePath.includes('..')) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    const content = await readFile(filePath);

    res.json({
      path: filePath,
      content
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
