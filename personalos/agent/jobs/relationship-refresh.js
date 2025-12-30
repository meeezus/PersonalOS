const { parentPort } = require('worker_threads');

(async () => {
  // Load environment variables
  require('dotenv').config({ path: require('path').join(__dirname, '../.env'), override: true });

  // Register ts-node for TypeScript execution
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
    },
  });

  const { relationshipRefresh } = require('../src/jobs/relationship-refresh');

  try {
    await relationshipRefresh();
    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
  } catch (err) {
    console.error('Relationship refresh failed:', err);
    if (parentPort) parentPort.postMessage('error');
    else process.exit(1);
  }
})();
