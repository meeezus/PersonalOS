import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';

// ============================================
// FILE PATHS
// ============================================

const HOME = process.env.HOME || '/Users/michaelenriquez';
const PERSONALOS_ROOT = path.join(HOME, 'PersonalOS');

const PATHS = {
  observations: path.join(PERSONALOS_ROOT, 'Memory', 'observations.md'),
  episodeLogs: path.join(PERSONALOS_ROOT, 'Memory', 'episode_logs'),
  goals: path.join(PERSONALOS_ROOT, 'Memory', 'goals.md'),
};

// ============================================
// ENSURE DIRECTORY EXISTS
// ============================================

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ============================================
// APPEND TO OBSERVATIONS
// ============================================

export function appendObservation(content: string): boolean {
  try {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm');
    const entry = `\n\n## ${timestamp}\n\n${content}`;

    // Create file if it doesn't exist
    if (!fs.existsSync(PATHS.observations)) {
      const header = `# Observations & Patterns\n\nLogged insights, patterns, and learnings.\n`;
      fs.writeFileSync(PATHS.observations, header + entry, 'utf-8');
    } else {
      fs.appendFileSync(PATHS.observations, entry, 'utf-8');
    }

    console.log(`[file-writer] Appended observation to ${PATHS.observations}`);
    return true;
  } catch (error) {
    console.error('[file-writer] Failed to append observation:', error);
    return false;
  }
}

// ============================================
// WRITE EPISODE LOG
// ============================================

export function writeEpisodeLog(title: string, content: string): string | null {
  try {
    ensureDir(PATHS.episodeLogs);

    const timestamp = dayjs().format('YYYY-MM-DD_HHmm');
    const safeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .substring(0, 50);
    const fileName = `${timestamp}_${safeTitle}.md`;
    const filePath = path.join(PATHS.episodeLogs, fileName);

    const fullContent = `# ${title}

**Date:** ${dayjs().format('dddd, MMMM D, YYYY [at] h:mm A')}

---

${content}

---

*Logged via Jotaro*
`;

    fs.writeFileSync(filePath, fullContent, 'utf-8');
    console.log(`[file-writer] Created episode log: ${fileName}`);
    return filePath;
  } catch (error) {
    console.error('[file-writer] Failed to write episode log:', error);
    return null;
  }
}

// ============================================
// UPDATE TASK IN MARKDOWN FILE
// ============================================

export function markTaskComplete(taskText: string, filePath?: string): boolean {
  try {
    const searchPaths = filePath
      ? [filePath]
      : [
          path.join(PERSONALOS_ROOT, 'Tasks', 'Active', 'Unified_Week1_Plan.md'),
          path.join(PERSONALOS_ROOT, 'Tasks', 'Daily', 'Today.md'),
        ];

    for (const searchPath of searchPaths) {
      if (!fs.existsSync(searchPath)) continue;

      let content = fs.readFileSync(searchPath, 'utf-8');

      // Find unchecked task and mark it complete
      const uncheckedPattern = new RegExp(
        `- \\[ \\] ${taskText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'i'
      );

      if (uncheckedPattern.test(content)) {
        content = content.replace(uncheckedPattern, `- [x] ${taskText}`);
        fs.writeFileSync(searchPath, content, 'utf-8');
        console.log(`[file-writer] Marked task complete in ${searchPath}: ${taskText}`);
        return true;
      }
    }

    console.log(`[file-writer] Task not found in markdown files: ${taskText}`);
    return false;
  } catch (error) {
    console.error('[file-writer] Failed to mark task complete:', error);
    return false;
  }
}

// ============================================
// ADD TASK TO TODAY'S PLAN
// ============================================

export function addTaskToToday(taskText: string, priority?: string): boolean {
  try {
    const todayPath = path.join(PERSONALOS_ROOT, 'Tasks', 'Daily', 'Today.md');
    ensureDir(path.dirname(todayPath));

    const today = dayjs().format('dddd, MMMM D, YYYY');
    const priorityTag = priority ? ` [${priority.toUpperCase()}]` : '';
    const taskLine = `- [ ]${priorityTag} ${taskText}`;

    if (!fs.existsSync(todayPath)) {
      // Create new today file
      const content = `# Today - ${today}\n\n## Tasks\n\n${taskLine}\n`;
      fs.writeFileSync(todayPath, content, 'utf-8');
    } else {
      // Append to existing file
      let content = fs.readFileSync(todayPath, 'utf-8');

      // Find the Tasks section and append
      if (content.includes('## Tasks')) {
        content = content.replace(
          /(## Tasks\n\n)/,
          `$1${taskLine}\n`
        );
      } else {
        content += `\n\n## Tasks\n\n${taskLine}\n`;
      }

      fs.writeFileSync(todayPath, content, 'utf-8');
    }

    console.log(`[file-writer] Added task to today: ${taskText}`);
    return true;
  } catch (error) {
    console.error('[file-writer] Failed to add task:', error);
    return false;
  }
}

// ============================================
// UPDATE GOAL PROGRESS IN MARKDOWN
// ============================================

export function updateGoalProgress(goalTitle: string, current: number): boolean {
  try {
    if (!fs.existsSync(PATHS.goals)) {
      console.log('[file-writer] goals.md not found');
      return false;
    }

    let content = fs.readFileSync(PATHS.goals, 'utf-8');

    // Look for goal and update its progress
    // Pattern: **Title:** progress/target
    const goalPattern = new RegExp(
      `(\\*\\*${goalTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\*\\*\\s*)(\\d+)(/\\d+)`,
      'i'
    );

    if (goalPattern.test(content)) {
      content = content.replace(goalPattern, `$1${current}$3`);
      fs.writeFileSync(PATHS.goals, content, 'utf-8');
      console.log(`[file-writer] Updated goal progress: ${goalTitle} = ${current}`);
      return true;
    }

    console.log(`[file-writer] Goal not found in goals.md: ${goalTitle}`);
    return false;
  } catch (error) {
    console.error('[file-writer] Failed to update goal:', error);
    return false;
  }
}

// ============================================
// TEST
// ============================================

if (require.main === module) {
  console.log('Testing file-writer...\n');

  // Test observation
  appendObservation('Test observation from file-writer test run.');

  // Test episode log
  writeEpisodeLog('Test Episode', 'This is a test episode created by file-writer.');

  console.log('\nTests complete. Check Memory folder.');
}
