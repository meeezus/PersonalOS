/**
 * Relationship Refresh Job
 *
 * Weekly job that identifies contacts who haven't been contacted recently.
 * Sends Discord reminder with suggestions for who to reach out to.
 *
 * Runs: Monday 9am (cron: '0 9 * * 1')
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ override: true, path: path.join(__dirname, '../../.env') });

import { logger } from '../utils/logger';
import axios from 'axios';
import dayjs from 'dayjs';

// ============================================
// TYPES
// ============================================

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  relationship: string;
  company: string | null;
  notes: string | null;
  last_contact: string | null;
  created_at: string;
}

interface StaleContact {
  contact: Contact;
  daysSinceContact: number;
  priority: 'high' | 'medium' | 'low';
}

interface RefreshResult {
  totalContacts: number;
  staleContacts: StaleContact[];
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

// ============================================
// CONFIGURATION
// ============================================

// Days thresholds for staleness
const THRESHOLDS = {
  high: 60,    // 60+ days = high priority
  medium: 30,  // 30-60 days = medium priority
  low: 14,     // 14-30 days = low priority (just a nudge)
};

// Relationship types that matter most
const PRIORITY_RELATIONSHIPS = [
  'client',
  'prospect',
  'partner',
  'mentor',
  'friend',
  'family',
];

// ============================================
// LARAVEL API
// ============================================

async function fetchAllContacts(): Promise<Contact[]> {
  try {
    const response = await axios.get(
      `${process.env.LARAVEL_API_URL}/contacts`,
      {
        headers: { Authorization: `Bearer ${process.env.LARAVEL_API_TOKEN}` },
        timeout: 10000,
      }
    );

    return response.data.data || response.data || [];
  } catch (err) {
    logger.error('Failed to fetch contacts from API');
    return [];
  }
}

// ============================================
// ANALYSIS
// ============================================

function analyzeContacts(contacts: Contact[]): RefreshResult {
  const now = dayjs();
  const staleContacts: StaleContact[] = [];

  for (const contact of contacts) {
    // Skip contacts without last_contact date (newly added)
    if (!contact.last_contact) continue;

    const lastContact = dayjs(contact.last_contact);
    const daysSince = now.diff(lastContact, 'day');

    // Only include if past the low threshold
    if (daysSince < THRESHOLDS.low) continue;

    let priority: 'high' | 'medium' | 'low';
    if (daysSince >= THRESHOLDS.high) {
      priority = 'high';
    } else if (daysSince >= THRESHOLDS.medium) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Boost priority for important relationships
    if (priority === 'medium' && PRIORITY_RELATIONSHIPS.includes(contact.relationship?.toLowerCase())) {
      priority = 'high';
    }

    staleContacts.push({
      contact,
      daysSinceContact: daysSince,
      priority,
    });
  }

  // Sort by priority (high first) then by days since contact
  staleContacts.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.daysSinceContact - a.daysSinceContact;
  });

  return {
    totalContacts: contacts.length,
    staleContacts,
    highPriority: staleContacts.filter(c => c.priority === 'high').length,
    mediumPriority: staleContacts.filter(c => c.priority === 'medium').length,
    lowPriority: staleContacts.filter(c => c.priority === 'low').length,
  };
}

// ============================================
// DISCORD NOTIFICATION
// ============================================

async function postToDiscord(result: RefreshResult): Promise<void> {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    logger.warn('No Discord webhook URL configured');
    return;
  }

  if (result.staleContacts.length === 0) {
    // No stale contacts - send brief message
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `## Relationship Check\n\nAll contacts are fresh - no one needs a reach-out this week.`,
    });
    return;
  }

  // Build the message
  let message = `## Relationship Refresh\n\n`;
  message += `**${result.staleContacts.length}** contacts could use some attention:\n\n`;

  // High priority
  const highPriority = result.staleContacts.filter(c => c.priority === 'high').slice(0, 5);
  if (highPriority.length > 0) {
    message += `**Overdue (60+ days):**\n`;
    for (const sc of highPriority) {
      const rel = sc.contact.relationship ? ` (${sc.contact.relationship})` : '';
      message += `- ${sc.contact.name}${rel} - ${sc.daysSinceContact} days\n`;
    }
    message += '\n';
  }

  // Medium priority
  const mediumPriority = result.staleContacts.filter(c => c.priority === 'medium').slice(0, 5);
  if (mediumPriority.length > 0) {
    message += `**Getting Stale (30-60 days):**\n`;
    for (const sc of mediumPriority) {
      const rel = sc.contact.relationship ? ` (${sc.contact.relationship})` : '';
      message += `- ${sc.contact.name}${rel} - ${sc.daysSinceContact} days\n`;
    }
    message += '\n';
  }

  // Summary
  message += `---\n`;
  message += `*Pick 2-3 people to reach out to this week.*`;

  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, { content: message });
    logger.info('Posted relationship refresh to Discord');
  } catch (err) {
    logger.error('Failed to post to Discord', err);
  }
}

// ============================================
// MAIN JOB
// ============================================

export async function relationshipRefresh(): Promise<RefreshResult> {
  console.log('\n');
  console.log('============================================');
  console.log('   RELATIONSHIP REFRESH');
  console.log('============================================\n');

  logger.info('Starting relationship refresh...');

  // Fetch all contacts
  const contacts = await fetchAllContacts();
  logger.info(`Loaded ${contacts.length} contacts`);

  if (contacts.length === 0) {
    logger.warn('No contacts found in database');
    return {
      totalContacts: 0,
      staleContacts: [],
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
    };
  }

  // Analyze for staleness
  const result = analyzeContacts(contacts);

  logger.info(`Analysis complete:`);
  logger.info(`  High priority: ${result.highPriority}`);
  logger.info(`  Medium priority: ${result.mediumPriority}`);
  logger.info(`  Low priority: ${result.lowPriority}`);

  // Post to Discord
  await postToDiscord(result);

  logger.info('Relationship refresh complete');

  // Print summary
  console.log('\n============================================');
  console.log('   REFRESH RESULTS');
  console.log('============================================');
  console.log(`   Total contacts: ${result.totalContacts}`);
  console.log(`   Need attention: ${result.staleContacts.length}`);
  console.log(`   High priority: ${result.highPriority}`);
  console.log(`   Medium priority: ${result.mediumPriority}`);
  console.log(`   Low priority: ${result.lowPriority}`);
  console.log('============================================\n');

  return result;
}

// ============================================
// RUN IF EXECUTED DIRECTLY
// ============================================

if (require.main === module) {
  relationshipRefresh()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Relationship refresh failed:', err);
      process.exit(1);
    });
}
