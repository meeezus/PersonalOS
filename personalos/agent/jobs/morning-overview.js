const { parentPort } = require('worker_threads');

(async () => {
  // Load environment variables
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

  // Register ts-node for TypeScript execution
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
    },
  });

  const { morningOverview } = require('../src/jobs/morning-overview');

  try {
    await morningOverview();
    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
  } catch (err) {
    console.error('Morning overview failed:', err);
    if (parentPort) parentPort.postMessage('error');
    else process.exit(1);
  }
})();
