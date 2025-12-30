# Andy Timeline - Complete Technical Analysis
**Based on 89 days of development (Oct 8 - Dec 29, 2025)**

## 1. TECH STACK

### Backend Framework
- **Laravel (PHP)** - Primary web framework
  - Laravel Sanctum for API authentication (Day 74)
  - Inertia.js for server-driven single-page apps
  - PostgreSQL database with Eloquent ORM
  - Event-driven architecture with job queues

### Database
- **PostgreSQL**
  - Core tables: projects, tasks, phases, workstreams, events, people, credentials, claude_sessions, memories, personables
  - Full-text search with pg_textsearch (Day 79)
  - JSON columns for flexible metadata (model_tokens)
  - Polymorphic associations via personables table

### Frontend
- **React** with TypeScript
- **Inertia.js** for SPA routing (server-driven)
- **Radix UI** for accessible components
- **Tailwind CSS** for styling
- **MDXEditor** for rich text editing (Day 69-70)
- **Streamdown** for streaming markdown rendering (Day 84)

### Hosting & Infrastructure
- **DigitalOcean Spaces** - Backups and session archives (Day 65)
- **Caddy** - Reverse proxy for SSL and routing
- **PM2** - Process management
- **Podman** - Containerization
- **Synology NAS** - Local storage (Day 84)
- **Tailscale VPN** - Secure service access
- **Cloudflare Tunnel** - Public dev server access (Day 80)

### Voice & Media
- **Whisper** (via transcribe-media skill) - Speech-to-text
- Speaker diarization support (Day 64)
- Audio uploads up to 200MB
- Voice input with tap/long-press modes (Day 63)

### Browser Automation
- **dev-browser MCP** (replaced Playwright on Day 77)
- Remote browser automation via Tailscale
- Auto-failover between Mac machines
- Screenshot capture and upload

## 2. ARCHITECTURE PATTERNS

### Agent System (44+ agents in 6 departments)

**Executive:**
- Strategic Advisor (Opus) - High-level strategy
- Workflow Advisor (Opus) - Process optimization

**Operations:**
- Project Manager
- Relationship Manager
- Email Manager (Inbox Coordinator, Filter Manager)
- Calendar Coordinator

**Research:**
- Person Researcher (quick/full modes - 90% faster with quick mode)
- Topic Researcher
- Knowledge Keeper

**Content Lab:**
- Mining Coordinator
- Quote/Framework/Story Miners

**Synthesis (Day 55):**
- Pattern-Miner
- Goal Alignment Corrector
- Relationship Warming Detector

**System:**
- Link Healer (Haiku)
- Timeline Curator
- Project Validator
- Gardener
- Knowledge Scanner

**Evolution:**
- Day 0-11: Markdown-based instructions (600+ lines)
- Day 52: Skills system breakthrough (structured JSON output)
- Day 88: /overview migrated from inline prompts to agent-based
- YAML frontmatter for agent metadata
- Model selection: Opus (strategy), Sonnet (patterns), Haiku (simple tasks)

### Skills System (100+ skills) - Day 52 Breakthrough

**Pattern:** TypeScript + Bun + JSON output
- Structured error handling
- Type safety
- Agent-consumable interfaces
- Reusable across commands

**Key Skills:**
- **Workspace:** workspace-tools, directory-cleanup
- **Communication:** contact-tools, discord-tools, email-triage
- **APIs:** events-api, tasks-api, projects-api, streams-api, sessions-api
- **Media:** transcribe-media, remote-browser
- **Infrastructure:** public-tunnel, synology, podman-redirect
- **Social:** twitter-api, luma-tools
- **Content:** mdx-editor, gradient-peek, streamdown

### MCP Servers (Model Context Protocol)

**Core Integrations:**
- Gmail MCP - Email operations
- Google Calendar MCP - Calendar integration
- Discord MCP - Bot messaging
- iMessage MCP - Text message sync (Day 82)
- Google Docs MCP - Document editing (Day 76)
- Tally MCP - Form responses (Day 80)
- Twitter MCP - Timeline/mentions (Day 87)
- knowledge-search MCP - Replaced osgrep (Day 68)

**Infrastructure:**
- MCP watchdog job for health monitoring (Day 83)
- Wrapper scripts with credential injection
- Per-user credentials via ANDY_USER_ID env var
- CPU monitoring attempted but reverted (stdio fragility)

### Job Queue System (Bree Scheduler - 27 jobs by Day 83)

**Daily Jobs:**
- relationship-refresh (8am ET) - Sent email sync
- cleanup-claude-sessions - Session file cleanup
- audit-quality-review - Agent activity review
- documentation-health - Nightly validation with self-fixing
- link-healer - Broken link detection/repair
- daily-reflection-prompt (4pm ET) - Discord nudges
- iMessage-sync - Unreplied text checker

**Weekly Jobs:**
- timeline-weekly-update (Sunday 11pm ET)
- archive-claude-sessions - Backup to DO Spaces
- newsletter automation - Event sync
- gather-member-highlights - Newsletter content
- podman-cleanup - Container maintenance

**Monthly Jobs:**
- timeline-monthly-synthesis (First Sunday 11:30pm ET)

## 3. DATABASE SCHEMA

### Core Tables

**projects**
- deadline, status (active/completed)
- agreement, source_path
- Polymorphic links to people via personables

**tasks**
- title, description, due_date, completed_at
- sort_order, phase_id
- Links to people, projects

**phases**
- name, sort_order, project_id
- Drag-drop reordering (Day 71)

**workstreams**
- Cross-cutting themes (Marketing, Agents, Performance)
- Day 65 rename from "streams"

**events**
- start_time, end_time, timezone
- setup/breakdown times
- Luma sync integration

**people**
- file_path, frontmatter fields
- date_met, orbits (relationship distance)
- tags (topics), last_contact
- Day 56: Orbit/tag separation after 55 days of debt

**personables**
- Polymorphic linking table
- Links people to projects/events/tasks

**credentials**
- Encrypted with team-specific keys
- is_system flag for OAuth vs manual
- Day 74: credential scanning implemented

**claude_sessions**
- token_usage tracking
- model_tokens JSON (per-model tracking)
- Day 81: Token double-counting fix

**memories**
- embedding vector
- entity_id, search_query
- recall_count, memory_type (fact/protocol/surprise)
- Day 68-80: Memory Lane semantic search

**reminders**
- due_date, status, snooze_until
- Push notifications (Day 74)

### Schema Patterns
- **PostgreSQL boolean** type handling documented
- **YAML frontmatter** in markdown files (Day 8 migration)
- **JSON columns** for flexible metadata
- **Polymorphic associations** for flexible relationships

## 4. BUILD ORDER & DEPENDENCIES

### Phase 1: Foundation (Days 0-11)
1. **Day 0:** Gmail/Discord MCP, reminders system
2. **Day 1:** Contact processing (221 contacts), parallel optimization
3. **Day 3:** Multi-agent system v2.0, morning routine
4. **Day 4:** TypeScript bridge (8 hours to replace Python)
5. **Day 5:** Context optimization (23KB → 5.5KB = 76% reduction)
6. **Day 8:** YAML frontmatter migration
7. **Day 9:** 15-agent system with departments
8. **Day 11:** Commands consolidation (14 daily commands)

### Phase 2: Production Maturation (Days 12-32)
1. Link healer marathon (186 broken links)
2. Relationship automation (sent email sync)
3. Schema validation
4. Batch processing implementation
5. Newsletter automation (68% relevance improvement)
6. Self-fixing documentation health

### Phase 3: Timeline Automation (Days 33-39)
1. Timeline curator 3-tier system (weekly/monthly/quarterly)

### Phase 4: Skills Infrastructure (Days 48-54)
1. **Day 52: SKILLS BREAKTHROUGH**
2. Scripts cleanup (59 reviewed, 37 archived)
3. TypeScript migration of bash scripts

### Phase 5: Chat UI & Synthesis (Days 55-61)
1. Synthesis Intelligence system (Day 55)
2. Orbit/tag refactoring (Day 56 - 7-phase migration)
3. Chat UI explosion (Day 57 - 90+ commits)
   - Sparkfile quick capture
   - Image uploads
   - Slash command intelligence

### Phase 6: API-First Architecture (Days 62-68)
1. Voice input (Day 63)
2. 4 API skills (events, tasks, phases, streams)
3. Transcription skill (Day 64)
4. Workstreams rename (Day 65)
5. Session archival (Day 65)
6. Claude Memory integration (Day 68)

### Phase 7: Security & UX Polish (Days 69-75)
1. MDX editor integration (Days 69-70)
2. Task UX revolution (Day 71) - click-to-edit, due date picker
3. Light mode fixes (Day 73)
4. Push notifications MVP (Day 74)
5. Laravel Sanctum (Day 74)
6. Credential scanning (Day 74)

### Phase 8: Memory Intelligence (Days 76-82)
1. Google OAuth migration (Day 76)
2. Remote browser with failover (Day 77)
3. Memory Lane launch (Day 80)
4. Host-bridge → 6 services extraction (Day 80 - 91 commits)
5. Token analytics (Day 81)
6. Team credentials (Day 81)
7. iMessage inbox triage (Day 82)

### Phase 9: Agent Refactoring (Days 83-89)
1. Chat-first PWA loading (Day 84 - 193 commits)
2. Auto-suggest buttons (Day 86)
3. Twitter API, sessions-api (Day 87)
4. /overview agent migration (Day 88)
5. Draft queue, protocol memory type (Day 89)

## 5. KEY LESSONS LEARNED

### Architecture Lessons

**1. Deterministic > Smart**
- TypeScript pipelines beat markdown instructions
- Structured JSON output = reliable agent parsing
- Skills system unlocked automation reliability

**2. Context is Finite**
- Day 5: 76% reduction (23KB → 5.5KB)
- Day 11: 85% total reduction
- Load just-in-time, not all at once

**3. Rebuild When Faster**
- 8-hour TypeScript bridge rewrite vs weeks of patches
- Don't patch when you can rebuild cleanly

**4. Validation = Infrastructure**
- YAML frontmatter enables automated analysis
- Schema validation caught 21 errors on Day 23

**5. Batch Processing Sweet Spot**
- 80% of parallel speed
- 20% of sequential complexity
- 86% faster than sequential (110s → 15s for 22 people)

**6. API-First Pays Dividends**
- File-based → database-backed enables impossible features
- Day 62: Project import unlocked new workflows

### Development Process Lessons

**1. Rule of Three**
- Document after 3rd use, not before
- Prevents premature abstraction

**2. Manual Sessions Find Edge Cases**
- Process 20-30 items before automating
- Day 2: Manual formatting revealed patterns

**3. Test Both Modes Early**
- Dark-mode-first created light mode technical debt (Day 73)

**4. Order Extractions by Risk**
- Easy wins build confidence for hard pieces
- Day 56: 7-phase orbit/tag migration

**5. Data Migrations Need Rollback**
- Day 74: Knowledge library Phase 1 data loss
- Restore commit saved the day

**6. Let Data Guide Optimization**
- Usage frequency beats intuition
- Slash command prioritization by actual use

**7. Metadata Isn't Overhead**
- It's infrastructure for future intelligence
- YAML frontmatter = queryable system

### Product & UX Lessons

**1. Context Transforms Automation into Intelligence**
- EOD reading sent emails = specific recommendations
- Not just "what happened" but "what it means"

**2. Confidence Scoring Enables Autonomy**
- 0-100% scale with action thresholds
- Filter Manager (Day 10)

**3. Enrichment Has Diminishing Returns**
- Bookend strategy (first 5 + last 5) sufficient
- Full bodies boosted relevance 68% (0.54 → 0.91)

**4. Every Workflow Needs Ending State**
- Projects that can't complete linger forever
- Day 73: Project completion workflow

**5. Memory Without Context is Data**
- "Surfaced because..." makes memories actionable
- Day 80: Memory Lane with relevance explanations

**6. Small Friction Multiplies**
- Auto-suggest buttons changed entire UX feel (Day 86)
- Click-to-edit vs form modals (Day 71)

**7. Proactive Systems Must Know When Quiet**
- Don't nag during active planning
- Daily reflection at 4pm ET, not constantly

### Optimization Lessons

**1. Optimization Has Phases**
- Make it work → fast → smart → autonomous

**2. Quick Paths Enable Daily Cadence**
- Person research: Full (60s) → Quick (5s) = 90% faster
- Quick mode made daily refresh viable

**3. Cleanup Accelerates After First Batch**
- Pattern recognition from Batch 1 speeds Batch 2
- Day 52: 59 scripts reviewed, patterns emerged

**4. You Can't Optimize What You Don't Measure**
- Day 81: Model-level tracking revealed actual costs
- Token analytics dashboard

**5. Schedule Periodic Reviews**
- Context bloat is invisible until you look
- Day 66: Token optimization pass

## 6. COMPLETE FEATURE LIST

### Commands (58+ slash commands)

**Daily Workflow:**
- /overview - Morning briefing with strategic synthesis
- /eod - End of day reflection with context
- /pause - Quick vs full pause modes
- /next-task - Context-aware task suggestions
- /plant-seed - Instant/quick/deep capture tiers

**Navigation:**
- /link - Recent files with natural language
- /new - Fresh chat session

**Meeting Management:**
- /prep-meeting - Auto-prep 24h before
- /process-meeting-notes - Action item extraction
- /plan-event - Event planning from templates
- /document-outcomes - Post-event capture

**Task & Project:**
- /remind or /r - Smart ADD/VIEW modes
- /import-project - File → database migration
- /check-texts - iMessage unreplied checker

**Content & Communication:**
- /newsletter - Automated with Luma sync
- /feed - Newsletter digest with enrichment
- /date-night - Proactive date planning
- /interview - Plan deep-dive conversations

**System:**
- /token-usage - Cost tracking by model
- /bug - GitHub issues from context

### UI Features

**Chat Interface:**
- Voice input (tap/long-press modes)
- Sparkfile quick capture
- Image/file upload (iOS Safari compatible)
- Slash command autocomplete (usage-weighted)
- Auto-suggest response buttons (Day 86)
- Split-screen chat mode
- Code block copy with auto-copy
- Collapsible tool calls and pasted text

**Task Management:**
- Click-to-edit (tasks, projects, events, session titles)
- Due date picker with toast feedback
- Drag-and-drop phases
- Checkbox completion tracking

**Intelligence Features:**
- Memory Lane semantic search (Day 80)
- Push notifications for reminders (Day 74)
- iMessage inbox triage (Done/Snooze/Reply)
- Token usage analytics dashboard

**Themes & Display:**
- Dark/light/auto themes
- PWA with chat-first loading
- File browser with content search
- Admin health dashboard

### Integrations

**Email & Calendar:**
- Gmail (OAuth via credential system)
- Google Calendar (OAuth via credential system)
- Google Docs MCP

**Communication:**
- Discord (TypeScript bridge, webhook notifications)
- iMessage (Matrix bridge → direct MCP on Day 82)
- Twitter API (rate-limited, Day 87)

**Content & Events:**
- Luma (iCal events)
- Tally (form responses)

**Infrastructure:**
- Claude Memory (iframe proxy)
- 1Password CLI (backup credentials)
- Synology NAS (cert sync)
- DigitalOcean Spaces (backups)

## TECHNICAL STATISTICS

**Timeline:** 89 days (Oct 8 - Dec 29, 2025)
**Total Commits:** 5,000+

**Busiest Days:**
- Day 84 (Dec 24): 193 commits
- Day 83 (Dec 23): 187 commits
- Day 62 (Dec 2): 136 commits
- Day 80, 81 (Dec 20-21): 91 commits each

**System Scale:**
- 44+ agents
- 100+ skills
- 58+ slash commands
- 104+ SOPs
- 27 scheduled jobs
- 682+ reference files
- 221+ contacts processed
- 6 host-bridge services

**Performance Gains:**
- Context: 76% → 85% reduction
- Person research: 90% faster (60s → 5s quick mode)
- Batch processing: 86% faster (110s → 15s for 22 people)
- Newsletter prep: 70% faster (45min → 10min)
- Newsletter relevance: 68% improvement (0.54 → 0.91)

## PROBLEMS ENCOUNTERED & SOLUTIONS

### Technical Debt

**Problem:** 109 scripts accumulated by Day 52
**Solution:** Skills infrastructure with systematic review (37 archived in Week 5)

**Problem:** Orbit/tag mixing lasted 55 days
**Solution:** 7-phase migration separating relationship distance (orbits) from topic association (tags)

**Problem:** Dark-mode-first CSS only (Day 73)
**Solution:** Systematic light mode variable definitions

### Performance

**Problem:** Person research 30-60s per contact
**Solution:** Quick mode (3-5s) for daily refresh - 90% faster

**Problem:** 22 sequential recipients = 110s
**Solution:** Batch processing (15s) - 86% faster

**Problem:** Newsletter relevance 0.54 with snippets
**Solution:** Enrichment with full bodies - 0.91 score (68% improvement)

### Data Quality

**Problem:** 186 broken links after reorganization (Days 13-18)
**Solution:** Link healer agent with nightly automation

**Problem:** 21 person files with schema errors
**Solution:** Validation on Day 23 + Discord alerts for future issues

**Problem:** Knowledge library Phase 1 data loss (Day 74)
**Solution:** Restore commit + frontmatter schema as single source of truth

### Context Management

**Problem:** 23KB CLAUDE.md loaded every session
**Solution:** Modular architecture (Day 5: 76% reduction → Day 11: 85% total reduction)

**Problem:** Context bloat accumulation
**Solution:** Day 66 token optimization (3 include consolidations, 2 file merges)

### Integration Challenges

**Problem:** Python Discord bridge brittle
**Solution:** TypeScript rewrite in 8 hours (Day 4)

**Problem:** Claude Memory proxy routing
**Solution:** 6+ commits iterating on Caddy routes (Day 68)

**Problem:** iOS Safari upload issues
**Solution:** Immediate upload on selection (Day 57)

**Problem:** MCP CPU watchdog broke stdio
**Solution:** Immediate revert (Day 83) - lesson learned about stdio fragility

### Automation

**Problem:** Duplicate contacts from parallel processing (Day 1)
**Solution:** Deduplication logic before commits

**Problem:** Sync job overwrote manual status changes (Day 82)
**Solution:** Preserve manual overrides - users are source of truth

**Problem:** Token double-counting during streaming (Day 81)
**Solution:** Detect and exclude streaming chunks

## RECOMMENDED BUILD ORDER FOR PERSONALOS

Based on Andy's 89-day journey, here's the optimal build sequence:

### Phase 1: Foundation (Week 1-2)
1. Basic Laravel + PostgreSQL setup
2. Simple chat interface (React + Inertia)
3. Claude API integration (basic prompts)
4. File-based memory system (markdown + YAML frontmatter)
5. Basic commands (/overview, /eod, /remind)

### Phase 2: Agent System (Week 3-4)
1. Agent architecture (YAML-based agents)
2. 5-10 core agents (Strategic Advisor, Project Manager, Email Manager)
3. Context optimization patterns
4. Command consolidation

### Phase 3: Skills Infrastructure (Week 5-6)
1. **TypeScript + Bun skills framework**
2. Migrate bash scripts to skills
3. JSON output patterns
4. Core skills: workspace-tools, contact-tools, discord-tools

### Phase 4: Database Migration (Week 7-8)
1. Database schema (projects, tasks, people, events)
2. File → database import tools
3. API skills (tasks-api, projects-api, events-api)
4. Polymorphic associations

### Phase 5: MCP Integrations (Week 9-10)
1. Gmail MCP
2. Google Calendar MCP
3. Discord MCP
4. Credential system with encryption

### Phase 6: Job Queue (Week 11-12)
1. Bree scheduler setup
2. Core jobs (relationship-refresh, link-healer, documentation-health)
3. Monitoring and alerts

### Phase 7: Advanced Features (Week 13+)
1. Voice input
2. Memory Lane (semantic search)
3. Push notifications
4. Auto-suggest buttons
5. Team credentials

**Key Principle:** Build incrementally, test with real use, optimize based on actual pain points.

---

**Analysis completed from andy-timeline repository (Days 0-89)**
**Files analyzed:** README.md, timeline-curator.md, week-01 through week-10
**Total documentation:** 10 weekly logs + 2 core documents
