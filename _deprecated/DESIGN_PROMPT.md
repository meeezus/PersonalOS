# PersonalOS Dashboard Design Brief - Complete Context

I need help designing a web-based personal operating system dashboard inspired by JFDI (a system built by Linus Lee). I want to recreate the core functionality with my own aesthetic.

## GitHub Repository

I've started building this and the code is on GitHub:
**https://github.com/meeezus/PersonalOS**

You can browse the code to understand what I've built so far.

## What I've Built So Far

### Working Features (v0.1)
- ✅ **Flask backend** serving dashboard on `localhost:3002`
- ✅ **Task parser** that reads `Tasks/Active/Unified_Week1_Plan.md`
  - Parses markdown checkboxes `- [ ]`
  - Extracts tasks by date (case-insensitive, date-only matching)
  - Groups by time blocks (Morning, Noon, Evening, EOD)
- ✅ **AI briefing endpoint** (`/api/briefing`) that:
  - Reads `Memory/identity.md`
  - Reads latest `Memory/episode_logs/*.md`
  - Reads `Tasks/Active/Unified_Week1_Plan.md`
  - Calls Claude via `opencode prompt` command
  - Returns 2-3 sentence personalized briefing
- ✅ **Home page** with 4 sections (matching JFDI structure):
  - Overview (AI briefing + date)
  - Focus & Recommendations (top 3 priorities + AI suggestions)
  - Today's Schedule (time-blocked tasks)
  - Goal Alignment (progress bars with percentages)
- ✅ **Submission Specialist aesthetic** applied (dark theme, my colors)
- ✅ **Tailscale support** for mobile access (iPhone can access via Tailscale IP)

### Key Files to Review
- `Dashboard/server.py` - Flask backend with all API endpoints (lines 48-101: task parser)
- `Dashboard/personalos.html` - Main UI structure + CSS with dark theme
- `Dashboard/personalos.js` - Frontend rendering logic (lines 86-296: home page render)
- `Scripts/start_personalos.sh` - Launch script
- `CLAUDE.md` - Context about who I am and how I work (ADHD patterns, goals)

### Current Issues
- 🐛 **Browser caching** prevents seeing updates (tried `?v=3` cache busting - still not working)
- 🐛 Tasks showing correctly in API but need better time parsing
- 🚧 Checkboxes not interactive yet (just visual circles)
- 🚧 Project cards don't expand to show subtasks
- 🚧 AI briefing falling back to default text (opencode integration needs debugging)
- 🐛 User reports: "still looks the same even after hard refresh"

## Step 1: Analyze JFDI System from YouTube Video

Before redesigning, I need you to understand JFDI by analyzing this YouTube video:

**Video URL:** https://www.youtube.com/watch?v=FM7sU5SW8_Q (Linus Lee's JFDI demo)

**Analysis Method:**
Follow this process based on: https://medium.com/enkrypt-ai/teach-claude-to-watch-youtube-videos-and-take-notes-in-notion-ac8f5491d58e

1. **Get the transcript:**
   - Use `yt-dlp --write-auto-sub --skip-download [VIDEO_URL]`
   - Or `youtube-transcript-api FM7sU5SW8_Q`

2. **Process the transcript:**
   - Extract timestamps for key moments (UI demonstrations, feature explanations)
   - Note when Linus shows specific features
   - Capture his reasoning behind design decisions

3. **Analyze UI elements shown:**
   - Screenshot key frames showing the JFDI interface
   - Document the information hierarchy
   - Note the interaction patterns
   - Observe the data flow

4. **Extract design principles:**
   - What problems is JFDI solving?
   - How does the AI integration work?
   - What makes it effective for executive function support?
   - How does it reduce cognitive load?

**Key Questions to Answer:**
- How does JFDI generate the daily briefing? (I've partially implemented this)
- What files/data does it read for context?
- How are tasks prioritized and surfaced?
- What's the navigation pattern?
- How does the schedule view work?
- What AI prompting strategy does he use?

## Reference Materials in Repo

I have 4 JFDI screenshots in `jfdi_screenshots/`:
- `Untitled 19.png` - Overview section with AI briefing
- `Untitled 20.png` - Today's Schedule, Email
- `Untitled 21.png` - Relationships, Reminders
- `Untitled 22.png` - Goal Alignment with progress bars

## My Aesthetic: Submission Specialist

**Must use ONLY these colors** (not JFDI's colors):

```css
--bg-primary: #050505;          /* Pure black */
--text-primary: #ffffff;
--text-secondary: #a3a3a3;
--text-muted: #525252;
--accent-green: #10b981;
--accent-blue: #3b82f6;
--accent-purple: #8b5cf6;
--accent-teal: #14b8a6;
--accent-orange: #f97316;
--accent-red: #ef4444;
--border: #171717;
--border-subtle: #0a0a0a;
```

**Design Principles:**
- Dark, minimal, focused
- No unnecessary colors or decoration
- Information density over whitespace
- Progress indicators use gradients and color psychology
- Typography: Clean sans-serif, clear hierarchy
- Inspired by fitness tracking apps (data-driven, motivational)

## My Data Structure

### Files the AI reads for context:
```
~/PersonalOS/Memory/identity.md              # Who I am, values, mission
~/PersonalOS/Memory/episode_logs/*.md        # Session history
~/PersonalOS/Tasks/Active/Unified_Week1_Plan.md  # Current weekly plan
```

### Task Structure Example:
```markdown
## MONDAY DEC 30 - MUSHA SHUGYO LAUNCH DAY

### 7:00-8:30am - MUSHA SHUGYO MORNING BLOCK
- [ ] **7:00-7:30am**: Walk + BJJ podcast + voice memo ideas
- [ ] **7:30-8:00am**: Write 3 tweets (use Day 1 white belt angle)
- [ ] **8:00-8:30am**: Schedule in SuperX + engage 10-15 replies

### 12:00-1:00pm - BJJ TRAINING (Six Blades)
- [ ] Capture content ideas during/after training

### 8:00-8:15pm - MUSHA SHUGYO EVENING
- [ ] Post evening reflection tweet
- [ ] Update training log
```

## Current Focus Areas
1. **Musha Shugyo** (BJJ content brand) - Launch Dec 30-Jan 5
2. **DecoponATX** (networking) - 90 email challenge Jan 6-10
3. **Health Coaching** - Client programs ongoing

## What I Need From You

### Phase 1: Analysis (Start Here)
1. **Fetch and analyze the YouTube transcript** of the JFDI demo video
2. **Extract key features, UI patterns, and design decisions**
3. **Document the AI integration approach** (prompting, context files, output format)
4. **Create a feature map** of JFDI's core functionality
5. **Review my GitHub repo** to understand current implementation

### Phase 2: Design Improvements
Based on what you learn from JFDI + what I've already built:

1. **Fix current issues:**
   - Browser caching problem (why isn't `?v=3` working?)
   - How to make checkboxes interactive (update backend state?)
   - Better time block parsing algorithm
   - Debug opencode AI briefing integration

2. **Complete the home page:**
   - Improve Overview section (better AI briefing prompt?)
   - Make Focus & Recommendations more intelligent
   - Enhance Today's Schedule (better time grouping)
   - Add trend indicators to Goal Alignment (▲ 243%, ▼ -25%)

3. **New features from JFDI:**
   - What am I missing that JFDI has?
   - How can I improve the AI integration?
   - What UX patterns should I adopt?
   - How does JFDI handle task completion?

4. **Component library:**
   - Design specs for cards, progress bars, checkboxes, badges
   - Hover states, animations, micro-interactions
   - Mobile-responsive considerations

5. **Implementation guidance:**
   - Specific code changes for Claude Code to execute
   - File paths and line numbers to modify
   - New endpoints or functions needed

## Technical Context

**Backend (Flask):**
- Routes: `/`, `/api/dashboard`, `/api/briefing`, `/api/tasks/today`
- Task parser uses regex and date matching
- AI integration via subprocess calling `opencode prompt`

**Frontend (Vanilla JS):**
- No framework (intentionally lightweight)
- Async/await for API calls
- Dynamic HTML generation via template strings
- Event delegation for interactivity

**Deployment:**
- Runs locally on port 3002
- Tailscale for mobile access (no public hosting)
- File-based storage (no database)

## Success Criteria
- ✅ Functionally equivalent to JFDI (same features, same AI intelligence)
- ✅ Visually matches Submission Specialist (NOT JFDI colors/fonts)
- ✅ All 4 sections working: Overview, Focus, Schedule, Goals
- ✅ Clean, minimal, dark aesthetic
- ✅ Information-dense but scannable
- ✅ Desktop-first, mobile-responsive
- ✅ AI briefing is contextually aware (like JFDI's)
- ✅ Browser cache issues resolved
- ✅ Interactive checkboxes that persist state

## ADHD Context (Important!)

I have ADHD and PersonalOS is designed to support my executive function:
- **Resistance patterns:** I get stuck at execution moments (not planning)
- **Context switching costs are HIGH**
- **Needs immediate logging** (not "later")
- **Voice capture works better than typing**

**The resistance voice says:** "You can't make shit happen"
**PersonalOS's job:** Help me build evidence to the contrary

**Anti-Patterns to Avoid:**
- Don't require elaborate planning
- Don't add friction to quick captures
- Don't lecture or guilt-trip about incomplete tasks
- Don't suggest "proper" usage patterns

## Process
1. **Start by analyzing the JFDI video** using the transcript extraction method
2. **Share your findings** and key observations
3. **Review my GitHub code** to understand current implementation  
4. **Design improvements** based on JFDI insights + my aesthetic requirements
5. **Provide implementation guidance** for Claude Code to build
6. **Iterate** - I'll test and give feedback

## Questions to Answer
After analyzing JFDI and my code:
1. What's causing the browser cache issue?
2. How should I structure the AI prompting for better briefings?
3. What's the best way to handle task state (completion)?
4. Should I add a database or stay file-based?
5. What features from JFDI are most critical to replicate?
6. How can I make the time-blocking more intelligent?

---

**Ready to start? Begin by:**
1. Fetching the JFDI video transcript (https://www.youtube.com/watch?v=FM7sU5SW8_Q)
2. Analyzing Linus's design decisions and feature set
3. Reviewing my code at https://github.com/meeezus/PersonalOS
4. Providing your analysis and recommendations

Let me know what you find!
