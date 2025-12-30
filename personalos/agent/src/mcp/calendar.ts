/**
 * Google Calendar MCP Integration for PersonalOS
 *
 * Reads calendar events for morning overview and scheduling awareness.
 */

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger';
import dayjs from 'dayjs';

// ============================================
// TYPES
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
  isAllDay: boolean;
  attendees: string[];
  meetLink: string | null;
}

// ============================================
// OAUTH CLIENT
// ============================================

let oauth2Client: OAuth2Client | null = null;
let calendarClient: calendar_v3.Calendar | null = null;

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

function getCalendarClient(): calendar_v3.Calendar {
  if (calendarClient) return calendarClient;

  const auth = getOAuth2Client();
  calendarClient = google.calendar({ version: 'v3', auth });

  return calendarClient;
}

// ============================================
// EVENT PARSING
// ============================================

function parseEvent(event: calendar_v3.Schema$Event): CalendarEvent | null {
  if (!event.id) return null;

  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;

  if (!start || !end) return null;

  const isAllDay = !event.start?.dateTime;

  return {
    id: event.id,
    title: event.summary || '(No title)',
    description: event.description || '',
    start: new Date(start),
    end: new Date(end),
    location: event.location || '',
    isAllDay,
    attendees: (event.attendees || [])
      .map(a => a.email || '')
      .filter(e => e && !e.includes('calendar.google.com')),
    meetLink: event.hangoutLink || null,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get today's events
 */
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient();

  const startOfDay = dayjs().startOf('day').toISOString();
  const endOfDay = dayjs().endOf('day').toISOString();

  logger.info('Fetching today\'s calendar events...');

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay,
      timeMax: endOfDay,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 20,
    });

    const events = (response.data.items || [])
      .map(parseEvent)
      .filter((e): e is CalendarEvent => e !== null);

    logger.info(`Found ${events.length} events today`);
    return events;
  } catch (err) {
    logger.error('Failed to fetch calendar events', err);
    return [];
  }
}

/**
 * Get upcoming events for the next N days
 */
export async function getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient();

  const now = dayjs().toISOString();
  const futureDate = dayjs().add(days, 'day').endOf('day').toISOString();

  logger.info(`Fetching calendar events for next ${days} days...`);

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now,
      timeMax: futureDate,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = (response.data.items || [])
      .map(parseEvent)
      .filter((e): e is CalendarEvent => e !== null);

    logger.info(`Found ${events.length} upcoming events`);
    return events;
  } catch (err) {
    logger.error('Failed to fetch upcoming events', err);
    return [];
  }
}

/**
 * Get this week's events
 */
export async function getThisWeekEvents(): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient();

  const startOfWeek = dayjs().startOf('week').toISOString();
  const endOfWeek = dayjs().endOf('week').toISOString();

  logger.info('Fetching this week\'s calendar events...');

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfWeek,
      timeMax: endOfWeek,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = (response.data.items || [])
      .map(parseEvent)
      .filter((e): e is CalendarEvent => e !== null);

    logger.info(`Found ${events.length} events this week`);
    return events;
  } catch (err) {
    logger.error('Failed to fetch weekly events', err);
    return [];
  }
}

/**
 * Format event for display
 */
export function formatEvent(event: CalendarEvent): string {
  const time = event.isAllDay
    ? 'All day'
    : dayjs(event.start).format('h:mm A');

  let str = `${time}: ${event.title}`;

  if (event.location) {
    str += ` @ ${event.location}`;
  }

  if (event.meetLink) {
    str += ' (Meet)';
  }

  return str;
}

/**
 * Format events for morning overview
 */
export function formatEventsForOverview(events: CalendarEvent[]): string {
  if (events.length === 0) {
    return 'No events scheduled today.';
  }

  return events.map(formatEvent).join('\n');
}

// ============================================
// TEST
// ============================================

if (require.main === module) {
  // Load environment
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env'), override: true });

  console.log('\n============================================');
  console.log('   CALENDAR MCP TEST');
  console.log('============================================\n');

  getTodayEvents()
    .then(events => {
      console.log(`\nToday's Events (${events.length}):\n`);
      if (events.length === 0) {
        console.log('No events today.');
      } else {
        for (const event of events) {
          console.log(`  ${formatEvent(event)}`);
        }
      }
      console.log('');
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}
