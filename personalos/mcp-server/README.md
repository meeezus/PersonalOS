# PersonalOS MCP Server

MCP (Model Context Protocol) server that exposes PersonalOS data to Claude Code.

## Tools Available

| Tool | Description |
|------|-------------|
| `get_goals` | Read Memory/goals.md |
| `get_identity` | Read Memory/identity.md |
| `get_observations` | Read recent observations |
| `get_latest_episode` | Read most recent episode log |
| `get_today_plan` | Parse today's plan from task files |
| `get_tasks` | Get unchecked tasks |
| `log_observation` | Append to observations.md |
| `create_episode` | Create new episode log |
| `add_task` | Add task to Today.md |
| `complete_task` | Mark task as done |

## Setup

```bash
cd personalos/mcp-server
npm install
npm run build
```

## Configure Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "personalos": {
      "command": "node",
      "args": ["/home/user/PersonalOS/personalos/mcp-server/dist/index.js"]
    }
  }
}
```

## Test with Inspector

```bash
npm run inspect
```

## Development

```bash
npm run dev
```
