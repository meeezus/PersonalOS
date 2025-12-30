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

  const { emailScanner } = require('../src/jobs/email-scanner');

  try {
    await emailScanner();
    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
  } catch (err) {
    console.error('Email scanner failed:', err);
    if (parentPort) parentPort.postMessage('error');
    else process.exit(1);
  }
})();
