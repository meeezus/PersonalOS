# PersonalOS: Full-Stack JFDI Recreation
**Web Application Using Claude Code + Your Existing Claude Pro ($20/month)**

## Executive Summary

PersonalOS is a complete recreation of Linus Lee's JFDI system - a web-based personal operating system that:
- Auto-generates strategic morning briefs at 8:30am (via cron → Claude Code)
- Provides an embedded chat interface for AI support throughout the day
- Tracks goals, manages tasks, surfaces insights
- Runs entirely on your existing Claude Pro subscription ($0 additional costs)

**Key difference from my previous designs:** This is a proper web application with backend server and React frontend. Users NEVER open a terminal - everything happens through the browser.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CRON AUTOMATION LAYER                           │
│                                                                      │
│  8:30am Mon-Fri: Trigger /morning-brief command                     │
│  2:00pm Daily:   Trigger /check-in (optional)                       │
│  9:00pm Daily:   Reminder notification                              │
└──────────────────────────┬──────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE CLI LAYER                             │
│                                                                      │
│  Slash Commands:                                                    │
│  • /morning-brief → Reads files, generates JSON briefing           │
│  • /end-day → Creates episode log from chat history                │
│  • /check-in → Midday progress check                               │
│                                                                      │
│  Output: JSON files saved to ~/PersonalOS/briefings/                │
└──────────────────────────┬──────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER (Node.js + Express)              │
│                                                                      │
│  Port: 3001                                                         │
│                                                                      │
│  API Endpoints:                                                     │
│  • GET  /api/briefing/today → Returns today's briefing JSON        │
│  • POST /api/briefing/generate → Manually trigger brief generation │
│  • POST /api/chat/message → Send message to Claude Code            │
│  • GET  /api/chat/history → Get conversation history               │
│  • POST /api/episode-log → Generate end-of-day log                 │
│  • GET  /api/files/:path → Read PersonalOS files                   │
│                                                                      │
│  Key Function: Spawns Claude Code child processes                   │
│  Example: spawn('claude', ['chat'], { cwd: '~/PersonalOS' })       │
└──────────────────────────┬──────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND APP (React + Vite)                       │
│                                                                      │
│  Port: 3000                                                         │
│                                                                      │
│  Components:                                                        │
│  • Dashboard (main view with briefing cards)                        │
│  • ChatPanel (embedded AI assistant)                                │
│  • StatusBrief, Overview, FocusRecommendations                      │
│  • TodaysSchedule, GoalAlignment                                    │
│  • VoiceInput, QuickActions                                         │
│                                                                      │
│  Design: Submission Specialist aesthetic (pure black, hard edges)   │
└─────────────────────────────────────────────────────────────────────┘
```

**User Experience Flow:**

1. **8:30am:** Cron triggers `/morning-brief` → Brief saves to `briefings/2025-12-30.json`
2. **9:00am:** You open browser → `http://localhost:3000`
3. **Dashboard loads:** Fetches briefing via API → Displays cards
4. **Chat available:** Embedded panel → Type message → Backend spawns Claude Code → Response displays
5. **Voice input:** Click mic → Speak → Web Speech API → Sent to chat
6. **9:00pm:** Click "End Day" button → API generates episode log via `/end-day`

---

## Part 1: Directory Structure

```
~/PersonalOS/
├── Memory/
│   ├── identity.md              # Your core values, mission
│   ├── goals.md                 # Current goals and targets
│   └── episode_logs/
│       ├── 2025-12-30.md       # Auto-generated by /end-day
│       └── ...
├── Tasks/
│   └── Active/
│       └── Unified_Week1_Plan.md
├── briefings/
│   ├── 2025-12-30.json         # Generated by /morning-brief
│   └── ...
├── .claude/
│   └── commands/
│       ├── morning-brief.md     # Slash command definitions
│       ├── end-day.md
│       └── check-in.md
├── backend/                     # Node.js/Express server
│   ├── server.js
│   ├── routes/
│   │   ├── briefing.js
│   │   ├── chat.js
│   │   └── files.js
│   ├── services/
│   │   └── claude-code.js      # Claude Code spawning logic
│   └── package.json
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── StatusBrief.jsx
│   │   │   ├── Overview.jsx
│   │   │   ├── FocusRecommendations.jsx
│   │   │   ├── TodaysSchedule.jsx
│   │   │   ├── GoalAlignment.jsx
│   │   │   └── VoiceInput.jsx
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── automation/
    ├── crontab                  # Cron job definitions
    └── setup.sh                 # Installation script
```

---

## Part 2: Backend Server

### backend/package.json

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

### backend/server.js

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import briefingRoutes from './routes/briefing.js';
import chatRoutes from './routes/chat.js';
import filesRoutes from './routes/files.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/briefing', briefingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', filesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PersonalOS backend running on port ${PORT}`);
  console.log(`PersonalOS directory: ${process.env.PERSONALOS_PATH}`);
});
```

### backend/.env

```bash
PORT=3001
PERSONALOS_PATH=/Users/michael/PersonalOS
```

### backend/services/claude-code.js

**This is the key file that spawns Claude Code processes:**

```javascript
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const PERSONALOS_PATH = process.env.PERSONALOS_PATH || `${process.env.HOME}/PersonalOS`;

/**
 * Execute a Claude Code slash command
 * @param {string} command - The slash command (e.g., '/morning-brief')
 * @returns {Promise<string>} - Command output
 */
export async function executeCommand(command) {
  return new Promise((resolve, reject) => {
    const process = spawn('claude', [command], {
      cwd: PERSONALOS_PATH,
      env: process.env
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Claude command failed: ${stderr}`));
      }
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      process.kill();
      reject(new Error('Claude command timed out'));
    }, 60000);
  });
}

/**
 * Send a message to Claude Code in chat mode
 * @param {string} message - User message
 * @param {string} sessionId - Optional session ID for continuity
 * @returns {Promise<{response: string, sessionId: string}>}
 */
export async function sendChatMessage(message, sessionId = null) {
  return new Promise((resolve, reject) => {
    // Start Claude Code in chat mode
    const args = ['chat'];
    if (sessionId) {
      args.push('--session', sessionId);
    }

    const claudeProcess = spawn('claude', args, {
      cwd: PERSONALOS_PATH,
      env: process.env
    });

    let response = '';
    let error = '';

    // Send the message
    claudeProcess.stdin.write(message + '\n');
    claudeProcess.stdin.end();

    claudeProcess.stdout.on('data', (data) => {
      response += data.toString();
    });

    claudeProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    claudeProcess.on('close', (code) => {
      if (code === 0) {
        // Extract response and session ID
        const cleanResponse = cleanChatResponse(response);
        const extractedSessionId = extractSessionId(response) || sessionId || generateSessionId();
        
        resolve({
          response: cleanResponse,
          sessionId: extractedSessionId
        });
      } else {
        reject(new Error(`Chat failed: ${error}`));
      }
    });

    // Timeout
    setTimeout(() => {
      claudeProcess.kill();
      reject(new Error('Chat timed out'));
    }, 60000);
  });
}

/**
 * Clean Claude Code chat output (remove metadata, formatting)
 */
function cleanChatResponse(output) {
  // Remove ANSI codes
  let clean = output.replace(/\x1B\[[0-9;]*[JKmsu]/g, '');
  
  // Remove session metadata
  clean = clean.replace(/Session ID: [a-f0-9-]+\n/g, '');
  clean = clean.replace(/Token usage: .*\n/g, '');
  
  // Remove prompt indicators
  clean = clean.replace(/^>\s*/gm, '');
  
  return clean.trim();
}

/**
 * Extract session ID from Claude Code output
 */
function extractSessionId(output) {
  const match = output.match(/Session ID: ([a-f0-9-]+)/);
  return match ? match[1] : null;
}

/**
 * Generate a simple session ID
 */
function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Read a PersonalOS file
 */
export async function readFile(relativePath) {
  const fullPath = path.join(PERSONALOS_PATH, relativePath);
  return await fs.readFile(fullPath, 'utf-8');
}

/**
 * Write a PersonalOS file
 */
export async function writeFile(relativePath, content) {
  const fullPath = path.join(PERSONALOS_PATH, relativePath);
  await fs.writeFile(fullPath, content, 'utf-8');
}

/**
 * Load today's briefing
 */
export async function loadTodaysBriefing() {
  const today = new Date().toISOString().split('T')[0];
  const briefingPath = path.join(PERSONALOS_PATH, 'briefings', `${today}.json`);
  
  try {
    const content = await fs.readFile(briefingPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Load chat history for a session
 */
export async function loadChatHistory(sessionId) {
  // Claude Code stores sessions in ~/.claude/sessions/
  const sessionPath = path.join(process.env.HOME, '.claude', 'sessions', sessionId);
  
  try {
    const content = await fs.readFile(sessionPath, 'utf-8');
    return parseSessionFile(content);
  } catch (error) {
    return [];
  }
}

/**
 * Parse Claude Code session file into messages
 */
function parseSessionFile(content) {
  const lines = content.split('\n').filter(Boolean);
  const messages = [];
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      messages.push({
        role: entry.role,
        content: entry.content,
        timestamp: entry.timestamp || new Date().toISOString()
      });
    } catch (e) {
      // Skip malformed lines
    }
  }
  
  return messages;
}
```

### backend/routes/briefing.js

```javascript
import express from 'express';
import { executeCommand, loadTodaysBriefing } from '../services/claude-code.js';

const router = express.Router();

/**
 * GET /api/briefing/today
 * Get today's briefing (if it exists)
 */
router.get('/today', async (req, res) => {
  try {
    const briefing = await loadTodaysBriefing();
    
    if (briefing) {
      res.json(briefing);
    } else {
      res.status(404).json({ 
        error: 'No briefing found for today',
        message: 'Generate one with POST /api/briefing/generate'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/briefing/generate
 * Manually trigger morning brief generation
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('Generating morning brief...');
    
    const output = await executeCommand('/morning-brief');
    
    console.log('Brief generated successfully');
    
    // Load the newly generated briefing
    const briefing = await loadTodaysBriefing();
    
    res.json({
      success: true,
      briefing,
      message: 'Morning brief generated successfully'
    });
  } catch (error) {
    console.error('Brief generation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### backend/routes/chat.js

```javascript
import express from 'express';
import { sendChatMessage, loadChatHistory, executeCommand } from '../services/claude-code.js';

const router = express.Router();

/**
 * POST /api/chat/message
 * Send a message to Claude Code
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log(`Chat message: "${message.substring(0, 50)}..."`);
    
    const result = await sendChatMessage(message, sessionId);
    
    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/history
 * Get conversation history for a session
 */
router.get('/history', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.json({ messages: [] });
    }
    
    const messages = await loadChatHistory(sessionId);
    
    res.json({ messages });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/end-day
 * Generate episode log from today's conversations
 */
router.post('/end-day', async (req, res) => {
  try {
    console.log('Generating episode log...');
    
    const output = await executeCommand('/end-day');
    
    res.json({
      success: true,
      message: 'Episode log generated successfully',
      output
    });
  } catch (error) {
    console.error('Episode log generation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### backend/routes/files.js

```javascript
import express from 'express';
import { readFile } from '../services/claude-code.js';

const router = express.Router();

/**
 * GET /api/files/:path
 * Read a PersonalOS file
 * Example: /api/files/Memory/identity.md
 */
router.get('/:path(*)', async (req, res) => {
  try {
    const filePath = req.params.path;
    
    // Security: Don't allow parent directory traversal
    if (filePath.includes('..')) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    const content = await readFile(filePath);
    
    res.json({
      path: filePath,
      content
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
```

---

## Part 3: Frontend Application

### frontend/package.json

```json
{
  "name": "personalos-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

### frontend/vite.config.js

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

### frontend/src/services/api.js

```javascript
const API_BASE = '/api';

/**
 * Fetch today's briefing
 */
export async function getTodaysBriefing() {
  const response = await fetch(`${API_BASE}/briefing/today`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch briefing');
  }
  return await response.json();
}

/**
 * Generate a new briefing
 */
export async function generateBriefing() {
  const response = await fetch(`${API_BASE}/briefing/generate`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to generate briefing');
  }
  return await response.json();
}

/**
 * Send a chat message
 */
export async function sendChatMessage(message, sessionId = null) {
  const response = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId })
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return await response.json();
}

/**
 * Get chat history
 */
export async function getChatHistory(sessionId) {
  const response = await fetch(`${API_BASE}/chat/history?sessionId=${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  return await response.json();
}

/**
 * Generate episode log
 */
export async function generateEpisodeLog() {
  const response = await fetch(`${API_BASE}/chat/end-day`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to generate episode log');
  }
  return await response.json();
}

/**
 * Read a PersonalOS file
 */
export async function readFile(path) {
  const response = await fetch(`${API_BASE}/files/${path}`);
  if (!response.ok) {
    throw new Error('File not found');
  }
  return await response.json();
}
```

### frontend/src/App.jsx

```jsx
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ChatPanel from './components/ChatPanel';
import './styles/globals.css';

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

### frontend/src/components/Dashboard.jsx

```jsx
import { useState, useEffect } from 'react';
import { getTodaysBriefing, generateBriefing } from '../services/api';
import StatusBrief from './StatusBrief';
import Overview from './Overview';
import FocusRecommendations from './FocusRecommendations';
import TodaysSchedule from './TodaysSchedule';
import GoalAlignment from './GoalAlignment';

export default function Dashboard() {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBriefing();
  }, []);

  async function loadBriefing() {
    try {
      setLoading(true);
      const data = await getTodaysBriefing();
      setBriefing(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBriefing() {
    try {
      setLoading(true);
      const result = await generateBriefing();
      setBriefing(result.briefing);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !briefing) {
    return (
      <main className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </main>
    );
  }

  if (error && !briefing) {
    return (
      <main className="dashboard">
        <div className="error-state">
          <h2>No briefing found for today</h2>
          <p>Generate your morning brief to get started.</p>
          <button onClick={handleGenerateBriefing} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Morning Brief'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <StatusBrief 
        briefing={briefing}
        onRegenerate={handleGenerateBriefing}
      />
      
      <div className="dashboard-grid">
        <Overview overview={briefing.overview} />
        
        <FocusRecommendations 
          priorities={briefing.priorities}
          recommendations={briefing.recommendations}
        />
        
        <TodaysSchedule schedule={briefing.schedule} />
        
        <GoalAlignment goals={briefing.goals} />
        
        {briefing.patterns && briefing.patterns.length > 0 && (
          <div className="patterns-card card">
            <h2>📊 Patterns Detected</h2>
            <ul>
              {briefing.patterns.map((pattern, i) => (
                <li key={i}>{pattern}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
```

### frontend/src/components/ChatPanel.jsx

**This is the key component - embedded web chat, not terminal:**

```jsx
import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatHistory, generateEpisodeLog } from '../services/api';
import VoiceInput from './VoiceInput';

export default function ChatPanel({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Good morning! I've read your identity, goals, latest episode log, and this week's plan.\n\nReady to talk through today's priorities?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await sendChatMessage(input, sessionId);
      
      if (!sessionId) {
        setSessionId(result.sessionId);
      }

      const assistantMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleVoiceTranscript(transcript) {
    setInput(transcript);
  }

  async function handleEndDay() {
    try {
      setLoading(true);
      await generateEpisodeLog();
      
      const confirmMessage = {
        role: 'system',
        content: "Episode log generated successfully! Your day has been logged to Memory/episode_logs/. Tomorrow's brief will reference it for continuity.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, confirmMessage]);
    } catch (error) {
      console.error('End day error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <div className="chat-panel collapsed">
        <button className="collapse-toggle" onClick={onToggle}>
          ◀
        </button>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <button className="collapse-toggle" onClick={onToggle}>
        ▶
      </button>

      <div className="chat-header">
        <div className="avatar">C</div>
        <div className="status">
          <div className="name">Claude</div>
          <div className="subtitle">PersonalOS Assistant</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="message-content thinking">Thinking...</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        <button onClick={() => setInput("What should I focus on first and why?")}>
          📋 Priority order?
        </button>
        <button onClick={() => setInput("I'm stuck starting this task. Break it into smaller steps?")}>
          ⚡ Help me start
        </button>
        <button onClick={() => setInput("How does my current work align with my goals?")}>
          🎯 Goal alignment?
        </button>
        <button onClick={handleEndDay} disabled={loading}>
          ✅ End day
        </button>
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Talk to Claude..."
          disabled={loading}
          rows={3}
        />
        
        <div className="input-actions">
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

### frontend/src/components/VoiceInput.jsx

```jsx
import { useState } from 'react';

export default function VoiceInput({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);

  function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.start();
  }

  return (
    <button
      className={`voice-button ${listening ? 'listening' : ''}`}
      onClick={startListening}
      disabled={disabled || listening}
      title="Voice input"
    >
      {listening ? '🎤' : '🎙️'}
    </button>
  );
}
```

### frontend/src/components/StatusBrief.jsx

```jsx
export default function StatusBrief({ briefing, onRegenerate }) {
  if (!briefing) return null;

  const generatedAt = new Date(briefing.generated_at);
  const now = new Date();
  const hoursOld = (now - generatedAt) / (1000 * 60 * 60);
  const isFresh = hoursOld < 4;

  return (
    <div className="status-brief">
      <div className="indicator">
        <span className={`dot ${isFresh ? 'green' : 'orange'}`} />
        <span className="label">{isFresh ? 'Fresh' : 'Stale'}</span>
      </div>
      
      <div className="timestamp">
        {generatedAt.toLocaleString()}
      </div>
      
      <button onClick={onRegenerate} className="regenerate-btn">
        Regenerate
      </button>
    </div>
  );
}
```

### frontend/src/components/Overview.jsx

```jsx
export default function Overview({ overview }) {
  return (
    <div className="overview-card card">
      <h2>📋 Overview</h2>
      <p className="overview-text">{overview}</p>
    </div>
  );
}
```

### frontend/src/components/FocusRecommendations.jsx

```jsx
export default function FocusRecommendations({ priorities, recommendations }) {
  return (
    <div className="focus-card card">
      <h2>💡 Focus & Recommendations</h2>
      
      <section className="priorities-section">
        <h3>Top Priorities</h3>
        <div className="priorities-list">
          {priorities.map((task, i) => (
            <div key={i} className="priority-item">
              <input type="checkbox" id={`task-${i}`} />
              <label htmlFor={`task-${i}`}>
                <div className="task-header">
                  <span className="task-title">{task.task}</span>
                  <span className="task-time">{task.time_block}</span>
                </div>
                <div className="task-why">{task.why}</div>
                <div className="task-meta">
                  <span className="badge duration">{task.duration}</span>
                  {task.goal_alignment && (
                    <span className="badge goal">{task.goal_alignment}</span>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="recommendations-section">
        <h3>Recommendations</h3>
        <div className="recommendations-list">
          {recommendations.map((rec, i) => (
            <div key={i} className="recommendation-item">
              <div className="rec-number">{i + 1}</div>
              <div className="rec-content">
                <div className="rec-title">{rec.title}</div>
                <div className="rec-description">{rec.description}</div>
              </div>
              <div className="rec-confidence">
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>
                <span>{rec.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### frontend/src/components/TodaysSchedule.jsx

```jsx
export default function TodaysSchedule({ schedule }) {
  if (!schedule) return null;

  return (
    <div className="schedule-card card">
      <h2>📅 Today's Schedule</h2>
      
      {schedule.available_blocks && schedule.available_blocks.length > 0 && (
        <section className="available-blocks">
          <h3>Available Blocks</h3>
          {schedule.available_blocks.map((block, i) => (
            <div key={i} className="time-block available">
              <span className="time">{block.start}-{block.end}</span>
              <span className="label">{block.type.replace('_', ' ')}</span>
              <span className="duration">({block.duration})</span>
            </div>
          ))}
        </section>
      )}

      {schedule.appointments && schedule.appointments.length > 0 && (
        <section className="appointments">
          <h3>Appointments</h3>
          {schedule.appointments.map((apt, i) => (
            <div key={i} className="appointment-item">
              <div className="apt-time">{apt.time}</div>
              <div className="apt-details">
                <div className="apt-title">{apt.title}</div>
                {apt.location && (
                  <div className="apt-location">📍 {apt.location}</div>
                )}
                <div className="apt-duration">{apt.duration}</div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
```

### frontend/src/components/GoalAlignment.jsx

```jsx
export default function GoalAlignment({ goals }) {
  return (
    <div className="goals-card card">
      <h2>🎯 Goal Alignment</h2>
      
      <div className="goals-list">
        {goals.map((goal, i) => (
          <div key={i} className="goal-item">
            <div className="goal-header">
              <span className="goal-name">{goal.name}</span>
              <span className="goal-stats">
                <span className="current">{goal.current}%</span>
                <span className="target">[{goal.target}%]</span>
                <span className={`delta ${goal.delta > 0 ? 'positive' : 'negative'}`}>
                  {goal.delta > 0 ? '+' : ''}{goal.delta}%
                  {goal.delta > 10 ? ' 🔥' : goal.delta < -10 ? ' ⚠️' : ''}
                </span>
              </span>
            </div>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${goal.status}`}
                  style={{ width: `${goal.current}%` }}
                />
                <div 
                  className="progress-target"
                  style={{ left: `${goal.target}%` }}
                />
              </div>
            </div>
            
            <div className="goal-description">{goal.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### frontend/src/styles/globals.css

**Submission Specialist Aesthetic:**

```css
/* Design System */
:root {
  /* Backgrounds */
  --bg-primary: #050505;
  --bg-elevated: #0a0a0a;
  --bg-hover: #171717;

  /* Borders */
  --border-subtle: #0a0a0a;
  --border-default: #171717;
  --border-emphasis: #262626;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a3a3a3;
  --text-muted: #525252;

  /* Status Colors */
  --accent-green: #10b981;
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-teal: #14b8a6;
  --accent-orange: #f97316;
  --accent-red: #ef4444;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
}

/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
}

/* App Layout */
.app {
  display: flex;
  min-height: 100vh;
}

/* Dashboard */
.dashboard {
  flex: 1;
  padding: var(--space-8);
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Card Component */
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  padding: var(--space-6);
  grid-column: span 12;
}

.card h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--space-3);
  color: var(--text-secondary);
}

/* Status Brief */
.status-brief {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
}

.status-brief .indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.status-brief .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-brief .dot.green { background: var(--accent-green); }
.status-brief .dot.orange { background: var(--accent-orange); }

.status-brief .timestamp {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.status-brief .regenerate-btn {
  margin-left: auto;
  padding: var(--space-2) var(--space-4);
  background: var(--bg-hover);
  border: 1px solid var(--border-emphasis);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-brief .regenerate-btn:hover {
  background: var(--border-emphasis);
}

/* Overview Card */
.overview-card {
  grid-column: span 12;
}

.overview-text {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--text-secondary);
}

/* Focus Card */
.focus-card {
  grid-column: span 7;
}

.priorities-section {
  margin-bottom: var(--space-6);
}

.priority-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  border-left: 2px solid var(--accent-orange);
  background: var(--bg-primary);
}

.priority-item input[type="checkbox"] {
  margin-top: 0.25rem;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-emphasis);
  background: transparent;
  cursor: pointer;
}

.priority-item input[type="checkbox"]:checked {
  background: var(--accent-green);
  border-color: var(--accent-green);
}

.priority-item label {
  flex: 1;
  cursor: pointer;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--space-2);
}

.task-title {
  font-weight: 600;
  color: var(--text-primary);
}

.task-time {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.task-why {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: var(--space-2);
}

.badge {
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.badge.duration {
  color: var(--accent-orange);
}

.badge.goal {
  color: var(--accent-teal);
}

/* Recommendations */
.recommendation-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  background: var(--bg-primary);
  border-left: 2px solid var(--accent-blue);
}

.rec-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--accent-orange);
  color: var(--bg-primary);
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.rec-content {
  flex: 1;
}

.rec-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.rec-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.rec-confidence {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--accent-green);
  font-size: 0.875rem;
  font-weight: 600;
}

.confidence-bar {
  width: 60px;
  height: 4px;
  background: var(--bg-hover);
}

.confidence-fill {
  height: 100%;
  background: var(--accent-green);
}

/* Schedule Card */
.schedule-card {
  grid-column: span 5;
}

.time-block {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  background: var(--bg-primary);
  border-left: 2px solid var(--accent-green);
}

.time-block .time {
  font-weight: 600;
  color: var(--accent-green);
}

.time-block .label {
  color: var(--text-secondary);
  text-transform: capitalize;
}

.time-block .duration {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.appointment-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  background: var(--bg-primary);
  border-left: 2px solid var(--accent-orange);
}

.apt-time {
  font-weight: 600;
  color: var(--accent-orange);
}

.apt-details {
  flex: 1;
}

.apt-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.apt-location {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.apt-duration {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Goals Card */
.goals-card {
  grid-column: span 12;
}

.goal-item {
  margin-bottom: var(--space-6);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.goal-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.goal-stats {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
}

.goal-stats .current {
  font-weight: 700;
  color: var(--text-primary);
}

.goal-stats .target {
  color: var(--text-muted);
}

.goal-stats .delta {
  font-weight: 600;
}

.goal-stats .delta.positive {
  color: var(--accent-green);
}

.goal-stats .delta.negative {
  color: var(--accent-red);
}

.progress-container {
  margin-bottom: var(--space-2);
}

.progress-bar {
  position: relative;
  height: 8px;
  background: var(--bg-hover);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-green) 0%, var(--accent-teal) 100%);
  transition: width 0.3s ease;
}

.progress-fill.ahead {
  background: linear-gradient(90deg, var(--accent-green) 0%, var(--accent-teal) 100%);
}

.progress-fill.behind {
  background: linear-gradient(90deg, var(--accent-orange) 0%, var(--accent-red) 100%);
}

.progress-target {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--text-muted);
}

.goal-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Chat Panel */
.chat-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 400px;
  height: 100vh;
  background: var(--bg-elevated);
  border-left: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.chat-panel.collapsed {
  width: 48px;
}

.collapse-toggle {
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 64px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-default);
}

.chat-header .avatar {
  width: 40px;
  height: 40px;
  background: var(--accent-green);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
}

.chat-header .status .name {
  font-weight: 600;
  color: var(--text-primary);
}

.chat-header .status .subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.message {
  padding: var(--space-4);
  border-left: 2px solid transparent;
}

.message.user {
  background: var(--bg-hover);
  border-left-color: var(--accent-blue);
}

.message.assistant {
  background: var(--bg-primary);
  border-left-color: var(--accent-green);
}

.message.system {
  background: var(--bg-elevated);
  border-left-color: var(--accent-orange);
  font-style: italic;
}

.message-content {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-content.thinking {
  color: var(--text-muted);
  font-style: italic;
}

.message-timestamp {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: var(--space-2);
}

.quick-actions {
  padding: var(--space-4);
  border-top: 1px solid var(--border-default);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.quick-actions button {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-hover);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}

.quick-actions button:hover {
  background: var(--border-emphasis);
  color: var(--text-primary);
}

.chat-input {
  padding: var(--space-4);
  border-top: 1px solid var(--border-default);
}

.chat-input textarea {
  width: 100%;
  min-height: 60px;
  max-height: 120px;
  padding: var(--space-3);
  background: var(--bg-hover);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
}

.chat-input textarea:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.input-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.voice-button {
  padding: var(--space-3);
  background: var(--accent-purple);
  border: none;
  color: var(--bg-primary);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
}

.voice-button:hover {
  background: var(--accent-blue);
}

.voice-button.listening {
  background: var(--accent-red);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.input-actions button:not(.voice-button) {
  flex: 1;
  padding: var(--space-3);
  background: var(--accent-green);
  border: none;
  color: var(--bg-primary);
  font-weight: 600;
  cursor: pointer;
}

.input-actions button:not(.voice-button):hover {
  background: var(--accent-teal);
}

.input-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading & Error States */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-secondary);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: var(--space-4);
}

.error-state h2 {
  color: var(--text-primary);
}

.error-state p {
  color: var(--text-secondary);
}

.error-state button {
  padding: var(--space-3) var(--space-6);
  background: var(--accent-green);
  border: none;
  color: var(--bg-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
}

.error-state button:hover {
  background: var(--accent-teal);
}

.error-state button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-hover);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-emphasis);
}
```

---

## Part 4: Claude Code Slash Commands

These are the SAME as before - they run via cron OR triggered by the backend:

### .claude/commands/morning-brief.md

```markdown
# Morning Brief Generator

You are generating Michael's daily executive briefing for PersonalOS.

## Files to Read First

- `~/PersonalOS/Memory/identity.md` - Core values and mission
- `~/PersonalOS/Memory/goals.md` - Current goals and percentages
- `~/PersonalOS/Memory/episode_logs/` - Read the 2 most recent logs for continuity
- `~/PersonalOS/Tasks/Active/Unified_Week1_Plan.md` - This week's plan

## Today's Date
{current_date}

## Your Task

Generate a strategic daily briefing in this exact JSON format:

```json
{
  "date": "2025-12-30",
  "generated_at": "2025-12-30T08:30:15Z",
  "overview": "Strategic day with Quarterly Mindmeld at 2pm being the highlight - Dan Mall and Wil Reynolds represent both partnership and relationship value. Morning wide open until 10am coffee with Jigar, then solid 3.5-hour block before Mindmeld for the 3 priority tasks due today.",
  "priorities": [
    {
      "id": 1,
      "task": "Musha Shugyo Launch Content",
      "time_block": "7:00-8:30am",
      "why": "Your 90-day embodiment begins today. The 'Day 1 white belt' angle resonates with your authentic depth principle - you're documenting the journey, not claiming mastery. This IS your Keiko (practice).",
      "duration": "90 minutes",
      "goal_alignment": "Building Shugyo Brand",
      "energy_required": "creative"
    },
    {
      "id": 2,
      "task": "BJJ Training + Content Capture",
      "time_block": "12:00-1:00pm",
      "why": "Six Blades session with modified protocol for cervical recovery. Voice memo any content ideas immediately post-training while insights are fresh. Your injury recovery journey IS content - it demonstrates authentic practice.",
      "duration": "60 minutes",
      "goal_alignment": "Physical Training",
      "energy_required": "physical"
    },
    {
      "id": 3,
      "task": "Evening Reflective Thread",
      "time_block": "8:00-9:00pm",
      "why": "Closes your first day of public Shūgyō practice. Share learnings, not performance. Community replies build the Giri/On (relationship/duty) pillar.",
      "duration": "60 minutes",
      "goal_alignment": "Building Shugyo Brand",
      "energy_required": "reflective"
    }
  ],
  "recommendations": [
    {
      "title": "Use morning block without distraction",
      "description": "Your 7-8:30am window is sacred. No email, no admin, no distractions. Write → Schedule → Engage. This sequence protects your creative energy for afternoon training. The content you create this morning will feel more authentic after training, not before.",
      "confidence": 90,
      "priority": "high"
    },
    {
      "title": "Capture BJJ insights immediately",
      "description": "Voice memos work better than trying to remember later. Your cervical injury recovery journey IS content - it demonstrates the authentic practice you're teaching. Document the modified protocol; it shows mastery of adaptation, not just technique.",
      "confidence": 85,
      "priority": "high"
    }
  ],
  "schedule": {
    "available_blocks": [
      {"start": "07:00", "end": "08:30", "duration": "90min", "type": "deep_work"},
      {"start": "14:00", "end": "17:00", "duration": "3h", "type": "open_time"}
    ],
    "appointments": [
      {"time": "12:00", "title": "BJJ Training", "location": "Six Blades", "duration": "60min"}
    ]
  },
  "goals": [
    {
      "name": "Building Shugyo Brand",
      "current": 60,
      "target": 40,
      "delta": 20,
      "status": "ahead",
      "description": "Three content blocks today all serve brand building. Launch day front-loading is appropriate for Day 1 momentum."
    },
    {
      "name": "Physical Training",
      "current": 25,
      "target": 35,
      "delta": -10,
      "status": "behind",
      "description": "Single BJJ session with modified protocol. Deficit is expected during injury recovery. Return-to-sport ramp will gradually increase this over 4 weeks."
    },
    {
      "name": "Family Presence",
      "current": 15,
      "target": 25,
      "delta": -10,
      "status": "behind",
      "description": "No scheduled family time today. Consider whether evening engagement could involve your daughter - perhaps share what you're building?"
    }
  ],
  "patterns": [
    "Launch day front-loading: All three time blocks serve the same goal. This is strategic for momentum, but unsustainable long-term.",
    "Injury recovery teaches Shūgyō: Your cervical radiculopathy isn't a setback - it's a demonstration of Mushin (presence) and adaptive practice.",
    "Evening energy question: Your most creative work is scheduled for bookends (7am and 8pm). Monitor whether evening block feels forced."
  ]
}
```

## Guidelines

**Overview (2-4 sentences):**
- Synthesize the main character energy of the day
- Mention key meetings and available time blocks
- Reference strategic opportunities or challenges

**Priorities (Extract from weekly plan):**
- Identify today's tasks from Unified_Week1_Plan.md
- Prioritize by: due dates, goal alignment, available time, dependencies
- For each, explain WHY it matters (not just what)
- How it serves broader goals
- What energy/mindset it requires

**Recommendations (Strategic advice):**
- When to do things (timing strategy)
- What to avoid (distractions, overcommitment)
- How to approach (mindset, method)
- Include confidence percentage (how certain are you?)

**Schedule:**
- Extract available time blocks from today
- List appointments with time and location

**Goals (Calculate current progress):**
- Building Shugyo Brand (target 40%)
- Physical Training (target 35%)
- Family Presence (target 25%)
- Base on: completed tasks, scheduled activities, time blocks allocated
- Calculate delta from target
- Status: "ahead", "on_track", or "behind"

**Patterns (2-3 insights):**
- Tasks clustering around a theme
- Time pressure building
- Strategic opportunities
- Conflicts or misalignments
- Reference Shūgyō pillars when relevant

**Tone:** Calm, wise, supportive. Like a trusted advisor who knows Michael deeply.

---

CRITICAL: Save the output JSON to `~/PersonalOS/briefings/$(date +%Y-%m-%d).json`
```

### .claude/commands/end-day.md

```markdown
# End of Day Episode Log Generator

You are generating Michael's episode log from today's activities and conversations.

## Read These Files

- Today's briefing: `~/PersonalOS/briefings/{today}.json`
- Today's chat history (you have access to this session's conversation)
- Completed tasks in `Unified_Week1_Plan.md` (look for ✓ checkmarks)

## Your Task

Generate a structured episode log in this format:

```markdown
# Episode Log: {date}

## What Happened Today

[2-4 sentences summarizing key activities and accomplishments. Include what was completed, what insights emerged, and how the day felt overall.]

## Key Decisions

- [Decision 1 with context - why it matters]
- [Decision 2 with context]
- [Decision 3 if any]

## Tomorrow's Focus

- [Carry-over task or new priority based on today]
- [Adjustment based on today's learnings]
- [Preparation needed]

## Resistance Moments

[If any were captured in chat today]
- [Time] - [Description of resistance and how it was addressed or what insight emerged]

## Insights & Learnings

- [Pattern or realization from today]
- [Strategy that worked or didn't work]
- [Connection to Shūgyō principles if relevant]
```

## Example Output

```markdown
# Episode Log: December 30, 2025

## What Happened Today

Launched Musha Shugyo brand with Day 1 white belt content across three time blocks. Completed morning launch content (3 tweets + engagement), BJJ training with modified protocol went well with no aggravation of cervical issue, and evening reflective thread connected the practice → reflection → teaching cycle authentically. The integrated approach of documenting while doing (not after achieving) felt aligned with Shūgyō principles.

## Key Decisions

- Moved evening content block from 8pm to 7pm to work with energy levels instead of against them - this worked much better
- Used chunking strategy for overwhelming tasks (breaking into 15-min segments) - proved effective for testimony prep equivalent work
- Decided to make injury recovery journey part of content narrative rather than hiding it - authenticity over performance

## Tomorrow's Focus

- New Year's Eve - No heavy lifting, just maintenance content
- Consider family time integration - share building process with daughter?
- Review week 1 plan to adjust time blocks based on today's energy insights

## Resistance Moments

- 11:23am - Felt overwhelmed approaching launch content, kept checking Twitter instead of writing. Used chunking strategy to break into smaller steps. This worked.
- 7:45pm - Evening fatigue hit earlier than expected. Moving content block to 7pm (from 8pm) resolved this going forward.

## Insights & Learnings

- Chunking strategy (15-min focused segments) works remarkably well for creative overwhelm - validated today multiple times
- Documenting practice while doing it (vs after mastery) creates more authentic content and reduces performance pressure
- Evening energy dips consistently around 7:30-8pm - need to front-load creative work or accept lighter work in that window
- Modified training protocol working well - slow progression prevents setbacks better than pushing through
```

---

CRITICAL: Save the output to `~/PersonalOS/Memory/episode_logs/$(date +%Y-%m-%d).md`
```

---

## Part 5: Cron Automation

**Same as before:**

### automation/crontab

```bash
# PersonalOS Automated Workflows

# Morning brief - 8:30am every weekday (Mon-Fri)
30 8 * * 1-5 cd ~/PersonalOS && /usr/local/bin/claude /morning-brief >> logs/morning-brief.log 2>&1

# Optional: Midday check-in - 2:00pm every weekday
# 0 14 * * 1-5 cd ~/PersonalOS && /usr/local/bin/claude /check-in >> logs/check-in.log 2>&1

# Evening reminder - 9:00pm every day
0 21 * * * osascript -e 'display notification "Ready to wrap up? Generate your episode log." with title "PersonalOS"'
```

### automation/setup.sh

```bash
#!/bin/bash

echo "Setting up PersonalOS automation..."

# Create necessary directories
mkdir -p ~/PersonalOS/logs
mkdir -p ~/PersonalOS/briefings
mkdir -p ~/PersonalOS/.claude/commands

# Install cron jobs
crontab ~/PersonalOS/automation/crontab

echo "Cron jobs installed:"
crontab -l

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start backend: cd ~/PersonalOS/backend && npm start"
echo "2. Start frontend: cd ~/PersonalOS/frontend && npm run dev"
echo "3. Open browser: http://localhost:3000"
echo ""
echo "Tomorrow at 8:30am, your morning brief will auto-generate!"
```

---

## Part 6: Installation & Setup

### Step 1: Install Claude Code

```bash
# Install
npm install -g @anthropic/claude-code

# Login with Claude Pro
claude login

# Test
cd ~/PersonalOS
claude chat
# Type: "Hello, can you read Memory/identity.md?"
# Type: exit
```

### Step 2: Set Up Directory Structure

```bash
cd ~/PersonalOS

# Create directories
mkdir -p Memory/episode_logs
mkdir -p Tasks/Active
mkdir -p briefings
mkdir -p .claude/commands
mkdir -p logs

# Create placeholder files if needed
touch Memory/identity.md
touch Memory/goals.md
touch Tasks/Active/Unified_Week1_Plan.md
```

### Step 3: Create Slash Commands

```bash
# Copy the slash command files from Part 4
# morning-brief.md and end-day.md
# into ~/PersonalOS/.claude/commands/
```

### Step 4: Set Up Backend

```bash
cd ~/PersonalOS
mkdir backend
cd backend

# Initialize package.json
npm init -y

# Install dependencies
npm install express cors dotenv
npm install -D nodemon

# Create .env
echo "PORT=3001" > .env
echo "PERSONALOS_PATH=$(cd .. && pwd)" >> .env

# Copy all backend files from Part 2
# server.js, routes/, services/
```

### Step 5: Set Up Frontend

```bash
cd ~/PersonalOS
mkdir frontend

# Create Vite React app
cd frontend
npm create vite@latest . -- --template react

# Install dependencies
npm install date-fns

# Copy all frontend files from Part 3
# src/components/, src/services/, src/styles/
```

### Step 6: Install Cron Automation

```bash
cd ~/PersonalOS/automation
chmod +x setup.sh
./setup.sh
```

### Step 7: Start Everything

```bash
# Terminal 1: Start backend
cd ~/PersonalOS/backend
npm start
# Should see: "PersonalOS backend running on port 3001"

# Terminal 2: Start frontend
cd ~/PersonalOS/frontend
npm run dev
# Should see: "Local: http://localhost:3000"

# Terminal 3: Test morning brief generation
cd ~/PersonalOS
claude /morning-brief

# Open browser
open http://localhost:3000
```

---

## Part 7: How It All Works Together

### Morning Flow (Automated)

```
8:30am → Cron triggers
         ↓
       claude /morning-brief executes
         ↓
       Reads: identity.md, goals.md, episode_logs, weekly plan
         ↓
       Generates JSON briefing
         ↓
       Saves to: briefings/2025-12-30.json
         ↓
       [Done in ~15 seconds, happens in background]
```

### User Opens Dashboard (9:00am)

```
Browser → http://localhost:3000
          ↓
        Vite dev server (frontend)
          ↓
        Dashboard.jsx loads
          ↓
        Calls API: GET /api/briefing/today
          ↓
        Express backend receives request
          ↓
        Reads: briefings/2025-12-30.json
          ↓
        Returns JSON to frontend
          ↓
        React renders dashboard cards
          ↓
        User sees their briefing!
```

### Chat Interaction

```
User types: "What should I focus on first?"
            ↓
          ChatPanel.jsx: sendChatMessage()
            ↓
          POST /api/chat/message
            ↓
          Backend: claude-code.js
            ↓
          spawn('claude', ['chat'])
            ↓
          Claude Code reads PersonalOS files
            ↓
          Generates response
            ↓
          Backend returns response to frontend
            ↓
          ChatPanel displays message
            ↓
          User sees Claude's response in web chat!
```

### End of Day Flow (Manual)

```
9:00pm → Notification appears
         ↓
       User clicks "End Day" button in chat
         ↓
       POST /api/chat/end-day
         ↓
       Backend: executeCommand('/end-day')
         ↓
       Claude Code reads chat history + today's briefing
         ↓
       Generates episode log markdown
         ↓
       Saves to: Memory/episode_logs/2025-12-30.md
         ↓
       Frontend shows confirmation
         ↓
       Tomorrow's brief will read this log for continuity!
```

---

## Part 8: What You Get

✅ **Auto-generated morning briefs** at 8:30am (cron → Claude Code)
✅ **Web dashboard** with strategic insights (React frontend)
✅ **Embedded chat interface** for AI support (no terminal needed)
✅ **Voice input** for quick capture (Web Speech API)
✅ **Quick action buttons** for common queries
✅ **Auto-logging** via `/end-day` command
✅ **Goal tracking** with progress bars
✅ **Pattern detection** and strategic recommendations
✅ **Submission Specialist aesthetic** (pure black, hard edges)
✅ **Zero additional costs** (uses your $20/month Claude Pro)

**This is the full JFDI system as a web application!**

---

## Part 9: Cost & Usage

**Your Claude Pro subscription:** $20/month

**Daily usage estimate:**
- Morning brief: ~2,000 tokens
- Chat messages: ~500-1,000 tokens each
- Episode log: ~1,500 tokens

**Monthly total (rough estimate):**
- 22 briefs: 44,000 tokens
- 220 chat messages (10/day): 110,000-220,000 tokens
- 22 episode logs: 33,000 tokens
- **Total: ~187,000-297,000 tokens/month**

**Claude Pro includes:** Enough usage for moderate daily use
- Best for "light work on small repositories"
- You'll get usage warnings if approaching limits
- Can upgrade to Max ($100 or $200/month) if needed

**Backend/frontend costs:** $0 (runs locally)

---

## Part 10: Troubleshooting

### "Morning brief not generating"

```bash
# Check cron is running
crontab -l

# Check logs
cat ~/PersonalOS/logs/morning-brief.log

# Test manually
cd ~/PersonalOS
claude /morning-brief
```

### "Backend won't start"

```bash
# Check port isn't in use
lsof -i :3001

# Check environment variables
cat ~/PersonalOS/backend/.env

# Check Claude Code is accessible
which claude
```

### "Chat not responding"

```bash
# Check backend is running
curl http://localhost:3001/health

# Check Claude Code works
cd ~/PersonalOS
echo "Hello" | claude chat

# Check backend logs
# Look for errors in the terminal running npm start
```

### "Frontend won't load"

```bash
# Check frontend is running
# Should see "Local: http://localhost:3000" in terminal

# Check API proxy
curl http://localhost:3000/api/briefing/today

# Try clearing Vite cache
cd ~/PersonalOS/frontend
rm -rf node_modules/.vite
npm run dev
```

---

## Conclusion

You now have the complete architecture for recreating JFDI as a web application:

1. ✅ **Claude Code slash commands** - AI workflows triggered by cron or API
2. ✅ **Backend server** - Spawns Claude Code, serves API endpoints
3. ✅ **React frontend** - Dashboard + embedded chat UI
4. ✅ **Cron automation** - Morning brief auto-generates
5. ✅ **Web-based UX** - No terminal interaction needed
6. ✅ **Your aesthetic** - Submission Specialist design system
7. ✅ **Your budget** - $20/month Claude Pro, no additional costs

**The key insight:** JFDI uses Claude Code (not the API), but wraps it in a proper web application with backend/frontend separation. Users never see the terminal - they just open their browser and everything works.

**Ready to build?** Follow the installation steps in Part 6, then open `http://localhost:3000` and your PersonalOS is live!
