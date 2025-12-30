/**
 * Email Scanner Job
 *
 * Scans sent emails and updates contact last_contact dates in the database.
 * Runs every 4 hours via Bree scheduler.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ override: true, path: path.join(__dirname, '../../.env') });

import { logger } from '../utils/logger';
import { getSentMessages, GmailMessage } from '../mcp/gmail';
import axios from 'axios';
import dayjs from 'dayjs';

// ============================================
// TYPES
// ============================================

interface ScannerState {
  lastScanTime: string;
  totalScans: number;
  totalContactsUpdated: number;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  last_contact: string | null;
}

interface ScanResult {
  scannedMessages: number;
  filteredMessages: number;
  uniqueRecipients: number;
  contactsUpdated: number;
  contactsNotFound: number;
  errors: string[];
  period: { start: Date; end: Date };
}

// ============================================
// CONFIGURATION
// ============================================

const STATE_FILE = path.join(__dirname, '../../data/email-scanner-state.json');
const DEFAULT_LOOKBACK_DAYS = 7;

// Your own email to filter out
const SELF_EMAILS = [
  'michael@decoponatx.com',
  'meeezus@gmail.com',
  // Add other personal emails here
];

// ============================================
// STATE MANAGEMENT
// ============================================

function loadState(): ScannerState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    logger.warn('Could not load scanner state, using defaults');
  }

  // Default state: look back 7 days
  const defaultDate = dayjs().subtract(DEFAULT_LOOKBACK_DAYS, 'day').toISOString();
  return {
    lastScanTime: defaultDate,
    totalScans: 0,
    totalContactsUpdated: 0,
  };
}

function saveState(state: ScannerState): void {
  try {
    // Ensure directory exists
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error('Failed to save scanner state', err);
  }
}

// ============================================
// LARAVEL API
// ============================================

async function findContactByEmail(email: string): Promise<Contact | null> {
  try {
    const response = await axios.get(
      `${process.env.LARAVEL_API_URL}/contacts`,
      {
        headers: { Authorization: `Bearer ${process.env.LARAVEL_API_TOKEN}` },
        params: { email },
        timeout: 5000,
      }
    );

    const contacts = response.data.data || response.data || [];

    // Find exact match
    const match = contacts.find((c: Contact) =>
      c.email?.toLowerCase() === email.toLowerCase()
    );

    return match || null;
  } catch (err) {
    logger.warn(`Failed to search for contact: ${email}`);
    return null;
  }
}

async function updateContactLastContact(contactId: number, date: Date): Promise<boolean> {
  try {
    await axios.patch(
      `${process.env.LARAVEL_API_URL}/contacts/${contactId}`,
      { last_contact: date.toISOString().split('T')[0] },
      {
        headers: {
          Authorization: `Bearer ${process.env.LARAVEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
    return true;
  } catch (err) {
    logger.warn(`Failed to update contact ${contactId}`);
    return false;
  }
}

// ============================================
// EMAIL PROCESSING
// ============================================

function extractUniqueRecipients(messages: GmailMessage[]): Map<string, Date> {
  const recipients = new Map<string, Date>();

  for (const msg of messages) {
    for (const to of msg.to) {
      const email = to.toLowerCase();

      // Skip self emails
      if (SELF_EMAILS.some(self => email.includes(self.toLowerCase()))) {
        continue;
      }

      // Keep the most recent contact date
      const existing = recipients.get(email);
      if (!existing || msg.date > existing) {
        recipients.set(email, msg.date);
      }
    }
  }

  return recipients;
}

// ============================================
// DISCORD NOTIFICATION
// ============================================

async function postToDiscord(result: ScanResult): Promise<void> {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    logger.warn('No Discord webhook URL configured');
    return;
  }

  const startDate = dayjs(result.period.start).format('MMM D');
  const endDate = dayjs(result.period.end).format('MMM D');

  const message = `## Email Scanner Complete

**Updated:** ${result.contactsUpdated} contacts
**Not in DB:** ${result.contactsNotFound} recipients
**Scanned:** ${result.scannedMessages} messages (${result.filteredMessages} after filtering)
**Period:** ${startDate} - ${endDate}

${result.errors.length > 0 ? `\n**Errors:** ${result.errors.length}` : ''}`;

  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, { content: message });
    logger.info('Posted scan results to Discord');
  } catch (err) {
    logger.error('Failed to post to Discord', err);
  }
}

// ============================================
// MAIN SCANNER
// ============================================

export async function emailScanner(): Promise<ScanResult> {
  console.log('\n');
  console.log('============================================');
  console.log('   EMAIL SCANNER');
  console.log('============================================\n');

  logger.info('Starting email scan...');

  // Load state
  const state = loadState();
  const sinceDate = new Date(state.lastScanTime);
  const now = new Date();

  logger.info(`Scanning emails since: ${dayjs(sinceDate).format('MMM D, YYYY HH:mm')}`);

  const result: ScanResult = {
    scannedMessages: 0,
    filteredMessages: 0,
    uniqueRecipients: 0,
    contactsUpdated: 0,
    contactsNotFound: 0,
    errors: [],
    period: { start: sinceDate, end: now },
  };

  try {
    // Fetch sent messages
    const messages = await getSentMessages(sinceDate, 100);
    result.scannedMessages = messages.length;
    result.filteredMessages = messages.length; // Already filtered by getSentMessages

    if (messages.length === 0) {
      logger.info('No new sent messages found');
    } else {
      logger.info(`Found ${messages.length} sent messages`);

      // Extract unique recipients
      const recipients = extractUniqueRecipients(messages);
      result.uniqueRecipients = recipients.size;

      logger.info(`Unique recipients: ${recipients.size}`);

      // Process each recipient
      for (const [email, lastContactDate] of recipients) {
        logger.info(`Processing: ${email}`);

        // Find contact in database
        const contact = await findContactByEmail(email);

        if (contact) {
          // Check if we need to update (only if newer)
          const existingDate = contact.last_contact ? new Date(contact.last_contact) : null;

          if (!existingDate || lastContactDate > existingDate) {
            const updated = await updateContactLastContact(contact.id, lastContactDate);
            if (updated) {
              logger.info(`   Updated ${contact.name} (${email})`);
              result.contactsUpdated++;
            } else {
              result.errors.push(`Failed to update ${email}`);
            }
          } else {
            logger.info(`   Skipped ${contact.name} (already up to date)`);
          }
        } else {
          logger.info(`   Not in database: ${email}`);
          result.contactsNotFound++;
        }
      }
    }

    // Update state
    state.lastScanTime = now.toISOString();
    state.totalScans++;
    state.totalContactsUpdated += result.contactsUpdated;
    saveState(state);

    // Post to Discord
    await postToDiscord(result);

    logger.info('Email scan complete');

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Email scanner failed', err);
    result.errors.push(errorMsg);
  }

  // Print summary
  console.log('\n============================================');
  console.log('   SCAN RESULTS');
  console.log('============================================');
  console.log(`   Messages scanned: ${result.scannedMessages}`);
  console.log(`   Unique recipients: ${result.uniqueRecipients}`);
  console.log(`   Contacts updated: ${result.contactsUpdated}`);
  console.log(`   Not in database: ${result.contactsNotFound}`);
  console.log(`   Errors: ${result.errors.length}`);
  console.log('============================================\n');

  return result;
}

// ============================================
// RUN IF EXECUTED DIRECTLY
// ============================================

if (require.main === module) {
  emailScanner()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Email scanner failed:', err);
      process.exit(1);
    });
}
