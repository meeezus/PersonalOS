import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const PERSONALOS_PATH = process.env.PERSONALOS_PATH || `${process.env.HOME}/PersonalOS`;
const PROJECTS_FILE = path.join(PERSONALOS_PATH, 'data', 'projects.json');

// Load projects from file
async function loadProjects() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Save projects to file
async function saveProjects(projects) {
  const dataDir = path.join(PERSONALOS_PATH, 'data');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await loadProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const projects = await loadProjects();

    const newProject = {
      id: `proj_${Date.now()}`,
      name,
      description,
      progress: 0,
      status: 'active',
      tasks: [],
      created_at: new Date().toISOString()
    };

    projects.push(newProject);
    await saveProjects(projects);

    res.json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const projects = await loadProjects();

    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    projects[index] = { ...projects[index], ...updates };
    await saveProjects(projects);

    res.json(projects[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/projects/:id/tasks
router.get('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await loadProjects();

    const project = projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project.tasks || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
