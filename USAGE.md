# PersonalOS - How to Use

Your PersonalOS is a native Mac app that combines a dashboard with full Claude Code functionality.

## Start PersonalOS

```bash
personalos
```

This will:
1. Start the dashboard server (localhost:3002)
2. Start OpenCode web server (localhost:3001)
3. Launch the native app

## What You'll See

```
┌─────────────────────────────────────────────────┐
│  PERSONALOS                                     │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  Dashboard   │      Claude Code Chat            │
│  Sidebar     │                                  │
│              │  (Full OpenCode Interface)       │
│  • Priority  │                                  │
│  • Week 1    │  • Type messages                 │
│  • Progress  │  • File operations               │
│              │  • Slash commands                │
│              │  • Code execution                │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

## Features

### Dashboard Sidebar (Left)
- **Today's Priority** - From your latest episode log
- **Week 1 Progress** - Email challenge stats (X/90 completed)
- Auto-refreshes every 5 minutes

### Claude Code Chat (Right)
- **Full OpenCode UI** - Same as browser version
- **Uses your subscription** - No API costs!
- **All Claude Code features**:
  - File reading/editing
  - Code execution
  - MCP servers (filesystem, search)
  - Slash commands (when you add them)
  - Conversation history
  - Streaming responses

## Keyboard Shortcuts

- **`Cmd+Shift+P`** - Show/hide PersonalOS from anywhere
- **`Cmd+Q`** - Quit PersonalOS (stops all servers)
- **Click red X** - Hides app (keeps running in background)

## Using Claude Code

Just type in the chat area like you would in the browser:

**Examples:**
- "What's in my DecoponATX_Week1.md file?"
- "Show me all my active tasks"
- "Create a new episode log for today"
- "Help me plan my email outreach"

**File Operations:**
- Claude can read files: "Read Tasks/Active/DecoponATX_Week1.md"
- Claude can edit files: "Add a new email template to my file"
- Claude can create files: "Create a new project folder"

## Cost

**This uses your Claude Code subscription** ($20/month unlimited):
- No per-message API charges
- Unlimited conversations
- Full Claude Code features
- Same as using OpenCode in terminal or browser

## Dashboard Data

The dashboard shows live data from your PersonalOS files:
- Reads `Memory/episode_logs/*.md` for priority
- Reads `Tasks/Active/DecoponATX_Week1.md` for email count
- Updates automatically every 5 minutes

## Stopping PersonalOS

1. **Quit the app**: Press `Cmd+Q`
2. Background servers automatically stop
3. All clean!

Or just hide it with `Cmd+Shift+P` to keep it running in background.

## Troubleshooting

### "Site can't be reached" in chat area

OpenCode server isn't running. Restart PersonalOS:
```bash
killall node python3  # Kill old servers
personalos            # Start fresh
```

### "Error loading priority" in dashboard

Dashboard server isn't running or files missing. Check:
```bash
ls ~/PersonalOS/Memory/episode_logs/
```

### Keyboard shortcut not working

Another app is using `Cmd+Shift+P`. Restart PersonalOS or change the shortcut in `main.js`.

### App won't start

Make sure dependencies are installed:
```bash
cd ~/PersonalOS
npm install
```

## Next Steps

### Add Slash Commands

Create `.opencode/commands/` folder and add custom commands:
```bash
mkdir -p ~/PersonalOS/.opencode/commands
```

Example command (`.opencode/commands/priority.md`):
```markdown
# /priority - Show today's priority

Read Memory/episode_logs/ and show today's priority.
```

Then type `/priority` in chat!

### Add More Dashboard Cards

Edit `Dashboard/unified.html` to add more data cards in the sidebar.

### Mobile Access

The dashboard API is accessible via Tailscale:
- http://michaels-macbook-pro:3002/api/dashboard

You could build a mobile app that reads this endpoint!

---

**Quick Reference:**
- **Start**: `personalos`
- **Show/Hide**: `Cmd+Shift+P`
- **Quit**: `Cmd+Q`
- **Uses**: Claude Code subscription (unlimited)
