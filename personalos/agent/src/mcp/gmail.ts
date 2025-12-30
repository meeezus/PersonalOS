/**
 * Gmail MCP Integration for PersonalOS
 *
 * Reads sent emails to track relationship touchpoints.
 * Filters out automated/marketing emails to focus on real human communication.
 */

import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger';

// ============================================
// TYPES
// ============================================

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  date: Date;
  snippet: string;
}

// ============================================
// FILTERING CONFIGURATION
// ============================================

const IGNORE_DOMAINS = [
  'noreply',
  'no-reply',
  'donotreply',
  'marketing',
  'newsletter',
  'notification',
  'notifications',
  'alerts',
  'mailer',
  'bounce',
  'postmaster',
  'support',
  'help',
  'info@',
  'hello@',
  'team@',
  'updates@',
  'news@',
];

const IGNORE_KEYWORDS = [
  'unsubscribe',
  'promotional',
  'digest',
  'newsletter',
  'automated',
  'notification',
  'receipt',
  'invoice',
  'order confirmation',
  'shipping',
  'delivery',
  'password reset',
  'verify your',
  'confirm your',
  'welcome to',
];

// ============================================
// OAUTH CLIENT
// ============================================

let oauth2Client: OAuth2Client | null = null;
let gmailClient: gmail_v1.Gmail | null = null;

function getOAuth2Client(): OAuth2Client {
  if (oauth2Client) return oauth2Client;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
  }

  if (!refreshToken) {
    throw new Error('Missing GOOGLE_REFRESH_TOKEN in .env. Run: npm run oauth');
  }

  oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
}

function getGmailClient(): gmail_v1.Gmail {
  if (gmailClient) return gmailClient;

  const auth = getOAuth2Client();
  gmailClient = google.gmail({ version: 'v1', auth });

  return gmailClient;
}

// ============================================
// EMAIL PARSING
// ============================================

function parseEmailAddress(header: string): string {
  // Handle formats like "Name <email@domain.com>" or just "email@domain.com"
  const match = header.match(/<([^>]+)>/) || header.match(/([^\s<>]+@[^\s<>]+)/);
  return match ? match[1]!.toLowerCase() : header.toLowerCase();
}

function parseEmailAddresses(header: string): string[] {
  // Split by comma and parse each
  return header
    .split(',')
    .map(addr => parseEmailAddress(addr.trim()))
    .filter(addr => addr.includes('@'));
}

function shouldIgnoreEmail(to: string[], subject: string): boolean {
  // Check if any recipient is in ignore domains
  for (const recipient of to) {
    const lowerRecipient = recipient.toLowerCase();
    for (const ignoreDomain of IGNORE_DOMAINS) {
      if (lowerRecipient.includes(ignoreDomain)) {
        return true;
      }
    }
  }

  // Check if subject contains ignore keywords
  const lowerSubject = subject.toLowerCase();
  for (const keyword of IGNORE_KEYWORDS) {
    if (lowerSubject.includes(keyword)) {
      return true;
    }
  }

  return false;
}

function getHeader(headers: gmail_v1.Schema$MessagePartHeader[], name: string): string {
  const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get sent messages since a specific date
 */
export async function getSentMessages(sinceDate: Date, maxResults: number = 50): Promise<GmailMessage[]> {
  const gmail = getGmailClient();

  // Format date for Gmail query (YYYY/MM/DD)
  const dateStr = sinceDate.toISOString().split('T')[0]!.replace(/-/g, '/');
  const query = `in:sent after:${dateStr}`;

  logger.info(`Fetching sent emails since ${dateStr}...`);

  try {
    // Get message list
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    const messageIds = listResponse.data.messages || [];
    logger.info(`Found ${messageIds.length} sent messages`);

    if (messageIds.length === 0) {
      return [];
    }

    // Fetch full message details
    const messages: GmailMessage[] = [];

    for (const msg of messageIds) {
      if (!msg.id) continue;

      try {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });

        const headers = fullMessage.data.payload?.headers || [];
        const from = getHeader(headers, 'From');
        const to = getHeader(headers, 'To');
        const subject = getHeader(headers, 'Subject');
        const dateStr = getHeader(headers, 'Date');

        const toAddresses = parseEmailAddresses(to);

        // Apply filtering
        if (shouldIgnoreEmail(toAddresses, subject)) {
          continue;
        }

        messages.push({
          id: msg.id,
          threadId: msg.threadId || '',
          from: parseEmailAddress(from),
          to: toAddresses,
          subject,
          date: new Date(dateStr),
          snippet: fullMessage.data.snippet || '',
        });
      } catch (err) {
        logger.warn(`Failed to fetch message ${msg.id}`);
      }
    }

    logger.info(`Filtered to ${messages.length} real sent messages`);
    return messages;
  } catch (err) {
    logger.error('Failed to fetch sent messages', err);
    throw err;
  }
}

/**
 * Search messages with a custom query
 */
export async function searchMessages(query: string, maxResults: number = 20): Promise<GmailMessage[]> {
  const gmail = getGmailClient();

  logger.info(`Searching emails: "${query}"`);

  try {
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    const messageIds = listResponse.data.messages || [];
    logger.info(`Found ${messageIds.length} messages matching query`);

    if (messageIds.length === 0) {
      return [];
    }

    const messages: GmailMessage[] = [];

    for (const msg of messageIds) {
      if (!msg.id) continue;

      try {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });

        const headers = fullMessage.data.payload?.headers || [];
        const from = getHeader(headers, 'From');
        const to = getHeader(headers, 'To');
        const subject = getHeader(headers, 'Subject');
        const dateStr = getHeader(headers, 'Date');

        messages.push({
          id: msg.id,
          threadId: msg.threadId || '',
          from: parseEmailAddress(from),
          to: parseEmailAddresses(to),
          subject,
          date: new Date(dateStr),
          snippet: fullMessage.data.snippet || '',
        });
      } catch (err) {
        logger.warn(`Failed to fetch message ${msg.id}`);
      }
    }

    return messages;
  } catch (err) {
    logger.error('Failed to search messages', err);
    throw err;
  }
}

/**
 * Get unique recipients from sent emails
 * Useful for building relationship tracking
 */
export async function getRecentRecipients(sinceDate: Date): Promise<Map<string, { count: number; lastContact: Date; subjects: string[] }>> {
  const messages = await getSentMessages(sinceDate, 100);
  const recipients = new Map<string, { count: number; lastContact: Date; subjects: string[] }>();

  for (const msg of messages) {
    for (const to of msg.to) {
      const existing = recipients.get(to);
      if (existing) {
        existing.count++;
        if (msg.date > existing.lastContact) {
          existing.lastContact = msg.date;
        }
        if (existing.subjects.length < 5) {
          existing.subjects.push(msg.subject);
        }
      } else {
        recipients.set(to, {
          count: 1,
          lastContact: msg.date,
          subjects: [msg.subject],
        });
      }
    }
  }

  return recipients;
}

// ============================================
// TEST
// ============================================

if (require.main === module) {
  // Load environment
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env'), override: true });

  console.log('\n============================================');
  console.log('   GMAIL MCP TEST');
  console.log('============================================\n');

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  getSentMessages(weekAgo, 10)
    .then(messages => {
      console.log(`\nFound ${messages.length} sent messages in the last week:\n`);
      for (const msg of messages) {
        console.log(`📧 To: ${msg.to.join(', ')}`);
        console.log(`   Subject: ${msg.subject}`);
        console.log(`   Date: ${msg.date.toLocaleDateString()}`);
        console.log(`   Snippet: ${msg.snippet.substring(0, 80)}...`);
        console.log('');
      }
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}
