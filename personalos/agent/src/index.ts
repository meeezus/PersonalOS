import dotenv from 'dotenv';
dotenv.config({ override: true });

import scheduler from './scheduler';
import { morningOverview } from './jobs/morning-overview';
import { logger } from './utils/logger';

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗ ███████╗██████╗ ███████╗ ██████╗ ███╗   ██╗    ║
║   ██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗████╗  ██║    ║
║   ██████╔╝█████╗  ██████╔╝███████╗██║   ██║██╔██╗ ██║    ║
║   ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║██║   ██║██║╚██╗██║    ║
║   ██║     ███████╗██║  ██║███████║╚██████╔╝██║ ╚████║    ║
║   ╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝    ║
║                                                           ║
║              🤖 AGENT SYSTEM v1.0                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

logger.info('PersonalOS Agent Starting...');

// Check required environment variables
const requiredEnvVars = ['ANTHROPIC_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Test mode: run morning overview immediately
if (process.argv.includes('--test')) {
  logger.info('🧪 Test mode: Running morning overview now...');
  morningOverview()
    .then(() => {
      logger.info('✅ Test complete');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('❌ Test failed:', err);
      process.exit(1);
    });
} else {
  // Start scheduler
  scheduler.start();
  logger.info('✅ Scheduler started');
  logger.info('📅 Scheduled jobs:', scheduler.config.jobs.map(j => j.name));

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await scheduler.stop();
    process.exit(0);
  });
}
