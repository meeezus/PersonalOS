# PersonalOS - Claude Code Build Instructions
**Phase 1 + Projects Implementation**

## Context

You're building PersonalOS - a recreation of Linus Lee's JFDI system. This is a full-stack web application with 11+ major components. To manage token usage, we're building incrementally.

**This phase:** Core daily workflow (Dashboard, Chat, Reminders, Projects)
**Future phases:** Calendar, Relationships, Email, Knowledge, Admin (not today)

---

## What You're Building Right Now

### 1. Backend Server (Node.js/Express)
**Port:** 3001
**Purpose:** Spawns Claude Code processes, serves API endpoints

**Key files to create:**
```
backend/
├── package.json
├── server.js
├── .env
├── routes/
│   ├── briefing.js
│   ├── chat.js
│   ├── reminders.js
│   └── projects.js
└── services/
    └── claude-code.js
```

### 2. Frontend App (React/Vite)
**Port:** 5173 (Vite default)
**Purpose:** Web UI with dashboard and embedded chat

**Key files to create:**
```
frontend/src/
├── App.jsx
├── main.jsx
├── components/
│   ├── Dashboard.jsx
│   ├── ChatPanel.jsx
│   ├── StatusBrief.jsx
│   ├── Overview.jsx
│   ├── FocusRecommendations.jsx
│   ├── TodaysSchedule.jsx
│   ├── GoalAlignment.jsx
│   ├── RemindersWidget.jsx
│   ├── ProjectsWidget.jsx
│   └── VoiceInput.jsx
├── services/
│   └── api.js
└── styles/
    └── globals.css
```

### 3. Claude Code Slash Commands
**Purpose:** AI workflows triggered by cron or API

**Key files to create:**
```
.claude/commands/
├── morning-brief.md
└── end-day.md
```

### 4. Cron Automation
**Purpose:** Auto-generate morning brief at 8:30am

**Key files to create:**
```
automation/
├── crontab
└── setup.sh
```

---

## Design System (Submission Specialist Aesthetic)

**CRITICAL: No rounded corners, no drop shadows, pure black backgrounds.**

### Color Palette
```css
/* Backgrounds */
--bg-primary: #050505;      /* Pure black */
--bg-elevated: #0a0a0a;     /* Cards */
--bg-hover: #171717;        /* Hover states */

/* Borders */
--border-subtle: #0a0a0a;
--border-default: #171717;
--border-emphasis: #262626;

/* Text */
--text-primary: #ffffff;     /* Headings */
--text-secondary: #a3a3a3;   /* Body */
--text-muted: #525252;       /* Timestamps */

/* Status Colors */
--accent-green: #10b981;     /* Success, on-track */
--accent-blue: #3b82f6;      /* Info, user messages */
--accent-purple: #8b5cf6;    /* Creative, voice */
--accent-teal: #14b8a6;      /* Relationships */
--accent-orange: #f97316;    /* Warning, due today */
--accent-red: #ef4444;       /* Urgent, overdue */
```

### Design Rules
- **NO** `border-radius` (except progress bars can have slight rounding)
- **NO** `box-shadow`
- **NO** background gradients (except in progress bar fills)
- Color ONLY for functional status (not decoration)
- Typography hierarchy over weight differences
- Information density over whitespace

---

## Step-by-Step Build Order

### STEP 1: Backend Foundation (Start Here)

**File:** `backend/package.json`
```json
{
  "name": "personalos-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**File:** `backend/.env`
```bash
PORT=3001
PERSONALOS_PATH=/Users/michael/PersonalOS
NODE_ENV=development
```

**File:** `backend/services/claude-code.js`

This is the CRITICAL file - it spawns Claude Code child processes.

**Key functions needed:**
```javascript
// Execute a slash command (e.g., /morning-brief)
export async function executeCommand(command)

// Send a chat message and get response
export async function sendChatMessage(message, sessionId)

// Read PersonalOS files
export async function readFile(relativePath)

// Write PersonalOS files
export async function writeFile(relativePath, content)

// Load today's briefing JSON
export async function loadTodaysBriefing()
```

**Implementation notes:**
- Use `child_process.spawn('claude', [args])`
- Set `cwd: PERSONALOS_PATH` so Claude Code has context
- Parse stdout to extract responses
- Clean ANSI codes and metadata from output
- Handle timeouts (60 seconds max)

**File:** `backend/server.js`

Basic Express server:
```javascript
import express from 'express';
import cors from 'cors';
import briefingRoutes from './routes/briefing.js';
import chatRoutes from './routes/chat.js';
import remindersRoutes from './routes/reminders.js';
import projectsRoutes from './routes/projects.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/briefing', briefingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/projects', projectsRoutes);

app.listen(3001, () => {
  console.log('PersonalOS backend running on port 3001');
});
```

**File:** `backend/routes/briefing.js`

Endpoints:
- `GET /api/briefing/today` - Return today's briefing JSON
- `POST /api/briefing/generate` - Manually trigger brief generation

**File:** `backend/routes/chat.js`

Endpoints:
- `POST /api/chat/message` - Send message to Claude Code
- `POST /api/chat/end-day` - Generate episode log

**File:** `backend/routes/reminders.js`

Endpoints:
- `GET /api/reminders` - List all reminders
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

**Storage:** For now, use JSON file at `~/PersonalOS/data/reminders.json`
```json
[
  {
    "id": "rem_123",
    "title": "Call Dr. Yanev for follow-up",
    "due_date": "2025-12-30",
    "category": "today",
    "completed": false,
    "created_at": "2025-12-29T10:00:00Z"
  }
]
```

**File:** `backend/routes/projects.js`

Endpoints:
- `GET /api/projects` - List all active projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `GET /api/projects/:id/tasks` - Get project tasks

**Storage:** JSON file at `~/PersonalOS/data/projects.json`
```json
[
  {
    "id": "proj_1",
    "name": "Musha Shugyo Brand",
    "description": "90-day embodiment practice",
    "progress": 15,
    "status": "active",
    "tasks": [
      {
        "id": "task_1",
        "title": "Launch Day 1 content",
        "completed": true,
        "due_date": "2025-12-30"
      }
    ]
  }
]
```

---

### STEP 2: Frontend Foundation

**File:** `frontend/src/main.jsx`
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**File:** `frontend/src/App.jsx`
```jsx
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ChatPanel from './components/ChatPanel';

export default function App() {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="app">
      <Dashboard />
      <ChatPanel 
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}
```

**File:** `frontend/src/services/api.js`

API client functions:
```javascript
const API_BASE = '/api';

export async function getTodaysBriefing()
export async function generateBriefing()
export async function sendChatMessage(message, sessionId)
export async function generateEpisodeLog()

// Reminders
export async function getReminders()
export async function createReminder(data)
export async function updateReminder(id, data)
export async function deleteReminder(id)

// Projects
export async function getProjects()
export async function createProject(data)
export async function updateProject(id, data)
export async function getProjectTasks(projectId)
```

**File:** `frontend/src/styles/globals.css`

**IMPORTANT:** Use the exact color palette from above. No rounded corners anywhere.

Basic structure:
```css
:root {
  /* Paste all color variables */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.app {
  display: flex;
  min-height: 100vh;
}

/* Card styles - NO ROUNDING */
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  padding: 1.5rem;
}

/* Continue with all component styles... */
```

---

### STEP 3: Core Components

**Build in this order:**

1. **StatusBrief.jsx** - Simple indicator (fresh/stale, timestamp, regenerate button)
2. **Overview.jsx** - Just displays the overview paragraph
3. **FocusRecommendations.jsx** - Priorities list + recommendations
4. **TodaysSchedule.jsx** - Available blocks + appointments
5. **GoalAlignment.jsx** - Progress bars with current/target/delta
6. **RemindersWidget.jsx** - List with filtering (Overdue, Today, Next 3 Days)
7. **ProjectsWidget.jsx** - Active projects with progress
8. **Dashboard.jsx** - Assembles all the above
9. **ChatPanel.jsx** - Chat interface with embedded messages
10. **VoiceInput.jsx** - Web Speech API button

**Component patterns:**

Each card component receives props and renders:
```jsx
export default function ComponentName({ data }) {
  return (
    <div className="component-card card">
      <h2>Icon Title</h2>
      {/* Content */}
    </div>
  );
}
```

**Dashboard grid layout:**
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.overview-card { grid-column: span 12; }
.focus-card { grid-column: span 7; }
.schedule-card { grid-column: span 5; }
.goals-card { grid-column: span 12; }
.reminders-card { grid-column: span 6; }
.projects-card { grid-column: span 6; }
```

---

### STEP 4: Claude Code Slash Commands

**File:** `.claude/commands/morning-brief.md`

**Purpose:** Generate strategic daily briefing

**Must read:**
- `~/PersonalOS/Memory/identity.md`
- `~/PersonalOS/Memory/goals.md`
- `~/PersonalOS/Memory/episode_logs/` (latest 2)
- `~/PersonalOS/Tasks/Active/Unified_Week1_Plan.md`

**Must generate:** JSON with this structure:
```json
{
  "date": "2025-12-30",
  "generated_at": "2025-12-30T08:30:15Z",
  "overview": "2-4 sentence strategic synthesis...",
  "priorities": [
    {
      "task": "Task name",
      "time_block": "7:00-8:30am",
      "why": "Why this matters and how it serves goals",
      "duration": "90 minutes",
      "goal_alignment": "Goal name"
    }
  ],
  "recommendations": [
    {
      "title": "Strategic advice",
      "description": "Detailed guidance",
      "confidence": 85
    }
  ],
  "schedule": {
    "available_blocks": [
      {"start": "07:00", "end": "08:30", "duration": "90min", "type": "deep_work"}
    ],
    "appointments": [
      {"time": "12:00", "title": "BJJ Training", "location": "Six Blades"}
    ]
  },
  "goals": [
    {
      "name": "Building Shugyo Brand",
      "current": 60,
      "target": 40,
      "delta": 20,
      "status": "ahead",
      "description": "How today serves this goal"
    }
  ],
  "patterns": [
    "Insight 1",
    "Insight 2"
  ]
}
```

**Must save to:** `~/PersonalOS/briefings/YYYY-MM-DD.json`

**Tone:** Calm, wise, supportive. Reference Shūgyō principles when relevant.

**File:** `.claude/commands/end-day.md`

**Purpose:** Generate episode log from today's conversations

**Must read:**
- Today's chat history (you have this from session)
- Today's briefing JSON
- Completed tasks from weekly plan

**Must generate:** Markdown with this structure:
```markdown
# Episode Log: December 30, 2025

## What Happened Today
[2-4 sentences]

## Key Decisions
- Decision 1
- Decision 2

## Tomorrow's Focus
- Carry-over or new priority

## Resistance Moments
- Time - Description

## Insights & Learnings
- Pattern or realization
```

**Must save to:** `~/PersonalOS/Memory/episode_logs/YYYY-MM-DD.md`

---

### STEP 5: Cron Automation

**File:** `automation/crontab`
```bash
# Morning brief - 8:30am Mon-Fri
30 8 * * 1-5 cd ~/PersonalOS && /usr/local/bin/claude /morning-brief >> logs/morning-brief.log 2>&1
```

**File:** `automation/setup.sh`
```bash
#!/bin/bash
mkdir -p ~/PersonalOS/logs
mkdir -p ~/PersonalOS/briefings
mkdir -p ~/PersonalOS/data
crontab ~/PersonalOS/automation/crontab
echo "✅ Automation installed!"
```

---

## Testing Checklist

After building each component, test:

**Backend:**
```bash
cd backend
npm install
npm start
# Should see: "PersonalOS backend running on port 3001"

# Test endpoints:
curl http://localhost:3001/api/briefing/today
curl -X POST http://localhost:3001/api/briefing/generate
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

**Slash commands:**
```bash
cd ~/PersonalOS
claude /morning-brief
# Check: cat briefings/$(date +%Y-%m-%d).json
```

**Cron:**
```bash
cd automation
./setup.sh
crontab -l
# Should see your cron job
```

---

## What NOT to Build Yet (Save for Later)

❌ Calendar integration (Google Calendar API)
❌ Email integration (Gmail API)
❌ Relationships/CRM
❌ Meetings notes
❌ Knowledge base
❌ Admin dashboard (token tracking, system health)
❌ MCP servers
❌ Job queue system

**Why:** Token usage. Build Phase 1 + Projects first, make sure it works, then add more.

---

## Token-Saving Tips

**When implementing:**
1. Start with backend routes (simple CRUD)
2. Build components one at a time
3. Test each component before moving to next
4. Reuse patterns (all cards look similar)
5. Copy/paste repetitive code instead of asking me to generate similar things

**If you get stuck:**
- Show me the specific error
- Don't ask me to rewrite entire files
- Ask focused questions

---

## Success Criteria

**You'll know Phase 1 + Projects is done when:**

✅ Backend running on port 3001
✅ Frontend running on port 5173
✅ Dashboard displays today's briefing (if generated)
✅ Can click "Generate Brief" button to trigger `/morning-brief`
✅ Chat panel sends messages and gets responses
✅ Can add/view/complete reminders
✅ Can view active projects with progress
✅ Voice input button captures speech
✅ "End Day" generates episode log
✅ Cron job will auto-generate brief at 8:30am tomorrow
✅ Everything uses Submission Specialist aesthetic (pure black, hard edges)

---

## File You're Creating (Full List)

```
~/PersonalOS/
├── backend/
│   ├── package.json ✓
│   ├── server.js ✓
│   ├── .env ✓
│   ├── routes/
│   │   ├── briefing.js ✓
│   │   ├── chat.js ✓
│   │   ├── reminders.js ✓
│   │   └── projects.js ✓
│   └── services/
│       └── claude-code.js ✓
├── frontend/
│   ├── package.json ✓
│   ├── vite.config.js ✓
│   ├── index.html ✓
│   └── src/
│       ├── main.jsx ✓
│       ├── App.jsx ✓
│       ├── components/
│       │   ├── Dashboard.jsx ✓
│       │   ├── ChatPanel.jsx ✓
│       │   ├── StatusBrief.jsx ✓
│       │   ├── Overview.jsx ✓
│       │   ├── FocusRecommendations.jsx ✓
│       │   ├── TodaysSchedule.jsx ✓
│       │   ├── GoalAlignment.jsx ✓
│       │   ├── RemindersWidget.jsx ✓
│       │   ├── ProjectsWidget.jsx ✓
│       │   └── VoiceInput.jsx ✓
│       ├── services/
│       │   └── api.js ✓
│       └── styles/
│           └── globals.css ✓
├── .claude/
│   └── commands/
│       ├── morning-brief.md ✓
│       └── end-day.md ✓
├── automation/
│   ├── crontab ✓
│   └── setup.sh ✓
├── data/
│   ├── reminders.json (created at runtime)
│   └── projects.json (created at runtime)
├── briefings/ (created at runtime)
└── logs/ (created at runtime)
```

**Total: ~25 files to create**

---

## Start Command for Claude Code

**Tell Claude Code:**

"Build Phase 1 + Projects of PersonalOS following these instructions. Start with the backend foundation (Step 1), then frontend (Step 2), then components (Step 3), then slash commands (Step 4), then cron (Step 5). Build files in the order listed. Test each major component before moving to the next. Use the Submission Specialist design system exactly as specified (no rounded corners, pure black backgrounds). Ask me if you need clarification on any part."

**Then:** Let it build file by file, test as you go.

---

## Quick Reference

**Backend API endpoints:**
- GET /api/briefing/today
- POST /api/briefing/generate
- POST /api/chat/message
- POST /api/chat/end-day
- GET /api/reminders
- POST /api/reminders
- PUT /api/reminders/:id
- DELETE /api/reminders/:id
- GET /api/projects
- POST /api/projects
- PUT /api/projects/:id

**Slash commands:**
- `/morning-brief` - Generate daily briefing
- `/end-day` - Generate episode log

**Ports:**
- Backend: 3001
- Frontend: 5173

**Design system:**
- Pure black: #050505
- Elevated: #0a0a0a
- NO rounded corners
- NO shadows
- Color = function only

---

Good luck! 🚀
