import express, { Request, Response } from 'express';
import cors from 'cors';
import { chat } from './index';

// ============================================
// SERVER SETUP
// ============================================

const app = express();
const PORT = process.env.JOTARO_PORT || 3002;

app.use(cors());
app.use(express.json());

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'iori',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// CHAT ENDPOINT
// ============================================

app.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[iori] Received message: "${message.substring(0, 50)}..."`);

    const result = await chat({
      message,
      history: history || [],
      context: context || {
        goals: [],
        tasks: [],
        contacts: [],
        user_name: 'Michael',
      },
    });

    console.log(`[iori] Response generated (${result.response.length} chars, ${result.actions.length} actions)`);

    return res.json(result);
  } catch (error) {
    console.error('[iori] Error processing chat:', error);
    return res.status(500).json({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// START SERVER
// ============================================

export function startIoriServer(): void {
  app.listen(PORT, () => {
    console.log(`\n🏯 Iori server running on http://localhost:${PORT}`);
    console.log(`   POST /chat - Send a message`);
    console.log(`   GET /health - Health check\n`);
  });
}

// Keep old name for backwards compatibility
export const startJotaroServer = startIoriServer;

// Run if executed directly
if (require.main === module) {
  startIoriServer();
}

export default app;
