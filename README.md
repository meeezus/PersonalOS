# PersonalOS

A web-based personal operating system inspired by JFDI, designed for executive function support with ADHD-friendly workflows.

## What is PersonalOS?

PersonalOS is an AI-powered dashboard that helps you stay focused and execute on your goals. It combines:
- **AI-generated daily briefings** that read your context files
- **Smart task prioritization** from your unified weekly plan
- **Time-blocked schedules** for focused execution
- **Goal alignment tracking** with progress visualization

## Current State (v0.1 - In Development)

### What Works
- ✅ Flask backend serving on `localhost:3002`
- ✅ Task parser reading from `Tasks/Active/Unified_Week1_Plan.md`
- ✅ AI briefing endpoint (integrates with Claude via `opencode prompt`)
- ✅ Home page with 4 sections: Overview, Focus, Schedule, Goals
- ✅ Tailscale support for mobile access
- ✅ Submission Specialist dark aesthetic (#050505 background)

### What's Being Built
- 🚧 Full JFDI feature parity (see design goals below)
- 🚧 Interactive checkboxes for task completion
- 🚧 Project cards with expandable subtasks
- 🚧 Better AI context integration
- 🚧 Mobile-responsive design

## Tech Stack

**Backend:**
- Python 3 + Flask
- Task parsing from markdown files
- Claude AI integration via OpenCode

**Frontend:**
- Vanilla JavaScript (no framework overhead)
- CSS with Submission Specialist color palette
- Async/await for API calls

**Infrastructure:**
- Local-first (runs on `localhost:3002`)
- Tailscale for remote access from iPhone
- File-based data storage (no database)

## Quick Start

### Prerequisites
- Python 3.x
- OpenCode CLI (`opencode` command available)
- Tailscale (optional, for mobile access)

### Installation

1. Clone this repo
2. Start the server: `./Scripts/start_personalos.sh`
3. Open: `http://localhost:3002`

## File Structure

```
PersonalOS/
├── Dashboard/
│   ├── server.py              # Flask backend
│   ├── personalos.html        # Main UI
│   └── personalos.js          # Frontend logic
├── Memory/
│   ├── identity.md            # Who you are
│   ├── goals.md              # Current objectives
│   └── episode_logs/         # Session history
├── Tasks/
│   └── Active/
│       └── Unified_Week1_Plan.md  # Time-blocked weekly plan
└── Scripts/
    └── start_personalos.sh   # Launch script
```

## Design Inspiration: JFDI

PersonalOS is heavily inspired by [JFDI](https://thesephist.com/posts/jfdi/) by Linus Lee.

**Key Difference:** Uses Submission Specialist aesthetic (dark, minimal) instead of JFDI's lighter design.

## Aesthetic: Submission Specialist

```css
--bg-primary: #050505;
--text-primary: #ffffff;
--accent-green: #10b981;
--accent-blue: #3b82f6;
--border: #171717;
```

## API Endpoints

- `GET /` - Main dashboard
- `GET /api/dashboard` - Dashboard data
- `GET /api/briefing` - AI-generated daily briefing
- `GET /api/tasks/today` - Today's tasks from Unified plan

## License

MIT
