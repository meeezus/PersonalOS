/**
 * Google OAuth Token Generator for PersonalOS
 *
 * This script generates a refresh token for Gmail and Calendar access.
 * Run with: npm run oauth
 *
 * Prerequisites:
 * - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in agent/.env
 * - Google Cloud Console project with Gmail and Calendar APIs enabled
 * - OAuth consent screen configured (can be in "Testing" mode)
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { URL } from 'url';
import { google } from 'googleapis';
import open from 'open';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// ============================================
// CONFIGURATION
// ============================================

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar.readonly',
];

const REDIRECT_PORT = 3000;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth2callback`;

// ============================================
// VALIDATION
// ============================================

function validateEnvironment(): void {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('\n❌ ERROR: Missing Google OAuth credentials in .env');
    console.error('\nMake sure your agent/.env file contains:');
    console.error('  GOOGLE_CLIENT_ID=your-client-id');
    console.error('  GOOGLE_CLIENT_SECRET=your-client-secret');
    console.error('\nGet these from: https://console.cloud.google.com/apis/credentials');
    process.exit(1);
  }

  console.log('✅ Found Google OAuth credentials in .env');
}

// ============================================
// OAUTH FLOW
// ============================================

async function generateToken(): Promise<void> {
  validateEnvironment();

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });

  console.log('\n============================================');
  console.log('   GOOGLE OAUTH TOKEN GENERATOR');
  console.log('============================================\n');
  console.log('📋 Scopes requested:');
  SCOPES.forEach(scope => console.log(`   - ${scope.split('/').pop()}`));
  console.log('\n🌐 Starting local server on port', REDIRECT_PORT);
  console.log('🔗 Opening browser for authorization...\n');

  // Start local server to receive callback
  const server = http.createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url || '', `http://localhost:${REDIRECT_PORT}`);

      if (reqUrl.pathname === '/oauth2callback') {
        const code = reqUrl.searchParams.get('code');
        const error = reqUrl.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>❌ Authorization Failed</h1>
                <p>Error: ${error}</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          console.error('❌ Authorization failed:', error);
          server.close();
          process.exit(1);
        }

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>❌ No Authorization Code</h1>
                <p>No code received from Google.</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          process.exit(1);
        }

        // Exchange code for tokens
        console.log('📥 Received authorization code, exchanging for tokens...');

        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>⚠️ No Refresh Token</h1>
                <p>Google didn't return a refresh token.</p>
                <p>This usually means you've already authorized this app.</p>
                <p>Go to <a href="https://myaccount.google.com/permissions">Google Account Permissions</a>
                   and revoke access to this app, then try again.</p>
              </body>
            </html>
          `);
          console.error('\n⚠️ No refresh token received.');
          console.error('This usually means you\'ve already authorized this app.');
          console.error('Go to https://myaccount.google.com/permissions');
          console.error('Revoke access to this app, then run this script again.\n');
          server.close();
          process.exit(1);
        }

        // Success! Display the token
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center; background: #1a1a2e; color: #eee;">
              <h1 style="color: #4ade80;">✅ Authorization Successful!</h1>
              <p>Your refresh token has been generated.</p>
              <p>Check your terminal for the token.</p>
              <p style="color: #888;">You can close this window.</p>
            </body>
          </html>
        `);

        console.log('\n============================================');
        console.log('   ✅ SUCCESS! TOKEN GENERATED');
        console.log('============================================\n');
        console.log('📝 REFRESH TOKEN:');
        console.log('─'.repeat(50));
        console.log(tokens.refresh_token);
        console.log('─'.repeat(50));
        console.log('\n📝 ACCESS TOKEN (expires):');
        console.log('─'.repeat(50));
        console.log(tokens.access_token?.substring(0, 50) + '...');
        console.log('─'.repeat(50));

        // Update .env file
        const envPath = path.join(__dirname, '../.env');
        let envContent = fs.readFileSync(envPath, 'utf-8');

        if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
          // Replace existing token
          envContent = envContent.replace(
            /GOOGLE_REFRESH_TOKEN=.*/,
            `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`
          );
        } else {
          // Add new token
          envContent += `\n# Google OAuth Refresh Token (generated ${new Date().toISOString()})\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ Saved refresh token to agent/.env');
        console.log('\nYou can now use Gmail and Calendar APIs!');
        console.log('============================================\n');

        server.close();
        process.exit(0);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    } catch (err) {
      console.error('Error handling callback:', err);
      res.writeHead(500);
      res.end('Internal server error');
      server.close();
      process.exit(1);
    }
  });

  server.listen(REDIRECT_PORT, () => {
    // Open browser
    open(authUrl);
  });

  // Timeout after 5 minutes
  setTimeout(() => {
    console.error('\n❌ Timeout: No authorization received within 5 minutes.');
    server.close();
    process.exit(1);
  }, 5 * 60 * 1000);
}

// ============================================
// RUN
// ============================================

generateToken().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
