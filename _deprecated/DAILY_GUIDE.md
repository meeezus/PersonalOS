# Personal AI System - Daily Guide

## Morning Routine (2 minutes)

### Step 1: Open Terminal
- Press `Cmd+Space`
- Type "Terminal"
- Hit Enter

### Step 2: Start Your Day (ONE COMMAND!)
```bash
go
```

That's it! This automatically:
- ✅ Generates today's mission
- ✅ Loads all memory files (identity, goals, observations, latest episode)
- ✅ Starts OpenCode with full context
- ✅ Asks what you should focus on today

**Zero friction. Just type `go` and execute.**

<details>
<summary>Old way (manual - you don't need this anymore)</summary>

```bash
today  # Generates your daily mission
pos    # Navigate to PersonalOS
opencode  # Start AI
```

Then load memory manually...
</details>

---

## During The Day (30 seconds each)

### Quick Updates

**After sending emails:**
```
Update DecoponATX: sent 15 emails today
```

**Resistance moment:**
```
Log resistance: Voice said "this isn't working" at email 8
```

**New task pops up:**
```
Add task: Follow up with Sarah about proposal. Due Friday.
```

**Meeting happens:**
```
Add to Sarah's contact: Had call today, she wants proposal by Jan 15, budget is $1500
```

**Capture an idea:**
```
Add to content ideas: How ADHD entrepreneurs use AI to reduce context switching
```

---

## Evening Routine (5 minutes)

### Step 1: Review Progress
```
What did I accomplish today?
What's pending for tomorrow?
```

### Step 2: Update Week 1 Tracker (if applicable)
```
Update DecoponATX_Week1 with today's email count
```

### Step 3: Generate Content (if Building in Public)
```
Generate a LinkedIn post from today's execution. Focus on:
- What I committed to
- What resistance showed up
- How I acted anyway
- The evidence I'm building

Save to Content/Posts/Day[X]_LinkedIn.md
```

---

## Common Commands

### Project Management
```
Create a new project: [PROJECT_NAME]
Show me [PROJECT_NAME] status
What's next on [PROJECT_NAME]?
```

### Task Management
```
Show all my active tasks
What's due this week?
Mark [TASK] as done
Move [TASK] to next Monday
```

### Contact/CRM
```
Create contact: [NAME], [ROLE] at [COMPANY]
Add to [NAME]'s file: [INTERACTION_NOTES]
When did I last talk to [NAME]?
```

### Search
```
Find all mentions of [KEYWORD]
Show me everything related to [PROJECT]
```

---

## Resistance Emergency Protocol

When the voice says "This isn't working":

1. **Type this IMMEDIATELY:**
```
Log resistance moment NOW
```

2. **Then do the thing anyway:**
```
Add task: [THE ONE THING I'M AVOIDING]. Due: Today.
```

3. **Watch yourself do it:**
```
Update [TASK]: I did it anyway. The voice was wrong.
```

---

## Daily Shutdown (2 minutes)

### Step 1: Log Today's Episode
```
Create today's episode log in Memory/episode_logs/

Include:
- What I accomplished (emails sent, tasks done, wins)
- Resistance moments (when, what the voice said, how I responded)
- Evidence I'm building (proof I CAN make shit happen)
- Open loops (what's pending for tomorrow)
- Context for next session (where to pick up)
```

**This creates continuity.** Next session, Claude reads this and knows exactly where you left off.

### Step 2: Preview Tomorrow
```
Based on today's episode log, what should I focus on tomorrow?
```

### Step 3: Quit
- Type `exit` or press `Ctrl+D`
- Close terminal

**Your progress is saved.** Next session starts where you left off.

---

## Emergency: When You Forget

**Forgot to log progress?**
```
Show me what happened today based on my files
```

**Forgot what you were working on?**
```
What was I last working on?
```

**Can't remember the command?**
- Just ask naturally
- "How do I add a task?"
- "Show me my projects"
- The AI understands natural language

---

## The Golden Rule

**Type exactly what you're thinking.**

Don't overthink syntax. Don't worry about "correct" commands.

Just talk to your AI like you'd text a friend:
- "Did I follow up with Sarah?"
- "What's on fire today?"
- "I need to remember to call the venue"

The system handles the rest.

---

## Mobile Access - Available Now! 📱

### Quick Mobile Setup (10 minutes)

See **MOBILE_GUIDE.md** for complete setup instructions.

**TL;DR:**
1. Authenticate Tailscale on Mac: `sudo /opt/homebrew/opt/tailscale/bin/tailscaled & && tailscale up`
2. Install Tailscale app on phone
3. Start OpenCode server: `opencode web --port 3000 --hostname 0.0.0.0`
4. Bookmark `http://[your-mac-hostname]:3000` on phone
5. Use PersonalOS from anywhere!

### Mobile Workflow Integration

**Morning (on phone):**
- Open OpenCode bookmark
- Ask: "What should I focus on today?"
- Review tasks while having coffee

**During the day (voice capture):**
- Tap microphone on phone
- "Add task: Email venue about capacity"
- "Log resistance: Voice at email 8"
- "Update DecoponATX: sent 10 emails"

**Post-meeting (immediate capture):**
- "Add to Jane's contact: Wants 30-person workshop, budget $2000, decision by Feb 1"

**Anywhere inspiration strikes:**
- "Add to content ideas: How voice capture beats context switching for ADHD entrepreneurs"

### New Capability: Web Search

Your AI can now search the web!

**Examples:**
```
Search for corporate event venues in Austin
Find team building workshop ideas
Look up pricing for phone case printing services
```

Perfect for research while on the go.

---

## Auto-Start OpenCode Server (Optional)

**Want OpenCode always available?**

Load the auto-start configuration:
```bash
launchctl load ~/Library/LaunchAgents/com.opencode.server.plist
```

Now OpenCode starts automatically when your Mac boots.

**Check if it's running:**
```bash
launchctl list | grep opencode
```

**Stop auto-start:**
```bash
launchctl unload ~/Library/LaunchAgents/com.opencode.server.plist
```
