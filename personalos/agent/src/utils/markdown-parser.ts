import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';

// ============================================
// TYPES
// ============================================

export interface PersonalContext {
  claude: string;
  identity: string;
  goals: string;
  observations: string;
  latestEpisode: string;
  todayPlan: DailySection | null;
}

export interface DailySection {
  date: string;
  title: string;
  content: string;
  tasks: string[];
  timeBlocks: TimeBlock[];
}

export interface TimeBlock {
  time: string;
  title: string;
  tasks: string[];
}

// ============================================
// FILE PATHS
// ============================================

const HOME = process.env.HOME || '/Users/michaelenriquez';
const PERSONALOS_ROOT = path.join(HOME, 'PersonalOS');

const PATHS = {
  claude: path.join(PERSONALOS_ROOT, 'CLAUDE.md'),
  identity: path.join(PERSONALOS_ROOT, 'Memory', 'identity.md'),
  goals: path.join(PERSONALOS_ROOT, 'Memory', 'goals.md'),
  observations: path.join(PERSONALOS_ROOT, 'Memory', 'observations.md'),
  episodeLogs: path.join(PERSONALOS_ROOT, 'Memory', 'episode_logs'),
  tasksActive: path.join(PERSONALOS_ROOT, 'Tasks', 'Active'),
};

// ============================================
// FILE READERS
// ============================================

function safeReadFile(filePath: string, layerName: string): string {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`   Layer ${layerName}: ${path.basename(filePath)} (${content.length} chars)`);
      return content;
    } else {
      console.log(`   Layer ${layerName}: ${path.basename(filePath)} - NOT FOUND`);
      return '';
    }
  } catch (error) {
    console.log(`   Layer ${layerName}: ${path.basename(filePath)} - ERROR reading`);
    return '';
  }
}

export function readClaudeContext(): string {
  return safeReadFile(PATHS.claude, '1');
}

export function readIdentity(): string {
  return safeReadFile(PATHS.identity, '2');
}

export function readGoals(): string {
  return safeReadFile(PATHS.goals, '3');
}

export function readObservations(): string {
  return safeReadFile(PATHS.observations, '4');
}

export function readLatestEpisode(): string {
  try {
    if (!fs.existsSync(PATHS.episodeLogs)) {
      console.log(`   Layer 5: episode_logs/ - DIRECTORY NOT FOUND`);
      return '';
    }

    const files = fs.readdirSync(PATHS.episodeLogs)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log(`   Layer 5: No episode logs found`);
      return '';
    }

    const latestFile = files[0];
    const filePath = path.join(PATHS.episodeLogs, latestFile!);
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`   Layer 5: ${latestFile} (${content.length} chars)`);
    return content;
  } catch (error) {
    console.log(`   Layer 5: ERROR reading episode logs`);
    return '';
  }
}

// ============================================
// TODAY'S PLAN PARSER
// ============================================

function generateDatePatterns(): string[] {
  const today = dayjs();
  const patterns: string[] = [];

  // Various date formats to match
  // "Monday, Dec 30" or "MONDAY DEC 30" or "Dec 30" or "DEC 30"
  const dayName = today.format('dddd'); // Monday
  const monthShort = today.format('MMM'); // Dec
  const dayNum = today.format('D'); // 30

  patterns.push(`${dayName.toUpperCase()} ${monthShort.toUpperCase()} ${dayNum}`);
  patterns.push(`${dayName}, ${monthShort} ${dayNum}`);
  patterns.push(`${dayName} ${monthShort} ${dayNum}`);
  patterns.push(`${monthShort.toUpperCase()} ${dayNum}`);
  patterns.push(`${monthShort} ${dayNum}`);
  patterns.push(today.format('YYYY-MM-DD'));
  patterns.push(today.format('MM/DD'));
  patterns.push(today.format('M/D'));

  return patterns;
}

function extractUncheckedTasks(content: string): string[] {
  const taskRegex = /^-\s*\[\s*\]\s*(.+)$/gm;
  const tasks: string[] = [];
  let match;

  while ((match = taskRegex.exec(content)) !== null) {
    if (match[1]) {
      tasks.push(match[1].trim());
    }
  }

  return tasks;
}

function extractTimeBlocks(content: string): TimeBlock[] {
  // Match patterns like "### 7:00-8:30am - BLOCK NAME" or "### 9:00am-12:00pm - BLOCK NAME"
  const blockRegex = /^###\s*(\d{1,2}:\d{2}(?:am|pm)?(?:\s*-\s*\d{1,2}:\d{2}(?:am|pm)?)?)\s*-?\s*(.+)$/gim;
  const blocks: TimeBlock[] = [];
  let match;

  const lines = content.split('\n');
  let currentBlockIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const blockMatch = line.match(/^###\s*(\d{1,2}:\d{2}(?:am|pm)?(?:\s*-\s*\d{1,2}:\d{2}(?:am|pm)?)?)\s*-?\s*(.+)$/i);

    if (blockMatch) {
      blocks.push({
        time: blockMatch[1]!.trim(),
        title: blockMatch[2]!.trim(),
        tasks: [],
      });
      currentBlockIndex = blocks.length - 1;
    } else if (currentBlockIndex >= 0 && line.match(/^-\s*\[\s*\]/)) {
      const taskMatch = line.match(/^-\s*\[\s*\]\s*(.+)$/);
      if (taskMatch && taskMatch[1]) {
        blocks[currentBlockIndex]!.tasks.push(taskMatch[1].trim());
      }
    } else if (line.match(/^##\s/) && currentBlockIndex >= 0) {
      // New section, reset
      currentBlockIndex = -1;
    }
  }

  return blocks;
}

function findTodaySection(content: string, fileName: string): DailySection | null {
  const patterns = generateDatePatterns();
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Check if line is a section header containing today's date
    if (line.startsWith('##')) {
      const lineUpper = line.toUpperCase();

      for (const pattern of patterns) {
        if (lineUpper.includes(pattern.toUpperCase())) {
          // Found today's section!
          // Extract content until next ## section
          let sectionContent = line + '\n';
          let j = i + 1;

          while (j < lines.length && !lines[j]!.match(/^##\s/)) {
            sectionContent += lines[j] + '\n';
            j++;
          }

          const tasks = extractUncheckedTasks(sectionContent);
          const timeBlocks = extractTimeBlocks(sectionContent);

          return {
            date: pattern,
            title: line.replace(/^#+\s*/, '').trim(),
            content: sectionContent,
            tasks,
            timeBlocks,
          };
        }
      }
    }
  }

  return null;
}

export function getTodayPlan(): DailySection | null {
  const today = dayjs();
  console.log(`\n   Looking for today's plan: ${today.format('dddd, MMM D')}`);

  // Search in Tasks/Active directory
  const searchPaths = [PATHS.tasksActive, PERSONALOS_ROOT];

  for (const searchPath of searchPaths) {
    if (!fs.existsSync(searchPath)) continue;

    const files = fs.readdirSync(searchPath)
      .filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(searchPath, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const section = findTodaySection(content, file);

        if (section) {
          console.log(`   Found today's plan in: ${file}`);
          return section;
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
  }

  console.log(`   No section found matching today's date`);
  return null;
}

// ============================================
// MAIN CONTEXT BUILDER
// ============================================

export function getPersonalContext(): PersonalContext {
  console.log('\n   Loading 5-layer context from PersonalOS...\n');

  const claude = readClaudeContext();
  const identity = readIdentity();
  const goals = readGoals();
  const observations = readObservations();
  const latestEpisode = readLatestEpisode();
  const todayPlan = getTodayPlan();

  console.log('\n   Context loading complete!\n');

  return {
    claude,
    identity,
    goals,
    observations,
    latestEpisode,
    todayPlan,
  };
}

// ============================================
// SUMMARY GENERATOR
// ============================================

export function formatContextSummary(context: PersonalContext): string {
  let summary = '';

  if (context.claude) {
    summary += '### CLAUDE.md (Role & Patterns)\n';
    summary += context.claude.substring(0, 2000) + '\n\n';
  }

  if (context.identity) {
    summary += '### Identity (Philosophy)\n';
    summary += context.identity.substring(0, 1500) + '\n\n';
  }

  if (context.goals) {
    summary += '### Goals (What We\'re Working Toward)\n';
    summary += context.goals.substring(0, 2000) + '\n\n';
  }

  if (context.observations) {
    summary += '### Observations (Patterns & Learnings)\n';
    summary += context.observations.substring(0, 1500) + '\n\n';
  }

  if (context.latestEpisode) {
    summary += '### Latest Episode (Where We Left Off)\n';
    summary += context.latestEpisode.substring(0, 1000) + '\n\n';
  }

  if (context.todayPlan) {
    summary += `### Today's Plan (${context.todayPlan.date})\n`;
    summary += `**Title:** ${context.todayPlan.title}\n\n`;

    if (context.todayPlan.timeBlocks.length > 0) {
      summary += '**Time Blocks:**\n';
      for (const block of context.todayPlan.timeBlocks) {
        summary += `- ${block.time}: ${block.title}\n`;
        for (const task of block.tasks.slice(0, 3)) {
          summary += `  - [ ] ${task}\n`;
        }
      }
      summary += '\n';
    }

    if (context.todayPlan.tasks.length > 0) {
      summary += `**Unchecked Tasks (${context.todayPlan.tasks.length}):**\n`;
      for (const task of context.todayPlan.tasks.slice(0, 10)) {
        summary += `- [ ] ${task}\n`;
      }
      summary += '\n';
    }
  }

  return summary;
}

// Test if run directly
if (require.main === module) {
  console.log('Testing markdown-parser...\n');
  const context = getPersonalContext();
  console.log('\n--- Context Summary ---\n');
  console.log(formatContextSummary(context));
}
