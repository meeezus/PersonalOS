# PersonalOS Complete Technical Analysis
**Based on Andy Timeline: 89 Days of Building an AI Executive Assistant**

**Analyzed:** December 29, 2025
**Source:** andy-timeline repository (Days 0-89, Oct 8 - Dec 29, 2025)

---

## 1. TECH STACK

### Backend Framework
- **Laravel (PHP)** - Web application framework
  - **Why:** Mature ecosystem, excellent ORM (Eloquent), built-in authentication (Sanctum)
  - **Database:** PostgreSQL (production-grade)
  - **Key Features Used:**
    - Laravel Sanctum for API token authentication (Day 74)
    - Eloquent ORM with polymorphic relationships
    - Inertia.js for SPA-style routing
    - Job scheduling with Bree (27 scheduled jobs by Day 83)

### Frontend Stack
- **React** with TypeScript
- **Inertia.js** - React SPA without API complexity
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **MDXEditor** - Rich text editing for project descriptions (Day 69)
- **Streamdown** - Streaming markdown renderer for chat (Day 84)

### Database & Schema
- **PostgreSQL** - Primary database
  - Boolean type gotchas documented (Day 63)
  - JSON casts for model_tokens tracking (Day 81)
  - Full-text search capability (pg_textsearch) (Day 79)

### MCP Servers (Model Context Protocol)
**Integrations added progressively:**
- Gmail (Day 0) → OAuth migration to credential system (Day 76)
- Google Calendar (Day 0) → OAuth migration (Day 76)
- Discord (Day 0)
- iMessage (Week 2)
- Google Docs (Day 76)
- Twitter API (Day 87)
- Playwright → Replaced by dev-browser (Day 77)
- Knowledge-search MCP (Day 68, replaced osgrep)
- Tally (Day 80)

### AI/ML Integration
- **Anthropic Claude API** (via Claude Code)
  - Model Selection by Task:
    - **Opus:** Strategic synthesis, workflow optimization, audit quality review
    - **Sonnet:** Most agents, pattern matching, structured extraction
    - **Haiku:** Email scanning, link healing, lightweight tasks
  - Token usage tracking per model (Day 81)
  - Cost optimization through model targeting (Day 88)

### Authentication & Security
- **Laravel Sanctum** (Day 74) - SPA authentication
- **Credential System:**
  - Encrypted credentials with team-scoped keys (Day 81)
  - Migration from Infisical → Andy Core native system (Days 76-81)
  - Is_system flag for app-only secrets
  - Per-user credentials via ANDY_USER_ID env var (Day 82)
- **Credential Scanning System** (Day 74)
  - Quick/deep scan modes
  - Automated scrubbing

### Hosting & Infrastructure
- **DigitalOcean** - Primary hosting
  - Dropbox - Backup sync
  - DO Spaces - Tiered backup retention, Claude session archives (Day 67)
  - Caddy - Reverse proxy with automatic HTTPS
  - Podman - Container orchestration
  - PM2 - Process management
- **Tailscale** - Private network for remote services
  - Mac Mini & Mac Studio for remote browser automation (Day 77)
- **Cloudflare Tunnel** - Public dev server access (Day 80)
- **Synology NAS** - Infrastructure documentation (Day 84)

### Key Libraries & Tools
- **TypeScript** - Strongly-typed agent logic
- **Bun** - Fast TypeScript runtime for skills
- **Handlebars** - Template engine for consistent formatting
- **Playwright** → **dev-browser** - Browser automation
- **Discord.js** - Bot integration
- **ParaSpecch** - Meeting recording workflow (Day 33)
- **MDX** - Rich markdown with components
- **twitter-api-v2** - Twitter integration (Day 87)

---

## 2. ARCHITECTURE PATTERNS

### Agent System
**Evolution: Markdown → TypeScript → Agent Registry**

**Agent Structure (Final Pattern):**
```yaml
---
name: agent-name
type: "Evaluator-Optimizer" | "Executor" | "Synthesizer"
model: "opus" | "sonnet" | "haiku"
department: "Executive | Operations | Research | Content Lab | Training | System"
last_updated: "YYYY-MM-DD"
---

# Agent Name

**Purpose:** What this agent does

## Workflows
- Trigger conditions
- Process steps
- Output format

## Autonomy Boundaries
- Can do without asking
- Must ask before doing
- Never do
```

**Agent Departments (Day 9):**
1. **Executive:** Strategic Advisor, Workflow Advisor
2. **Operations:** Project Manager, Relationship Manager, Email Manager, Calendar Coordinator
3. **Research:** Knowledge Keeper → file-this skill (Day 86), Person Researcher, Topic Researcher
4. **Content Lab:** Mining Coordinator, Quote Miner, Framework Miner, Story Miner
5. **Training:** Style Guide Trainer
6. **System:** Link Healer, Timeline Curator, Gardener, Audit Quality Reviewer

**Key Agent Patterns:**

**Subagents for Context Efficiency:**
- sent-email-scanner (Day 62) - Haiku scanner for relationship-refresh
- Pattern: Lightweight Haiku agent scans → spawns full Sonnet agents only when needed

**Confidence-Based Autonomous Agents (Day 10):**
```javascript
// filter-manager agent
confidence_levels = {
  "95-100%": "auto-filter, log only",
  "80-94%": "auto-filter, log only",
  "60-79%": "auto-filter, tag for review",
  "40-59%": "don't filter, ask in thread",
  "0-39%": "skip entirely"
}
```

**Synthesis Intelligence Agents (Day 55):**
- **pattern-miner:** Extract teachable patterns from audit trails
- **goal-alignment-corrector:** Detect misalignment, generate correction tasks
- **relationship-warming-detector:** Proactive relationship health monitoring

**Agent Migration from Inline Prompts (Day 88):**
- /overview command refactored from inline prompts → 3 registered agents
- Pattern: Extract → Create agent file → Add to registry → Validate quality

### Skills System (Week 5 Breakthrough)

**The Problem:** 109 bash scripts accumulated, unclear which were for agents vs humans

**The Solution:** TypeScript-based skills with standardized interface

**Skill Structure:**
```typescript
// SKILL.md documentation
---
name: skill-name
description: What this skill does
trigger_phrases: ["phrase1", "phrase2"]
related_skills: ["other-skill"]
---

// TypeScript implementation (Bun runtime)
export interface SkillOutput {
  success: boolean;
  data: any; // Structured JSON
  error?: string;
}
```

**Key Skills Created:**
- **API Skills:** projects-api, events-api, tasks-api, phases-api, streams-api (workstreams)
- **Tools:** workspace-tools, contact-tools, link-tools, discord-tools, luma-tools
- **Search:** sessions-api (Day 87) - Search Claude session transcripts
- **Browser:** remote-browser, webapp-testing
- **Media:** transcribe-media (speaker diarization), ipostal-releases
- **Content:** file-this, decision-review, frontend-design
- **Infrastructure:** skill-creator (meta-skill), make-it-fast, gradient-peek

**Skills vs Scripts Decision Matrix:**
```
Agent-consumable? → Skill (TypeScript + JSON output)
Human-run only? → Script (Bash)
```

**Production Validation Pattern (Day 52):**
1. Convert script to skill
2. Run in parallel for 1+ days
3. Validate outputs match
4. Archive old script

### MCP Server Integration

**Pattern: Wrapper Scripts for Auth + Context**
```bash
#!/bin/bash
# gmail-mcp-wrapper.sh
export ANDY_USER_ID="${ANDY_USER_ID:-1}"
GOOGLE_OAUTH_TOKEN=$(get-credential.ts google-oauth-token --user-id $ANDY_USER_ID)
export GOOGLE_OAUTH_TOKEN
exec npx -y @modelcontextprotocol/server-gmail "$@"
```

**Key Features:**
- User-scoped credentials (Day 82)
- CPU watchdog attempted but broke stdio (Day 83 - reverted)
- Auto-restart via watchdog job (Day 83)
- Metadata tracking (first added, last modified) (Day 80)

### Job Queue System

**Bree Scheduler** - 27 scheduled jobs by Day 83

**Job Categories:**

**Daily Jobs:**
- `relationship-refresh.cjs` - 8am ET daily (sent email sync)
- `timeline-weekly-update.cjs` - Sunday 11pm ET
- `daily-reflection-prompt.cjs` - 4pm ET (rotating questions)
- `iMessage-sync.cjs` - Text message sync with Haiku assessment (Day 82)
- `cleanup-claude-sessions.cjs` - Old session cleanup

**Weekly Jobs:**
- `timeline-monthly-synthesis.cjs` - First Sunday 11:30pm ET
- `audit-quality-review.cjs` - Weekly agent quality checks (Day 43)
- `archive-claude-sessions.cjs` - Weekly archive to DO Spaces (Day 67)
- `include-usage-reports.cjs` - Track include file usage (Day 66)
- `podman-cleanup.cjs` - Container maintenance (Day 83)
- `remind-sweep.cjs` - Archive completed reminders (Day 27)
- `gather-member-highlights.cjs` - Newsletter content from Discord (Day 72)

**Health Monitoring Jobs:**
- `mcp-watchdog.cjs` - MCP server health checks (Day 83)
- `documentation-health.cjs` - Self-fixing validation (Day 32)

**Pattern: Headless Claude Code Execution**
```javascript
// relationship-refresh.cjs
const { exec } = require('child_process');
exec('claude --headless --dangerously-skip-permissions /relationship-refresh',
  (error, stdout, stderr) => {
    // Handle results, post to Discord
  }
);
```

### File Storage Approach

**Hybrid: Files for Content, Database for Metadata**

**File-Based:**
- Person files: `/personal-data/relationships/*.md` (flattened Day 69)
- Knowledge library: `/knowledge-library/` (6-folder reorganization Day 74)
- Meeting notes: `/personal-data/meetings/`
- Projects (initially): `/personal-data/projects/` → Migrated to database
- SOPs: `/sops/`
- Agent definitions: `/.claude/agents/`
- Slash commands: `/.claude/commands/`

**Database-Backed (API-First Architecture - Week 7):**
- Projects (with tasks, phases, workstreams)
- Events (with people, outcomes, agreements)
- Tasks (with due dates, descriptions, people)
- Reminders
- Priorities
- Credentials (encrypted)
- Claude sessions (with token tracking)
- Memories (semantic search)

**Migration Pattern (Events example - Days 66-67):**
```
Phase 1: People linking and outcomes tracking
Phase 2: Project people endpoints, Cursor data linking
Phase 2.5: Event planning data display in calendar UI
Phase 3: Event project templates and slash commands
Phase 4-5: Agreement field migration, template cleanup
```

### Database Schema

**Core Tables:**

**Projects System:**
```sql
projects
  - id, name, description, altitude (life/sky/ground)
  - status (active/completed/archived)
  - deadline, agreement, source_path
  - created_at, updated_at

tasks
  - id, project_id, phase_id
  - title, description, due_date, completed_at
  - sort_order, created_at, updated_at

phases
  - id, project_id
  - name, sort_order
  - created_at, updated_at

workstreams (renamed from "streams" Day 65)
  - id, project_id
  - name (cross-cutting themes like Marketing, Agents)
  - created_at, updated_at
```

**Events System:**
```sql
events
  - id, title, description
  - start_datetime, end_datetime
  - setup_time, breakdown_time
  - location, status
  - created_at, updated_at

event_project (polymorphic)
  - event_id, eventable_type, eventable_id
  - Links events to projects
```

**Polymorphic Relationships:**
```sql
personables
  - id, person_id
  - personable_type, personable_id
  - Links people to projects, events, tasks

notes (polymorphic)
  - id, notable_type, notable_id
  - content, created_at, updated_at
```

**Credentials System (Day 74-81):**
```sql
credentials
  - id, team_id, user_id
  - key, encrypted_value
  - is_system (app-only secrets)
  - created_at, updated_at

teams
  - id, name
  - encryption_key (team-scoped)
  - created_at, updated_at
```

**Claude Sessions & Memory:**
```sql
claude_sessions
  - id, user_id, title
  - search_query (Memory Lane context)
  - input_tokens, output_tokens
  - model_tokens (JSON cast - per-model tracking)
  - created_at, updated_at

memories
  - id, session_id
  - content, embedding (vector)
  - memory_type (fact/insight/preference/protocol)
  - recall_count
  - feedback_score (graduated penalty)
  - created_at, updated_at
```

**iMessage Inbox (Day 82):**
```sql
imessage_threads
  - id, chat_id, phone_number
  - contact_name, latest_message
  - latest_message_date
  - needs_reply, snoozed_until
  - assessment_summary (Haiku AI triage)
  - status (pending/replied/snoozed/dismissed)
  - created_at, updated_at
```

**People:**
```sql
people
  - id, name, email, phone
  - file_path (source markdown file)
  - freshness (hot/warm/cold)
  - date_met, last_contact
  - created_at, updated_at
```

---

## 3. BUILD ORDER

### Phase 1: Foundation (Days 0-5)
**Goal: Operational system with agent architecture**

1. **Start with Integrations First (Day 0)**
   - Gmail MCP
   - Google Calendar MCP
   - Discord MCP
   - These shape everything else

2. **Create Basic Agent Structure (Days 0-3)**
   - Start with markdown instructions
   - 6 core agents: Strategic Advisor, Email Manager, Task Orchestrator, Calendar Coordinator, Knowledge Keeper, Relationship Manager
   - Learn what works through real usage

3. **Process Real Data Early (Day 1)**
   - 221 Blinq contacts gave immediate feedback
   - Manual processing sessions reveal validation rules
   - Document patterns on 3rd repetition ("Rule of Three")

4. **Build TypeScript Bridge (Day 4)**
   - Rewrite Python bridge for better control
   - Subagent threading
   - Progress indicators
   - 8 hours to rebuild > weeks of patches

5. **Context Optimization (Days 3-5)**
   - Modular architecture
   - Just-in-time loading
   - 76% reduction (23KB → 5.5KB)

### Phase 2: Production Maturation (Days 6-32)
**Goal: Reliable automation with data quality**

6. **Sent Email Sync (Days 19-22)**
   - Automated relationship refresh
   - Quick mode vs full mode pattern
   - Batch processing
   - Daily cadence

7. **Schema Validation (Day 23)**
   - YAML frontmatter enforcement
   - Catch errors before they multiply
   - 21 files fixed early prevents 500+ later

8. **Newsletter System (Days 12-30)**
   - HTML templates
   - Luma iCal integration
   - Enrichment strategies (bookend: first 5 + last 5)
   - 68% relevance improvement

9. **Link Healing (Days 13-18, ongoing)**
   - Automated link repair
   - 186 broken links fixed
   - Nightly jobs prevent rot

10. **Self-Healing Infrastructure (Day 31)**
    - Documentation auto-fix
    - Health checks → automatic repairs
    - Prevents maintenance debt

### Phase 3: Intelligence Systems (Days 33-54)
**Goal: Meta-learning and pattern extraction**

11. **Timeline Automation (Day 39)**
    - 3-tier system: weekly auto-updates, monthly synthesis, quarterly manual review
    - System documents its own growth

12. **Meeting Workflows (Days 19, 33, 41)**
    - Pre-meeting prep (24h before)
    - Action item extraction
    - Reminder vs Task decision logic
    - Immediate next-meeting prep

13. **Synthesis Intelligence (Day 55)**
    - pattern-miner agent
    - goal-alignment-corrector
    - relationship-warming-detector
    - Audit trails → strategic recommendations

14. **Skills Infrastructure (Days 51-53)**
    - Systematic scripts cleanup (109 → 84)
    - TypeScript skills pattern
    - Production validation discipline
    - 37 scripts archived in one day

### Phase 4: Production Interface (Days 55-68)
**Goal: Polished UI with voice input and Memory Lane**

15. **Chat UI Features (Day 57 - 90+ commits)**
    - Sparkfile quick capture
    - Image/file upload (iOS Safari compatibility)
    - Fuzzy slash command suggestions
    - Usage-weighted prioritization
    - Collapsible pasted text
    - Auto-copy resume prompts

16. **API-First Architecture (Days 62-63)**
    - Projects API
    - Events API
    - Tasks API
    - Phases API
    - Workstreams API
    - Template pattern for all API skills

17. **Voice Input (Day 63)**
    - Two modes: tap for manual, long-press for auto-stop
    - Safari audio format compatibility
    - Mobile use case unlock

18. **Memory Lane (Day 80)**
    - Semantic memory search
    - "Surfaced because..." context
    - Recall count tracking
    - Feedback scoring

19. **Host-Bridge Service Extraction (Day 80)**
    - 1 monolith → 6 focused services
    - Order by risk: health → job → claude → entity → memory
    - Embedding cache for performance

### Phase 5: Security & Multi-User (Days 69-82)
**Goal: Production-ready security and multi-tenant foundation**

20. **Laravel Sanctum (Day 74)**
    - API token authentication
    - Session-based SPA auth
    - CSRF protection

21. **Credential System (Days 74-81)**
    - Encrypted credentials
    - Team-scoped encryption keys
    - Per-user via ANDY_USER_ID
    - Infisical migration complete

22. **Credential Scanning (Day 74)**
    - Smart scanning (quick/deep modes)
    - Automated scrubbing
    - Proactive monitoring

23. **Push Notifications (Day 74)**
    - Web push MVP
    - Reminder notifications
    - iOS PWA support
    - Transforms from "app I check" → "assistant that reaches out"

24. **Light Mode (Day 73)**
    - CSS variable fixes (hours after dark-mode-first)
    - Test both modes early lesson

25. **iMessage Inbox Triage (Day 82)**
    - Sync → Assess → Triage → Act pattern
    - Done/Snooze/Reply actions
    - AI summaries
    - Email workflow parity

### Phase 6: Intelligence & Refactoring (Days 83-89)
**Goal: Agent architecture cleanup and proactive systems**

26. **Auto-Suggest Buttons (Day 86)**
    - Clickable response buttons
    - Purple loading indicators
    - Session persistence
    - Friction reduction

27. **Sessions API (Day 87)**
    - Search Claude session transcripts
    - Historical context lookup
    - Institutional memory

28. **Twitter API Integration (Day 87)**
    - Rate limit awareness (100 reads/month)
    - Default to 1 tweet queries
    - Cost visibility

29. **/Overview Agent Migration (Day 88)**
    - Inline prompts → Registered agents
    - Knowledge Scanner, Inbox Coordinator, Calendar Coordinator extracted
    - Quality validation all passing

30. **Date Night Planning (Day 87)**
    - Proactive date cadence tracking
    - Restaurant tracking from Google Maps
    - In-progress awareness (don't nag during active planning)

### Phase 7: Open Source Prep (Days 88-89)
**Goal: Documentation and reproducibility**

31. **Open Source Preparation Plan (Day 88)**
    - /interview command for plan deep-dives
    - System documentation
    - Pattern extraction

32. **Protocol Memory Type (Day 89)**
    - Always-loaded operational rules
    - System-critical information category

---

## 4. KEY LESSONS

### What Worked Well

**1. Start with Integrations (Day 0)**
- Gmail, Calendar, Discord added immediately
- Shaped all subsequent decisions
- Real data from day one

**2. Process Real Data Early (Days 1-2)**
- 221 contacts revealed bottlenecks
- Manual sessions found validation rules
- Quality > speed for initial understanding

**3. Rebuild When Faster Than Patching (Day 4)**
- TypeScript bridge: 8 hours to rebuild vs weeks of tmux workarounds
- Clear requirements make rebuilds fast

**4. Validation Rules from Manual Work (Day 2)**
- 26 manual file updates → comprehensive validation rules
- Every formatting issue became automated check
- Prevented 100+ future errors

**5. Quick Mode Unlocks Daily Automation (Day 24)**
- Person research: 30-60s full mode → 3-5s quick mode = 90% faster
- Daily cadence only possible with fast path
- Two-speed design: thorough for deep work, fast for maintenance

**6. Batch Processing Sweet Spot (Day 26)**
- 110s sequential → 15s parallel (86% faster)
- Simpler than full parallel, faster than sequential
- Configurable batch size (default: 10)

**7. Enrichment Has Exponential Returns (Day 29)**
- Newsletter: Full message bodies vs snippets = 68% relevance improvement
- Bookend strategy (first 5 + last 5) = 90% signal without fetching all
- Find minimum enrichment for maximum signal

**8. Self-Healing Prevents Entropy (Day 31)**
- Documentation health → auto-fix, not just report
- Link healing nightly
- Problems don't accumulate

**9. Context Awareness → Intelligence (Day 28)**
- EOD reading sent emails before recommendations
- "You spent all day in reactive mode" vs generic suggestions
- Context transforms automation into intelligence

**10. Confidence Scoring Enables Autonomy (Day 10)**
- 0-100% confidence with 5 action levels
- Binary yes/no requires human intervention
- Transparency builds trust

**11. Skills Unlocked Agent Reliability (Day 52)**
- Structured JSON output → agents parse correctly
- TypeScript types → compile-time errors
- Link-healer: "runs most of the time" → "runs reliably every time"

**12. Memory Needs Context (Day 80)**
- "Surfaced because..." explanations made memories actionable
- Memory without context is just data
- Recall count tracking shows usage patterns

**13. Push Notifications Changed Mobile UX (Day 74)**
- "App I check" → "Assistant that reaches out"
- Proactive nudges made PWA feel alive
- Reminders ping you, not you checking reminders

**14. Auto-Suggest Buttons Reduced Friction (Day 86)**
- Small friction multiplies across interactions
- Buttons make assistant feel anticipatory
- What seemed like polish became defining UX characteristic

**15. Session Transcripts as Institutional Memory (Day 87)**
- Sessions-api unlocked "what did we discuss about X last week"
- Searchable by keyword, date range, files touched
- Context accumulates across sessions

### What Needed Refactoring

**1. Orbit/Tag Mixing (Day 56)**
- Cost: 7-phase migration to separate
- Fix: Orbits for distance, tags for topics
- Lesson: Taxonomies need clear single-purpose categories from start

**2. Dark-Mode-First Development (Day 73)**
- Cost: Hours of CSS variable fixes for light mode
- Fix: Systematic color definition audit
- Lesson: Test both modes early, not as afterthought

**3. Link Tracking After Reorganization (Days 13-18)**
- Cost: 186 broken links, 6 days of fixing
- Fix: Link healer agent automated cleanup
- Lesson: Track links BEFORE moving files

**4. Schema Validation After 200+ Files (Day 23)**
- Cost: 21 files with errors, manual date research
- Fix: Validation in person-researcher agent
- Lesson: Validation should be part of creation, not inspection

**5. Over-Aggressive Automation Cadence (Day 22)**
- Cost: 4x daily relationship-refresh flooded Discord
- Fix: Once daily at 8am ET
- Lesson: Start conservative, increase gradually based on value

**6. Documentation Reorganization Without Link Tracking (Days 11-18)**
- Cost: 186 broken links across 6 days
- Fix: Link healer agent + nightly jobs
- Lesson: Major refactors need link integrity checks upfront

**7. Event System Migration Complexity (Days 66-67)**
- Cost: 5 phases to migrate file-based → database
- Fix: Phased migration with validation between each
- Lesson: Major migrations need explicit phases

**8. MCP CPU Watchdog Breaking stdio (Day 83)**
- Cost: Added watchdog, immediately reverted
- Fix: Don't add middleware that buffers/delays stdio
- Lesson: MCP stdio communication is fragile

**9. Twitter API Rate Limits (Day 87)**
- Cost: Only 100 reads/month on free tier
- Fix: Rate limit warnings, default 1 tweet, cost visibility
- Lesson: Always check API pricing/limits before integrating

**10. Knowledge Library Phase 1 Data Loss (Day 74)**
- Cost: Content lost during frontmatter migration
- Fix: Restore commit + schema as single source of truth
- Lesson: Data migrations need rollback capability

### Patterns to Follow

**1. "Rule of Three" Documentation (Day 1)**
- First time: experiment
- Second time: refine
- Third time: document
- Prevents premature optimization

**2. Manual Sessions Find Edge Cases (Day 2)**
- Process 20-30 items manually before automating
- Discovers requirements you didn't know existed
- Day 10: 26 manual files → comprehensive validation

**3. Deterministic > Smart (Day 3)**
- TypeScript + templates beats 600-line markdown instructions
- Validation rules enforce quality
- Predictable execution every time

**4. Context Is Finite Resource (Day 5)**
- Load just-in-time, not all at once
- Modular architecture: 76% → 85% reduction (Day 5 → Day 11)
- Review and optimize periodically

**5. Match Models to Work Type (Day 9)**
- Opus: strategic synthesis, quality judgment
- Sonnet: pattern matching, structured extraction
- Haiku: scanning, lightweight tasks
- Cost vs quality based on task, not frequency

**6. Two-Speed Design (Day 24)**
- Full mode: thorough research (30-60s)
- Quick mode: maintenance updates (3-5s)
- Fast path enables daily automation

**7. Batch Processing Balance (Day 26)**
- Sequential: simple but slow
- Parallel: fast but complex
- Batch: 80% parallel speed, 20% sequential complexity

**8. Order Extractions by Risk (Day 80)**
- Host-bridge: health → job → claude → entity → memory
- Build confidence with easy wins
- Save hardest for last when pattern is proven

**9. Proactive Systems Must Know When to Stay Quiet (Day 87)**
- Date night planning: track in_progress to avoid nagging
- Background jobs respect manual overrides (Day 82)
- Users are source of truth

**10. Agent Architecture for Sustainability (Day 88)**
- Inline prompts: expedient but brittle
- Agents: own file, tests, reusable across commands
- Migration pattern: extract → create file → registry → validate

**11. Production Validation Period (Day 52)**
- New skill runs parallel with old script
- Validate for 1+ days
- Don't delete old code until new is proven
- Patience prevents production breakage

**12. Schema as Single Source of Truth (Day 74)**
- Frontmatter schema prevents drift
- Knowledge library: standardize first, then reorganize
- Data integrity checks at each migration phase

**13. Usage Frequency Analysis Before Optimization (Day 11)**
- 14 DAILY commands got targeted improvements
- 5 RARELY commands left alone
- 2 ONE-TIME commands archived
- Let data guide work, not assumptions

**14. Test Mobile Early (Day 57)**
- iOS Safari upload complexity discovered late
- Immediate upload vs deferred approach needed
- Mobile isn't desktop with small screen

**15. Scheduled Optimization Reviews (Day 66)**
- Context cleanup isn't one-time
- Token optimization found low-hanging fruit (3 include consolidations)
- Context bloat invisible until you look

### Patterns to Avoid

**1. Parallel Processing Without Deduplication (Day 1)**
- Cost: 2 hours manual cleanup
- Race conditions cause duplicates
- Always dedupe before committing

**2. Building Agents in Markdown (Days 2-4)**
- 600+ lines of instructions
- Inconsistent execution
- Validation failures
- Use TypeScript + templates instead

**3. Loading All Context Upfront (Days 3-5)**
- Slow sessions, token limits
- 23KB → 5.5KB through modularization
- Load on demand, not eagerly

**4. Accepting Third-Party Tools As-Is (Days 1-4)**
- Python bridge workarounds
- Brittle tmux scripts
- Fork and customize heavily, or rebuild

**5. Ignoring Usage Patterns (Days 6-10)**
- Optimizing rarely-used features
- Missing high-value improvements
- Usage frequency analysis before work

**6. Not Documenting Early Enough (Day 1)**
- Repeated questions, unclear workflows
- "Rule of Three" - document after 3rd use
- SOPs prevent knowledge loss

**7. Over-Engineering Before Validation (Days 2-5)**
- Build simple first
- Get real usage feedback
- Optimize after patterns emerge

**8. Mixing Classification Dimensions (Day 56)**
- Orbits mixed distance + topics
- 7-phase migration to separate
- Taxonomies need clear single purposes

**9. Dark-Mode-First Without Light Mode Testing (Day 73)**
- CSS variables only for dark
- Hours of fixes for light mode
- Test both modes from start

**10. Data Migrations Without Rollback (Day 74)**
- Knowledge library Phase 1 lost content
- Need integrity checks + restore capability
- Treat migrations as risky operations

**11. Binary Yes/No for Automation (Day 10)**
- Requires constant human intervention
- Confidence scoring (0-100%) with thresholds enables autonomy
- Transparency builds trust

**12. Streaming Without Special Handling (Day 81)**
- Token double-counting until fixed
- Streaming chunks != batch data
- Different shapes need different logic

**13. Middleware on MCP stdio (Day 83)**
- CPU watchdog broke communication
- stdio is fragile, don't buffer/delay
- Keep MCP wrappers minimal

**14. Free Tier APIs Without Checking Limits (Day 87)**
- Twitter: only 100 reads/month
- Cost discovery after integration
- Check pricing/limits upfront

**15. Background Jobs Overwriting Manual Changes (Day 82)**
- iMessage sync overwrote status changes
- Jobs must preserve user edits
- Add logic to respect manual overrides

### Common Mistakes

**1. Optimization Too Early (Days 1-5)**
- Spent time on performance before understanding patterns
- Better: manual sessions first, optimize after 3+ uses
- Premature optimization wastes effort

**2. Skipping Manual Validation Sessions (Days 2, 10)**
- 26 manual file edits revealed validation rules
- 21 schema errors found through systematic review
- Manual work finds requirements automation wouldn't

**3. Not Testing Edge Cases (Days 70, 85)**
- MDX editor: 5 commits for "false unsaved" indicator
- Server restart prompts: 3 fixes for false positives
- Edge cases compound into bad UX

**4. Assuming Consistency (Day 81)**
- Streaming data has different shape than batch
- Boolean types differ PostgreSQL vs MySQL
- Test assumptions, don't assume uniformity

**5. Feature Creep Without Focus (Week 1)**
- Building broadly vs deeply
- Better: 14 core daily commands optimized
- Quality over quantity

**6. Inadequate Error Handling in Skills (Days 51-53)**
- Bash scripts: silent failures
- Skills: comprehensive error handling + JSON output
- Graceful degradation vs crashes

**7. Not Tracking Technical Debt (Weeks 1-5)**
- 109 scripts before systematic cleanup
- Link rot accumulating until Day 13-18 marathon
- Schedule regular debt review

**8. Context Drift in Long Sessions (Days 5, 11, 66)**
- Token consumption unnoticed
- Context bloat invisible
- Monitor and optimize periodically

**9. Ignoring Mobile From Start (Day 57)**
- iOS Safari upload issues discovered late
- PWA assumptions broken on mobile
- Test mobile early, not as afterthought

**10. Security as Afterthought (Week 8)**
- Authentication added Day 74, not Day 0
- Credential scanning retroactive
- Build security in from start

---

## 5. COMPLETE FEATURE LIST

### Dashboard & Overview

**Morning Routine (/overview - Day 88 refactored to agents)**
- Status brief with strategic advisor synthesis
- Calendar overview (Calendar Coordinator agent)
- Email triage summary (Inbox Coordinator agent)
- Knowledge Scanner agent for recent files
- Relationship health check
- Top 3 priorities
- Auto-trigger on first "good morning" after 6am (Day 11)
- Smart EOD detection based on time (before 4pm = pause, after = ask)

**Dashboard Features (Days 67-73)**
- Status brief cards (expandable with UI polish)
- Focus card combining priorities + recommendations
- Complete button for priorities with strikethrough
- Celebration card with relationship nudges (pulse animation)
- System health indicator dots in sidebar
- System stats admin panel
- Task preview in TodoPanel (collapsed by default)
- Aggressive caching with 24h refresh

### Task & Project Management

**Projects (API-first architecture Days 62-67)**
- **Altitudes:** Life / Sky / Ground views
- **Phases:** Organize tasks within projects
- **Workstreams:** Cross-cutting themes (Marketing, Agents, Performance)
- **Tasks:**
  - Click-to-edit titles (Day 71)
  - Due date picker with quick reschedule buttons (Today, Tomorrow, Next Week, etc.)
  - Drag-and-drop between phases
  - Undated tasks (dashed border + italic)
  - Sorting: due date ASC → sort_order → created_at DESC
  - Description + people + waiting_fors (expandable)
  - Done state with undo
- **Project Completion Workflow (Day 73):**
  - Mark as completed
  - Archive page for completed projects
  - Reactivation (optimistic UI)
  - Auto-refresh when data stale
- **Click-to-Edit:**
  - Project name
  - Task titles
  - Due dates
  - Event titles
- **Progress Tracking:**
  - Progress bar with source path
  - What's Next header
  - Deadline dropdown
  - Project sorting with persistence
- **Import System:** `/import-project` guided migration from markdown

**Reminders**
- `/remind` - Add/view reminders
- Reminder sweep weekly (archive completed with celebration)
- LocalStorage caching (Phase 1-2)
- Push notifications for due reminders (Day 74)
- File paths clickable in detail sheet

**Priorities**
- Daily priorities from Strategic Advisor
- Complete button with persistence
- Strikethrough for completed (keep visible)

### Communication & Relationships

**Email Management**
- **Gmail Integration:** OAuth-based
- **Inbox Triage:**
  - Haiku confidence scoring (0-100%)
  - 5 action levels (auto-filter thresholds)
  - Thread-first counting terminology
  - 95% certainty rule for auto-filtering
  - Email cache population system
- **Email Filters:** 20+ created through training sessions
  - Categories: Paper Trail, Feed, newsletters
  - Pattern recognition (newsletter systems, notifications)
  - Archive-as-read protocol
- **Training System:**
  - Session logging with Discord notifications
  - Pattern documentation (Sessions 02-09)
  - Consolidated training archive

**Relationship Management**
- **Person Files:**
  - YAML frontmatter with schema validation
  - Fields: name, email, phone, date_met, last_contact, freshness
  - Orbits: relationship distance (not topics)
  - Tags: topic associations (separated Day 56)
  - File-based storage (flattened structure Day 69)
- **Automated Refresh (Days 20-22):**
  - Sent email sync (8am ET daily)
  - Quick mode: 3-5s updates vs 30-60s full research
  - Batch processing (22 files in ~15s)
  - 50 emails → 21 person files largest batch
- **Relationship Intelligence:**
  - Freshness tracking (Hot/Warm/Cold)
  - Heat map visualization with clusters
  - Relationship nudges (ambient checks)
  - Relationship warming detector agent (proactive outreach)
- **Person Researcher Agent:**
  - Full mode: comprehensive research from Gmail/Calendar/context
  - Quick mode: lightweight updates from sent emails only
  - Batch mode: parallel processing
  - Schema validation enforcement
  - Date research for "Unknown" date_met fields

**iMessage Inbox Triage (Day 82)**
- **Sync System:**
  - Scheduled job via MCP server
  - Haiku assessment for urgency/context
  - Phone number lookup for Reply button
- **Inbox UI:**
  - Thread cards with AI summaries
  - Status: needs_reply → replied/snoozed/dismissed
  - Actions: Done / Snooze / Reply
  - Snooze options with slide animation
  - Snooze-until date display
  - Yellow glow on latest message
  - Manual changes preserved during sync
- **Notification:** Unreplied text count in inbox indicator

**Meeting Workflows (Days 19, 33, 41)**
- **Pre-Meeting (24h before):**
  - Auto-prep from Calendar Coordinator
  - Calendar history context
  - Relationship context
  - Past action items
  - Agenda from accumulated topics
- **Recording:** ParaSpecch integration
- **Post-Meeting:**
  - `/process-meeting-notes` command
  - Action item extraction
  - Reminder vs Task decision logic
  - 3 Most Important Takeaways section
  - Transcript cleanup (speaker diarization)
- **Follow-Up:**
  - Immediate next-meeting prep
  - Rolled forward action items
  - Completion tracking

**Newsletter System (Days 12-47)**
- **Automation:**
  - Luma iCal feed integration (event auto-populate)
  - Event descriptions with emoji suggestions
  - HTML templates with dark mode support
  - Broadcast creation script
- **Sections:**
  - Events This Week
  - Coming Soon
  - Community Spotlight (Day 51)
  - Unusual Connections (Day 51)
  - HI-5 section
- **Workflow:**
  - `/newsletter preview` (auto-launches browser)
  - `/newsletter-upload` for images
  - `/newsletter publish` (auto-finalize, move to sent)
  - Check sent folder before suggesting prep
- **Time Savings:** 30-45 min → 10 min (70% reduction)

**Social Media**
- **Twitter API (Day 87):**
  - Timeline fetch
  - Mentions
  - Rate limit awareness (100 reads/month free tier)
  - Default 1 tweet to conserve quota
  - Cost visibility warnings

### Calendar & Events

**Calendar Integration**
- **Google Calendar OAuth**
- **Calendar Coordinator Agent:**
  - Meeting prep automation
  - Room booking
  - Day-of-week labels
  - Events @ 709 vs personal separation

**Event System (Days 62-67, 5-phase migration)**
- **Event Planning:**
  - `/plan-event` from templates
  - Event-project linking (polymorphic)
  - Agreement tracking (on projects)
  - People linking
  - Setup/breakdown times
- **Event UI:**
  - Calendar grid with clickable project pills
  - Full event titles (no truncation)
  - Setup/breakdown time display (improved contrast)
  - Inline event detail sheet
  - Event drawer with persistent state in URL
  - Event tooltips for status dots
- **Outcomes Tracking:** `/document-outcomes` post-event

**Date Night Planning (Day 87)**
- Date cadence tracking with proactive nudges
- Restaurant tracking from Google Maps takeout
- In-progress awareness (no nagging during active planning)
- Venue database

### Knowledge & Memory

**Knowledge Library (Day 74 reorganization)**
- **Structure:** 6 folders (from flat structure)
- **Frontmatter:** Standardized schema
- **Categories:**
  - Articles & research
  - Campaign materials (10k Independents)
  - Meeting transcripts
  - Policy examples
  - SOPs (106 total)
  - Decision frameworks (Clarity Compass, Indy Hall OS)
- **File Browser:**
  - Full-text content search
  - Quick filter
  - Sort options (name, freshness, last edited)
  - FileBrowser component (shared with Meetings, People)
- **Skills:**
  - `file-this` - Knowledge base filing
  - `knowledge-search` MCP server (replaced osgrep Day 68)

**Memory Lane (Day 80)**
- **Semantic Memory Search:**
  - Vector embeddings
  - Hybrid retrieval: filter by entity, rank by query
  - Similarity scoring (0.70 floor raised for quality)
  - Fact memory type for stable personal information
- **Context Display:**
  - "Surfaced because..." explanations
  - Recall count tracking (session-scoped then global)
  - Enhanced memory info panel
  - Time Machine visualization
  - Orbit heat maps
  - Constellation animations
- **Memory Types:**
  - Fact: stable personal info
  - Insight: patterns discovered
  - Preference: user choices
  - Protocol: operational rules (always-loaded Day 89)
- **Quality:**
  - Graduated negative penalty feedback
  - Embedding cache for performance
  - Surprise-triggered extraction (Day 79)
  - PostToolUse hook for assistant-triggered recall

**Claude Memory Integration (Day 68)**
- Claude Memory viewer page
- Proxy for claude-mem iframe
- Path-based routes for assets/API/icons
- Caddy reverse proxy configuration

**Sessions API (Day 87)**
- **Search Capabilities:**
  - Search Claude session transcripts by keyword
  - Date range filtering
  - Files touched lookup
  - Detailed discussion retrieval
- **Historical Context:**
  - session_resume intent (auto-invoke)
  - Session-context-retriever agent
  - Institutional memory across sessions
  - "What did we discuss about X last week" queries

**Synthesis Intelligence (Day 55)**
- **Agents:**
  - pattern-miner: Extract patterns from audit trails
  - goal-alignment-corrector: Detect misalignment, generate corrections
  - relationship-warming-detector: Proactive relationship health
- **Workflows:**
  - Weekly pattern mining
  - Gap detection reports
  - Weekly syntheses
  - Executable correction artifacts

### Chat Interface (Andy Core)

**Core Features**
- **React + Inertia.js** SPA
- **Tailwind CSS** styling
- **Radix UI** primitives
- **Streamdown** streaming markdown renderer (Day 84)

**Input Methods (Days 55-63)**
- **Text:** Standard text input
- **Voice (Day 63):**
  - Two modes: tap for manual stop, long-press for auto-stop
  - Safari audio format compatibility
  - Default mode in preferences
  - Mobile-first design
- **Image/File Upload (Day 57):**
  - Drag-and-drop with overlay
  - iOS Safari compatibility (immediate upload on selection)
  - 200MB file limit for large audio
  - Upload progress indicator
- **Sparkfile Quick Capture (Day 57):**
  - Floating capture interface
  - Send-to-chat integration
  - Archive with undo
  - Tap-to-edit
  - LocalStorage caching

**Slash Commands**
- **58 total commands** (Day 68)
- **Auto-Complete (Days 57, 86):**
  - Fuzzy matching against names/descriptions
  - Usage-weighted prioritization (live API stats)
  - Recently used surfaced
  - Typing without "/" triggers suggestions
- **Dynamic Loading (Day 88):**
  - Commands load without frontend rebuild
  - Auto-update slash-commands.json on creation
  - Copy full command content (with frontmatter)
  - Artisan generate command
- **Admin UI (Day 57):**
  - Display markdown content
  - Usage tracking
  - Sorting (name, most used, recent)
  - Sync button for on-demand extraction

**Auto-Suggest Buttons (Day 86)**
- **Features:**
  - Clickable response buttons for yes/no questions
  - Purple loading indicator
  - Persist across session rebuild
  - Auto-suggest reminder hook
  - UserPromptSubmit hook integration
- **Impact:** Reduced friction, anticipatory feel

**UI Enhancements**
- **Message Display:**
  - User messages: gentle yellow halo
  - Code blocks with copy button
  - Auto-copy for specific blocks
  - Visual feedback for copy success
  - Collapsible pasted text (long content)
  - Email auto-linking (fixed HTML attributes Day 64)
- **Tool Calls:**
  - Expand/collapse for long content
  - Copy button for command output
  - Clickable file paths
  - Tool status after reconnection
  - Tool result summaries (Glob/Grep fixed Day 70)
- **Status Line:**
  - Mobile: two-row layout (left-aligned)
  - Desktop: single row
  - Breakpoint: md (768px)
  - Shimmer text effect for thinking
  - Yellow thinking bar text
  - Thinking bar matches tool call boxes
  - 👍 emoji in page title when agent responds
  - Optional response ready sound
- **Navigation:**
  - Active nav items: yellow halo
  - Subnav for admin sections
  - Instant visual feedback Chat→Dashboard
  - MobileNav position snap fixes
  - Prefetch routes for faster navigation
  - Aggressive prefetching for projects
  - System health dots in left nav sidebar
- **Session Management:**
  - Hash-based URLs (#chat/SESSION_ID)
  - Chat title click-to-edit (optimistic save, onBlur auto-save)
  - Session title + timestamp in Memory Lane bar
  - "Continue last session" button on /new route
  - Persist chat open state across refresh
  - LocalStorage with quota error handling
  - Trim history to prevent quota exhaustion
  - Stale detection when source files change
  - Rebuild button in header
  - False server restart fixes (Day 85)
- **PWA Features (Days 84-85):**
  - Chat-first loading (mobile cold start)
  - /new route for fresh sessions
  - Safe areas for PWA
  - iOS keyboard focus fixes
  - Scroll-to-bottom button (improved positioning)
  - Micro-interactions for premium feel
  - Haptic feedback on copy

**Split-Screen Mode (Day 73)**
- Toggle for desktop
- Side-by-side chat panel
- Power user feature

**Theme System (Day 67)**
- **Auto Theme:**
  - Sunrise/sunset based switching
  - Dark override option
  - Apply on initial page load (no flash)
- **Light Mode (Day 73):**
  - CSS variable fixes (hours of work)
  - MDXEditor light mode support
  - Selected state color fixes
  - Green color contrast adjustments
  - Tooltip z-index fixes

**Newsletter Preview (Day 57)**
- Authenticated proxy for mobile localhost
- Fullscreen iframe preview
- Bottom toolbar with member toggle

### Admin & System Management

**Admin Dashboard (Days 67, 80)**
- **System Stats:**
  - Token usage (per-model breakdown)
  - Session analytics
  - API billing data inline
  - Clarified data sources
- **Health Monitoring:**
  - Collapsible panels with auto-refresh
  - Sort by status (problems first)
  - Expand/collapse all toggle
  - Info tooltips for job descriptions
  - Memory usage (MemAvailable not MemFree)
- **MCP Server Management (Day 80):**
  - Metadata (first added, last modified)
  - Toggle on/off
  - Restart functionality
- **Credentials Admin (Day 80):**
  - View all credentials
  - Global vs per-user separation
  - Team-scoped display
  - System flag for app-only secrets
- **Notifications (Day 74):**
  - Admin notifications management
  - Broadcast system with URL dropdown
  - CSRF token protection

**Token Usage Observability (Days 66, 81)**
- **Tracking:**
  - Per-model token counts (Opus, Sonnet, Haiku)
  - Input/output tokens
  - model_tokens JSON cast
  - Streaming chunk detection (avoid double-counting)
- **Display:**
  - `/token-usage` slash command
  - Dashboard with charts
  - Cost tracking per session
  - API billing breakdown

**Backup & Recovery (Day 64)**
- **Disaster Recovery:**
  - Consolidated documentation
  - 1Password CLI for backups (switched from Infisical)
  - setup-server.sh automated provisioning
  - Infrastructure configs captured
- **Session Archival (Day 65):**
  - Weekly archive to DO Spaces
  - Tiered retention policy
  - Cleanup job for old sessions

**Scheduled Jobs (27 total by Day 83)**
- **Daily:**
  - relationship-refresh (8am ET)
  - daily-reflection-prompt (4pm ET)
  - iMessage-sync (with Haiku assessment)
  - cleanup-claude-sessions
- **Weekly:**
  - timeline-weekly-update (Sunday 11pm ET)
  - timeline-monthly-synthesis (First Sunday 11:30pm)
  - audit-quality-review (agent quality checks)
  - archive-claude-sessions (to DO Spaces)
  - include-usage-reports (track include usage)
  - podman-cleanup (container maintenance)
  - remind-sweep (archive completed)
  - gather-member-highlights (newsletter content)
- **Health:**
  - mcp-watchdog (health checks)
  - documentation-health (self-fixing)

**Health Checks**
- Self-fixing documentation
- Link healing nightly
- MCP server watchdog
- Job timing conflict detection
- Watchdog false restart loop fixes

### Skills & Automation

**Skill System (Week 5 breakthrough)**
- **Structure:** TypeScript + Bun runtime + SKILL.md docs
- **Interface:** Structured JSON output, error handling, type safety
- **Total:** 51 skills by Day 82

**API Skills (Week 7 explosion)**
- projects-api
- events-api
- tasks-api
- phases-api
- streams-api (workstreams)

**Tool Skills**
- workspace-tools (list files, large folders)
- contact-tools (vCard parsing)
- link-tools (pattern detection, Discord notifications)
- discord-tools (webhook functionality)
- luma-tools (event integration)
- reminder-tools
- ipostal-releases (mailbox notifications with Friday logic)

**Search & Knowledge**
- sessions-api (transcript search)
- file-this (knowledge filing)
- knowledge-search MCP

**Browser & Media**
- remote-browser (auto-switch between Macs, screenshot upload)
- webapp-testing (Playwright integration)
- transcribe-media (speaker diarization, 200MB files)

**Content & Design**
- frontend-design (production UI generation)
- mdx-editor (rich text for projects)
- make-it-fast (performance patterns)
- gradient-peek (expandable previews)

**Infrastructure**
- skill-creator (meta-skill)
- public-tunnel (Cloudflare)
- synology (NAS management)
- twitter-api (rate limit aware)

**Decision & Planning**
- decision-review (walk through unresolved decisions)
- email-triage
- place-capture
- directory-cleanup

**Scripts Cleanup (Days 51-53)**
- 109 scripts reviewed
- 37 archived (Batch 1-2)
- 84 remaining
- Criteria: Agent-consumable → Skill, Human-run → Script

### Infrastructure & DevOps

**Server Management**
- **DigitalOcean** primary hosting
- **Caddy** reverse proxy with auto-HTTPS
- **Podman** container orchestration
- **PM2** process management
- **Bree** job scheduler
- **Tailscale** private network
- **Synology NAS** (Day 84) with cert sync

**Remote Browser Automation (Day 77)**
- **dev-browser MCP** on Mac Mini & Mac Studio
- **switch-browser script:**
  - Auto-tries both Macs on failure
  - Automatic failover
  - Headless Claude Code compatible

**Host-Bridge Architecture (Day 80)**
- **Original:** 1 monolith
- **Extracted (ordered by risk):**
  1. health-service
  2. job-service
  3. claude-service
  4. entity-service
  5. memory-service (highest risk)
  6. host-bridge-server (delegation)
- **Performance:** Embedding cache in memory-service

**Credential System (Days 74-82)**
- **Storage:** Encrypted in PostgreSQL
- **Team-Scoped:** Separate encryption keys per team
- **Per-User:** ANDY_USER_ID env var in MCP wrappers
- **Migration:** Infisical → Andy Core native (complete Day 81)
- **Flags:** is_system for app-only secrets

**Security (Week 8)**
- **Laravel Sanctum** API auth
- **Session-based** SPA auth
- **CSRF** protection
- **Credential scanning:**
  - Quick/deep modes
  - Automated scrubbing
  - Smart pattern detection
- **Push notifications** (web push MVP)

**Port Registry (Day 59)**
- JSON file tracking services
- Scheduled job for updates
- Dashboard integration

**Monitoring & Logging**
- System health indicators
- Job execution tracking
- Token usage analytics
- Include usage reports
- Audit trail system (Day 43)
- Quality review weekly

**Development Tools**
- `/bug` - Create GitHub issues from context (Day 67)
- `/rebuild-andy-frontend` - Frontend rebuild automation
- `/create-skill` - Skill creation workflow
- `/interview` - Plan deep-dive conversations (Day 88)
- Switch-browser for remote automation testing
- Debug flags for iMessage sync

### Additional Features

**Data Migration Tools**
- `/import-project` - Guided migration markdown → database
- Orbit migration script (Day 56)
- Person file validation script
- Event system 5-phase migration
- Knowledge library 3-phase reorganization

**Specialized Workflows**
- **10k Independents Campaign (Day 50):**
  - Testimony guides
  - City Council tracking
  - Bill introduced with 9 co-sponsors
  - Knowledge management → legislative success
- **Indy Hall Website Redesign (Day 53):**
  - 14 standalone pages updated
  - DESIGN-GUIDE.md patterns
  - Neobrutalist experiments (BRUTAL CSS system)
- **Wine Rack System (Day 48):**
  - Bottle tracking
  - Row/position management
- **Event Partner Referral Network (Day 49):**
  - 10+ partner venues
  - Booking date tracking
  - Cross-promotion opportunities

**Content Systems**
- **PRIME Framework (Day 12):**
  - Potential, Readiness, Interest, Momentum, Effort
  - Seed ranking and prioritization
- **Sparkfile Capture:**
  - Floating interface
  - Send-to-chat
  - Archive with undo
- **YouTube Transcripts (Day 70):**
  - Tailscale proxy to m2mini fallback
- **Date Night Planning (Day 87):**
  - Google Maps takeout integration
  - Cadence tracking
  - Restaurant database

**Documentation**
- **SOPs:** 106 total by Day 82
- **Timeline:** Self-documenting (3-tier automation)
- **Agent Docs:** YAML frontmatter standardized
- **Include Files:** Modular context loading
- **Frontmatter Protection:** Warnings in newsletter SOP

**Open Source Preparation (Days 88-89)**
- Open source plan created
- /interview command for deep-dives
- Pattern documentation
- System architecture clarity

---

## 6. IMPLEMENTATION DETAILS

### Person File Schema (YAML Frontmatter)

```yaml
---
name: "First Last"
email: "email@example.com"
phone: "+1-555-0100"
date_met: "2020-05-01"  # Researched if Unknown
last_contact: "2025-12-15"
freshness: "hot"  # hot/warm/cold
orbits:
  - core  # Relationship distance, not topics
  - indy-hall
tags:
  - coworking  # Topic associations
  - entrepreneur
location: "Philadelphia, PA"
---

# Person Name

## Context
[How we met, relationship history]

## Communication Notes
- 2025-12-15: Discussed project X
- 2025-11-20: Follow-up on Y
```

**Validation Rules (from Day 2 manual session):**
- Exactly 2 blank lines after `last_edited`
- Orbit format: `orbit:name` with no trailing space
- `orbit:indy-hall` only if event physically at 709 N 2nd St
- Freshness thresholds validated
- Email format validated
- Date format YYYY-MM-DD

### Project Structure (Database Schema)

```sql
-- projects table
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  altitude VARCHAR(20),  -- life/sky/ground
  status VARCHAR(20),    -- active/completed/archived
  deadline DATE,
  agreement TEXT,        -- Moved from events Day 67
  source_path VARCHAR(255),  -- Original markdown file
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- tasks table
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id),
  phase_id BIGINT REFERENCES phases(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMP,
  sort_order INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Polymorphic people linking
CREATE TABLE personables (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT REFERENCES people(id),
  personable_type VARCHAR(255),  -- Project/Event/Task
  personable_id BIGINT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sort Order (Day 71):**
```sql
ORDER BY
  due_date ASC NULLS LAST,  -- Dated first
  sort_order ASC,
  created_at DESC
```

### Email Confidence Scoring (Day 10)

```yaml
# filter-manager agent
confidence_rules:
  newsletter_systems:
    - "unsubscribe" in footer → +40
    - consistent sender domain → +20
    - volume pattern (1/week) → +15
    - marketing template → +15
    confidence: 90  # Auto-filter threshold

  transactional:
    - order confirmation keywords → +35
    - receipt/invoice → +30
    - known merchant → +20
    confidence: 85

  conversation:
    - reply to thread → -50
    - personal greeting → -30
    - question asked → -40
    confidence: 15  # Skip filtering
```

### Quick Mode vs Full Mode Pattern

**Person Researcher (Day 24):**
```typescript
interface ResearchMode {
  quick: {
    duration: "3-5s",
    sources: ["sent_email_context"],
    updates: ["communication_notes", "last_contact"],
    skip: ["gmail_search", "calendar_lookup"]
  },
  full: {
    duration: "30-60s",
    sources: ["gmail", "calendar", "context", "web"],
    updates: ["all_fields", "deep_research"],
    use_cases: ["new_person", "major_changes", "explicit_request"]
  }
}
```

**Newsletter Digest (Day 29):**
```typescript
interface DigestMode {
  cache_only: {
    duration: "5s",
    source: "existing_cache",
    use: "multiple_iterations"
  },
  fetch_with_enrichment: {
    duration: "20-30s",
    strategy: "bookend",  // First 5 + last 5 messages
    improvement: "68%",   // 0.54 → 0.91 relevance
    use: "initial_fetch"
  }
}
```

### Batch Processing Pattern (Day 26)

```javascript
// relationship-refresh batch mode
async function batchRefresh(recipients, batchSize = 10) {
  const batches = chunk(recipients, batchSize);

  for (const batch of batches) {
    // Spawn parallel agents for batch
    const results = await Promise.all(
      batch.map(recipient =>
        spawnPersonResearcher(recipient, { mode: 'quick' })
      )
    );

    // Track state per batch
    await saveBatchState(results);

    // Discord progress update
    await notifyProgress(batches.indexOf(batch) + 1, batches.length);
  }
}

// Performance: 22 recipients
// Sequential: 22 * 5s = 110s
// Batch (10): ~15s total (86% faster)
```

### Memory Lane Retrieval (Day 80)

```typescript
interface MemoryRetrieval {
  hybrid_search: {
    step1: "filter by entity (person, project, topic)",
    step2: "rank by semantic similarity to query",
    floor: 0.70,  // Raised for quality
    boost_facts: true
  },

  context_display: {
    surfaced_because: "Explanation of why this memory appeared",
    recall_count: "Session-scoped then global tracking",
    similarity_score: "0.70-1.00 range"
  },

  memory_types: {
    fact: "Stable personal information (always relevant)",
    insight: "Patterns discovered during sessions",
    preference: "User choices and settings",
    protocol: "Operational rules (always loaded)"
  },

  feedback: {
    graduated_penalty: "Multiple negatives reduce future appearance",
    positive: "Boost similar memories"
  }
}
```

### Auto-Suggest Button System (Day 86)

```typescript
interface AutoSuggest {
  trigger: "yes/no questions in assistant response",
  hook: "UserPromptSubmit",  // Switched from Stop hook

  button_format: {
    color: "purple",
    loading: "purple indicator",
    persist: "across session rebuild"
  },

  instruction_reminder: {
    location: "CLAUDE.md",
    strength: "strengthened emphasis",
    frequency: "every response with yes/no"
  }
}

// Example response:
// "Would you like me to create a task for this?"
// [Yes] [No] ← Purple buttons
```

### Token Optimization Phases (Day 66)

```yaml
Phase_1_Include_Consolidation:
  - 3 email cache includes → 1
  - 2 email filter configs → 1
  - Communication rules → style-guide.md (dedupe)
  - documentation-map + sop-index → merged

Phase_2_Protocol_Trimming:
  - Trim examples to 1 per file
  - Remove redundant context
  - Reorganize CLAUDE.md list

Phase_3_Cleanup:
  - Update stale references
  - Remove 3 orphaned includes
  - Verify all imports work

Result:
  - Before: ~23KB startup context
  - After Day 5: ~5.5KB (76% reduction)
  - After Day 11: ~3.3KB (85% reduction)
  - After Day 66: Further optimization + tracking
```

### Slash Command Structure

```markdown
---
name: command-name
description: What this command does
category: "productivity" | "communication" | "admin"
model: "opus" | "sonnet" | "haiku"
trigger_phrases:
  - "natural language phrase"
  - "another trigger"
---

# Command Name

## Purpose
What this command accomplishes

## Workflow
1. Step one
2. Step two
3. Output format

## Related Commands
- `/other-command` - Why it's related

## Examples
- "Example invocation"
```

**Dynamic Loading (Day 88):**
- Commands load without frontend rebuild
- Auto-update slash-commands.json on creation
- Frontend reads from JSON (not hardcoded)
- Hot-reloadable system

### Date Night Planning System (Day 87)

```typescript
interface DateNightSystem {
  tracking: {
    last_date: "2025-12-15",
    cadence_target: "2_weeks",
    venues_tried: ["restaurant_a", "restaurant_b"],
    in_progress: boolean  // Don't nag during planning
  },

  nudge_logic: {
    check_interval: "daily",
    threshold: "cadence_target exceeded",
    suppress_if: "in_progress === true",
    action: "Proactive suggestion with 3 venue options"
  },

  venue_database: {
    source: "Google Maps takeout",
    fields: ["name", "location", "cuisine", "tried_date"],
    filter: "not_tried_recently"
  }
}
```

### MCP Wrapper Pattern (Day 82)

```bash
#!/bin/bash
# gmail-mcp-wrapper.sh

# User context for multi-tenant
export ANDY_USER_ID="${ANDY_USER_ID:-1}"

# Fetch credential from database
GOOGLE_OAUTH_TOKEN=$(
  bun run /var/www/andy/andy-core/scripts/get-credential.ts \
    google-oauth-token \
    --user-id $ANDY_USER_ID
)

# Export for MCP server
export GOOGLE_OAUTH_TOKEN

# Execute MCP server (stdio mode)
exec npx -y @modelcontextprotocol/server-gmail "$@"
```

**Key Elements:**
- User-scoped credentials
- Database-backed secrets (not Infisical)
- stdio communication (fragile, keep minimal)
- No middleware that buffers output

---

## 7. TECHNICAL DECISIONS & RATIONALE

### Why Laravel Over Next.js/Other Frameworks?

**Advantages That Mattered:**
1. **Built-in Auth:** Sanctum for API + SPA authentication (Day 74)
2. **Mature ORM:** Eloquent with polymorphic relationships (personables, notes)
3. **Job Scheduling:** Bree integration (27 jobs)
4. **Inertia.js:** SPA feel without API complexity
5. **Ecosystem:** Mature packages, good documentation

**Tradeoffs Accepted:**
- PHP vs full TypeScript stack
- Laravel conventions vs JS flexibility
- Heavier than minimal frameworks

**Alternative Considered (Day 44 research):**
- Next.js 15 + Supabase for future Andy optimization
- API-first for mobile apps
- Edge functions for global performance

### Why PostgreSQL Over MySQL/SQLite?

**Features Used:**
1. **JSON Casts:** model_tokens tracking (Day 81)
2. **Full-Text Search:** pg_textsearch capability
3. **Boolean Type:** Native support (gotchas documented)
4. **Reliability:** Production-grade consistency
5. **Vector Extensions:** Future semantic search (Memory Lane uses embeddings)

**Gotchas Hit:**
- Boolean vs MySQL tinyint differences (Day 63)
- Migration syntax PostgreSQL-specific (Day 65)

### Why TypeScript Skills Over Bash Scripts?

**The Breakthrough (Day 52):**

**Before:**
```bash
# Bash script for agents
# - Silent failures
# - Inconsistent output
# - No error handling
# - Hard to test
```

**After:**
```typescript
// TypeScript skill
interface SkillOutput {
  success: boolean;
  data: StructuredJSON;
  error?: string;
}

// - Compile-time type checking
// - Structured JSON output
// - Comprehensive error handling
// - Easy to test
```

**Impact:**
- Link-healer: "runs most of the time" → "runs reliably every time"
- Agents parse output correctly (no more string manipulation)
- Production validation possible

### Why Opus for Some Agents, Sonnet for Others?

**Model Selection Strategy (Day 9 refined through Day 88):**

**Opus ($15/1M input, $75/1M output):**
- Strategic Advisor: synthesis, goal detection
- Workflow Advisor: quality judgment, optimization
- Audit Quality Review: comprehensive analysis
- Rationale: Strategic thinking worth premium cost, not run frequently

**Sonnet ($3/1M input, $15/1M output):**
- Most agents: pattern matching, structured extraction
- Timeline Curator: narrative synthesis
- Person Researcher: context analysis
- Rationale: 80% quality at 20% cost, runs frequently

**Haiku ($0.25/1M input, $1.25/1M output):**
- Link Healer: simple pattern matching (Day 88)
- Email Scanner: filter assessment
- iMessage Assessment: triage scoring
- Rationale: Lightweight tasks, volume operations

**Key Insight:** Match model to work type, not frequency alone. Strategic synthesis deserves Opus even if infrequent.

### Why Inertia.js Over Pure React SPA?

**Benefits:**
1. **No API Layer:** Controllers return props directly
2. **Server Rendering:** Initial page load server-rendered
3. **Navigation:** SPA transitions without API calls
4. **Familiar:** Laravel conventions + React components

**Tradeoffs:**
- Tied to Laravel (not framework-agnostic)
- Less flexible than pure API approach
- Mobile apps require separate API anyway (noted in Day 44 research)

### Why Caddy Over Nginx?

**Advantages:**
1. **Automatic HTTPS:** Let's Encrypt built-in
2. **Simpler Config:** Caddyfile vs nginx.conf
3. **Reverse Proxy:** Easy setup for claude-mem, preview servers
4. **JSON API:** Programmatic control

**Iterations Required (Day 68):**
- Claude Memory proxy: 6+ commits to get routes right
- Path-based routing for assets/API/icons
- host.containers.internal for container-to-host

**Lesson:** Reverse proxies rarely work first try, budget for iteration

### Why Bree Over cron?

**Features Used:**
1. **Node.js Jobs:** JavaScript/TypeScript directly
2. **Error Handling:** Built-in logging
3. **Timezone Support:** ET consistency
4. **Process Management:** PM2 integration
5. **Scheduling Syntax:** Human-readable intervals

**27 Jobs by Day 83:**
- Daily: 4 jobs
- Weekly: 8 jobs
- Ad-hoc: 15 jobs
- Complex scheduling possible

### Why Headless Claude Code Over Direct API?

**Pattern Used in Scheduled Jobs:**

```javascript
exec('claude --headless --dangerously-skip-permissions /command', ...)
```

**Advantages:**
1. **MCP Access:** Gmail, Calendar, iMessage via MCP servers
2. **Skills Available:** All 51 skills accessible
3. **Context:** Full CLAUDE.md + includes loaded
4. **Consistency:** Same environment as interactive sessions

**Tradeoffs:**
- Heavier than direct API call
- Requires Claude Code installed
- Permissions flag needed

**Alternative Considered:**
- Direct Anthropic API with custom context
- Would require rebuilding MCP integrations
- Headless Claude Code reuses infrastructure

### Why Memory Lane Over Traditional Search?

**Semantic vs Keyword:**

**Traditional Search:**
```
Query: "meeting notes about X"
Returns: Exact string matches
Miss: Synonyms, related concepts
```

**Memory Lane (Day 80):**
```
Query: "meeting notes about X"
Process: Vector embedding similarity
Returns: Semantically related memories
Includes: Synonyms, paraphrases, related topics
```

**Hybrid Approach:**
- Filter by entity (person, project)
- Rank by semantic similarity
- Floor at 0.70 for quality
- Boost fact memories

**Impact:**
- "What did we discuss about X last week" works with fuzzy recall
- Cross-session institutional memory
- Context accumulates naturally

---

## 8. BUILD SEQUENCE RECOMMENDATIONS

### Week 1: Foundation
**Goal: Basic working system with real data**

**Day 1-2: Integrations + Data**
- Set up MCP servers (Gmail, Calendar, Discord)
- Process real data (contacts, emails) to validate patterns
- Document "Rule of Three" after 3rd repetition

**Day 3-4: Agent Structure**
- Start with markdown agents (6 core)
- Create TypeScript bridge for Discord
- Build basic slash commands

**Day 5: Optimization Round 1**
- Context modularization (target 50%+ reduction)
- Just-in-time loading pattern
- Document what works

### Week 2: Automation
**Goal: Daily automation with data quality**

**Day 6-8: Sent Email Sync**
- Build person-researcher agent
- Implement quick mode vs full mode
- Set up daily scheduled job

**Day 9-11: Validation**
- Schema validation on person files
- YAML frontmatter enforcement
- Fix accumulated errors

**Day 12-14: Link Healing**
- Build link-healer agent
- Automated repair scripts
- Nightly job setup

### Week 3: Intelligence
**Goal: Self-learning systems**

**Day 15-17: Meeting Workflows**
- Pre-meeting prep automation
- Action item extraction
- Post-meeting follow-up

**Day 18-21: Newsletter System**
- HTML templates
- Event integration (Luma iCal)
- Enrichment strategies

### Week 4: Skills Infrastructure
**Goal: Sustainable extensibility**

**Day 22-24: Skills Foundation**
- TypeScript skill pattern
- Production validation process
- Script migration criteria

**Day 25-28: Scripts Cleanup**
- Systematic review (batch approach)
- Archive obsolete
- Convert high-value to skills

### Week 5: Chat UI
**Goal: Production interface**

**Day 29-31: Core Features**
- Sparkfile quick capture
- Image/file upload
- Voice input

**Day 32-35: Intelligence**
- Slash command autocomplete
- Usage-weighted suggestions
- Session persistence

### Week 6: API-First
**Goal: Database-backed everything**

**Day 36-38: API Skills**
- Projects API
- Events API
- Tasks API
- Template pattern

**Day 39-42: Migration**
- File-based → Database (phased)
- Validation at each step
- Data integrity checks

### Week 7: Memory
**Goal: Semantic search + recall**

**Day 43-45: Memory Lane**
- Vector embeddings
- Hybrid retrieval
- Context display ("surfaced because")

**Day 46-49: Host-Bridge Extraction**
- Service delegation (order by risk)
- health → job → claude → entity → memory
- Embedding cache

### Week 8: Security
**Goal: Multi-user foundation**

**Day 50-52: Authentication**
- Laravel Sanctum
- Session-based SPA auth
- CSRF protection

**Day 53-56: Credential System**
- Encrypted storage
- Team-scoped keys
- Per-user credentials (ANDY_USER_ID)

**Day 57-59: Hardening**
- Credential scanning
- Push notifications
- Light mode testing

### Week 9: Polish
**Goal: Production quality**

**Day 60-63: Mobile UX**
- PWA optimizations
- Chat-first loading
- iOS fixes

**Day 64-66: iMessage Triage**
- Sync system
- Inbox UI (Done/Snooze/Reply)
- AI assessment

**Day 67-70: Refinement**
- Auto-suggest buttons
- Task UX (click-to-edit, due dates)
- Drag-and-drop

### Week 10: Refactoring
**Goal: Sustainable architecture**

**Day 71-73: Agent Migration**
- Inline prompts → Registered agents
- /overview refactoring
- Quality validation

**Day 74-77: Integration Expansion**
- Sessions API (transcript search)
- Twitter API (rate limit aware)
- Date night planning

**Day 78-80: Open Source Prep**
- Documentation review
- Pattern extraction
- System architecture clarity

---

## 9. CRITICAL SUCCESS FACTORS

### 1. Real Data From Day One
- 221 contacts (Day 1) revealed patterns
- Manual processing before automation
- Quality feedback immediate

### 2. Integration-First Approach
- Gmail, Calendar, Discord (Day 0)
- Shaped all subsequent decisions
- MCP servers gave superpowers

### 3. Iterative Validation
- "Rule of Three" documentation
- Manual sessions find edge cases
- Schema validation catches errors early

### 4. Two-Speed Design
- Quick mode for daily automation
- Full mode for deep work
- Enables both thoroughness and frequency

### 5. Confidence-Based Autonomy
- 0-100% scoring vs binary yes/no
- Action thresholds allow automation
- Transparency builds trust

### 6. Modular Context Architecture
- Just-in-time loading
- 76% → 85% reduction over time
- Scheduled optimization reviews

### 7. Skills Over Scripts
- TypeScript + JSON output
- Agent reliability transformation
- Production validation discipline

### 8. Self-Healing Infrastructure
- Auto-fix, not just report
- Link healing nightly
- Documentation health jobs

### 9. Context Awareness
- Sent emails before recommendations
- Enrichment strategies (bookend)
- Intelligence vs automation

### 10. Production Validation
- Run new code parallel with old
- 1+ days before switching
- Archive only after proven

---

## 10. AVOID THESE PITFALLS

### 1. Parallel Processing Without Deduplication
- **Cost:** 2 hours cleanup (Day 1)
- **Fix:** Dedupe before commit
- **Prevention:** Test with small batches first

### 2. Building in Markdown Without Types
- **Cost:** Inconsistent agents (Days 2-4)
- **Fix:** TypeScript + templates
- **Prevention:** Start with deterministic patterns

### 3. Loading All Context Upfront
- **Cost:** Token limits, slow sessions
- **Fix:** Modular loading (76% reduction)
- **Prevention:** Monitor context size from start

### 4. Ignoring Usage Patterns
- **Cost:** Wasted optimization effort
- **Fix:** Usage frequency analysis
- **Prevention:** Track metrics before optimizing

### 5. Third-Party Tools As-Is
- **Cost:** Workarounds, brittleness
- **Fix:** Fork + customize heavily
- **Prevention:** Evaluate integration points first

### 6. Reorganizing Without Link Tracking
- **Cost:** 186 broken links (Days 13-18)
- **Fix:** Link healer automation
- **Prevention:** Track links before moving files

### 7. Schema Validation After Accumulation
- **Cost:** 21 files with errors (Day 23)
- **Fix:** Validation in creation flow
- **Prevention:** Enforce schema from start

### 8. Dark-Mode-First Without Light Testing
- **Cost:** Hours of CSS fixes (Day 73)
- **Fix:** Test both modes early
- **Prevention:** Design system includes both

### 9. Binary Automation Decisions
- **Cost:** Constant human intervention
- **Fix:** Confidence scoring (0-100%)
- **Prevention:** Design for gradual autonomy

### 10. Background Jobs Overwriting Manual Changes
- **Cost:** User frustration (Day 82)
- **Fix:** Preserve manual overrides
- **Prevention:** Users are source of truth

---

## SUMMARY

**Andy demonstrates that a production-grade AI executive assistant can be built in 89 days through:**

1. **Integration-First Architecture** - MCP servers (Gmail, Calendar, Discord) from Day 0
2. **Real Data Validation** - 221 contacts processed manually before automation
3. **Iterative Refinement** - "Rule of Three" documentation pattern
4. **Two-Speed Design** - Quick mode (3-5s) + Full mode (30-60s) enables daily automation
5. **Skills Infrastructure** - TypeScript skills > bash scripts for agent reliability
6. **Confidence-Based Autonomy** - 0-100% scoring with action thresholds
7. **Self-Healing Systems** - Auto-fix documentation, link healing, health checks
8. **Context Awareness** - Enrichment strategies, sent email analysis before recommendations
9. **API-First Migration** - File-based → Database for projects, events, tasks (phased)
10. **Memory Intelligence** - Semantic search with "surfaced because" context

**Key Metrics:**
- **44 Agents** across 6 departments
- **58 Slash Commands** with dynamic loading
- **51 Skills** (TypeScript-based)
- **106 SOPs** documented
- **27 Scheduled Jobs** for automation
- **85% Context Reduction** (23KB → 3.3KB)
- **70% Time Savings** on newsletter prep

**Technical Foundations:**
- Laravel + PostgreSQL + Inertia.js + React
- Claude API (Opus/Sonnet/Haiku model selection)
- MCP servers for integrations
- Bree job scheduler
- Laravel Sanctum authentication
- Encrypted credentials with team scoping
- Memory Lane semantic search
- Push notifications for mobile

**The timeline proves you can build sophisticated AI systems rapidly by:**
- Starting with integrations, not isolation
- Processing real data immediately
- Validating manually before automating
- Rebuilding when faster than patching
- Optimizing based on usage, not assumptions
- Self-healing instead of manual maintenance
- Agent architecture for sustainability

This analysis provides the complete technical blueprint for rebuilding PersonalOS correctly.
