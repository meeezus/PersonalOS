import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const PERSONALOS_PATH = process.env.PERSONALOS_PATH || `${process.env.HOME}/PersonalOS`;
const REMINDERS_FILE = path.join(PERSONALOS_PATH, 'data', 'reminders.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(PERSONALOS_PATH, 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
}

// Load reminders from file
async function loadReminders() {
  try {
    const data = await fs.readFile(REMINDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Save reminders to file
async function saveReminders(reminders) {
  await ensureDataDir();
  await fs.writeFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
}

// GET /api/reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await loadReminders();
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reminders
router.post('/', async (req, res) => {
  try {
    const { title, due_date, category } = req.body;
    const reminders = await loadReminders();

    const newReminder = {
      id: `rem_${Date.now()}`,
      title,
      due_date,
      category: category || 'anytime',
      completed: false,
      created_at: new Date().toISOString()
    };

    reminders.push(newReminder);
    await saveReminders(reminders);

    res.json(newReminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reminders/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const reminders = await loadReminders();

    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminders[index] = { ...reminders[index], ...updates };
    await saveReminders(reminders);

    res.json(reminders[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reminders = await loadReminders();

    const filtered = reminders.filter(r => r.id !== id);
    await saveReminders(filtered);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
