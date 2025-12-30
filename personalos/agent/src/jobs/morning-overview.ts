import { callClaude } from '../utils/claude';
import { logger } from '../utils/logger';
import axios from 'axios';

interface Goal {
  id: number;
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
}

interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
}

export async function morningOverview(): Promise<string> {
  logger.info('🌅 Running Morning Overview...');

  let goals: Goal[] = [];
  let tasks: Task[] = [];

  // Fetch data from Laravel API
  try {
    const goalsResponse = await axios.get(
      `${process.env.LARAVEL_API_URL}/goals`,
      {
        headers: { Authorization: `Bearer ${process.env.LARAVEL_API_TOKEN}` },
        timeout: 5000,
      }
    );
    goals = goalsResponse.data.data || goalsResponse.data || [];
  } catch (err) {
    logger.warn('Could not fetch goals from API, using defaults');
    goals = [
      { id: 1, name: 'Cold Emails', current_value: 0, target_value: 90, unit: 'emails' },
      { id: 2, name: 'Content Posts', current_value: 0, target_value: 14, unit: 'posts' },
    ];
  }

  try {
    const tasksResponse = await axios.get(
      `${process.env.LARAVEL_API_URL}/tasks`,
      {
        headers: { Authorization: `Bearer ${process.env.LARAVEL_API_TOKEN}` },
        timeout: 5000,
      }
    );
    tasks = tasksResponse.data.data || tasksResponse.data || [];
  } catch (err) {
    logger.warn('Could not fetch tasks from API, using defaults');
    tasks = [
      { id: 1, title: 'Morning Overview Test', priority: 'high', status: 'pending' },
    ];
  }

  // Generate overview with Claude
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const goalsText = goals.length > 0
    ? goals.map(g => `- ${g.name}: ${g.current_value}/${g.target_value} ${g.unit}`).join('\n')
    : '- No goals set yet';

  const tasksText = tasks.length > 0
    ? tasks.map(t => `- [${t.priority}] ${t.title}`).join('\n')
    : '- No tasks due today';

  const prompt = `You are a Strategic Advisor AI for PersonalOS.

Today is ${today}.

Week 1 Goals:
${goalsText}

Tasks Due Today:
${tasksText}

Provide a strategic morning overview:
1. Headline (one sentence about today's focus)
2. Top 3 priorities
3. Goal alignment check (are tasks aligned with Week 1 goals?)
4. Recommendation (one specific action to take first)

Use tactical, direct language. Keep it under 200 words. No fluff.`;

  logger.info('Calling Claude for strategic analysis...');
  const overview = await callClaude(prompt, 'haiku');

  // Post to Discord
  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        content: `## 🎯 MORNING OVERVIEW\n\n${overview}`,
      });
      logger.info('✅ Posted to Discord');
    } catch (err) {
      logger.error('Failed to post to Discord', err);
    }
  }

  logger.info('✅ Morning Overview complete');
  console.log('\n--- OVERVIEW ---\n');
  console.log(overview);
  console.log('\n----------------\n');

  return overview;
}
