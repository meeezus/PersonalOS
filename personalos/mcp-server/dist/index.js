#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
import dayjs from "dayjs";
// ============================================
// PATHS
// ============================================
// Try multiple possible PersonalOS locations
function findPersonalOSRoot() {
    const possiblePaths = [
        process.env.PERSONALOS_ROOT,
        path.join(process.env.HOME || "", "PersonalOS"),
        "/home/user/PersonalOS",
    ].filter(Boolean);
    for (const p of possiblePaths) {
        if (fs.existsSync(path.join(p, "CLAUDE.md"))) {
            return p;
        }
    }
    // Default fallback
    return "/home/user/PersonalOS";
}
const PERSONALOS_ROOT = findPersonalOSRoot();
const PATHS = {
    claude: path.join(PERSONALOS_ROOT, "CLAUDE.md"),
    identity: path.join(PERSONALOS_ROOT, "Memory", "identity.md"),
    goals: path.join(PERSONALOS_ROOT, "Memory", "goals.md"),
    observations: path.join(PERSONALOS_ROOT, "Memory", "observations.md"),
    episodeLogs: path.join(PERSONALOS_ROOT, "Memory", "episode_logs"),
    tasksActive: path.join(PERSONALOS_ROOT, "Tasks", "Active"),
    tasksDaily: path.join(PERSONALOS_ROOT, "Tasks", "Daily"),
};
// ============================================
// FILE UTILITIES
// ============================================
function safeReadFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, "utf-8");
        }
        return "";
    }
    catch {
        return "";
    }
}
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
// ============================================
// CONTEXT READERS
// ============================================
function getGoals() {
    return safeReadFile(PATHS.goals);
}
function getIdentity() {
    return safeReadFile(PATHS.identity);
}
function getObservations(limit = 5) {
    const content = safeReadFile(PATHS.observations);
    if (!content)
        return "No observations logged yet.";
    // Split by ## headers and get last N entries
    const sections = content.split(/(?=^## \d{4}-\d{2}-\d{2})/m);
    const recent = sections.slice(-limit).join("\n");
    return recent || content;
}
function getLatestEpisode() {
    try {
        if (!fs.existsSync(PATHS.episodeLogs)) {
            return "No episode logs found.";
        }
        const files = fs
            .readdirSync(PATHS.episodeLogs)
            .filter((f) => f.endsWith(".md"))
            .sort()
            .reverse();
        if (files.length === 0) {
            return "No episode logs found.";
        }
        const latestFile = files[0];
        const filePath = path.join(PATHS.episodeLogs, latestFile);
        return fs.readFileSync(filePath, "utf-8");
    }
    catch {
        return "Error reading episode logs.";
    }
}
function getTodayPlan() {
    const today = dayjs();
    const patterns = [
        today.format("dddd, MMM D"),
        today.format("dddd MMM D"),
        today.format("MMM D"),
        today.format("YYYY-MM-DD"),
    ];
    const searchPaths = [PATHS.tasksActive, PERSONALOS_ROOT];
    for (const searchPath of searchPaths) {
        if (!fs.existsSync(searchPath))
            continue;
        const files = fs.readdirSync(searchPath).filter((f) => f.endsWith(".md"));
        for (const file of files) {
            const filePath = path.join(searchPath, file);
            try {
                const content = fs.readFileSync(filePath, "utf-8");
                const lines = content.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.startsWith("##")) {
                        const lineUpper = line.toUpperCase();
                        for (const pattern of patterns) {
                            if (lineUpper.includes(pattern.toUpperCase())) {
                                // Found today's section - extract until next ##
                                let section = line + "\n";
                                let j = i + 1;
                                while (j < lines.length && !lines[j].match(/^##\s/)) {
                                    section += lines[j] + "\n";
                                    j++;
                                }
                                return `From ${file}:\n\n${section}`;
                            }
                        }
                    }
                }
            }
            catch {
                continue;
            }
        }
    }
    return "No plan found for today.";
}
function getTasks() {
    const todayPlan = getTodayPlan();
    // Extract unchecked tasks
    const taskRegex = /^-\s*\[\s*\]\s*(.+)$/gm;
    const tasks = [];
    let match;
    while ((match = taskRegex.exec(todayPlan)) !== null) {
        if (match[1]) {
            tasks.push(match[1].trim());
        }
    }
    if (tasks.length === 0) {
        return "No unchecked tasks found for today.";
    }
    return `Unchecked tasks (${tasks.length}):\n${tasks.map((t) => `- [ ] ${t}`).join("\n")}`;
}
// ============================================
// WRITERS
// ============================================
function logObservation(content) {
    try {
        const timestamp = dayjs().format("YYYY-MM-DD HH:mm");
        const entry = `\n\n## ${timestamp}\n\n${content}`;
        if (!fs.existsSync(PATHS.observations)) {
            ensureDir(path.dirname(PATHS.observations));
            const header = `# Observations & Patterns\n\nLogged insights, patterns, and learnings.\n`;
            fs.writeFileSync(PATHS.observations, header + entry, "utf-8");
        }
        else {
            fs.appendFileSync(PATHS.observations, entry, "utf-8");
        }
        return `Observation logged at ${timestamp}`;
    }
    catch (error) {
        return `Failed to log observation: ${error}`;
    }
}
function createEpisode(title, content) {
    try {
        ensureDir(PATHS.episodeLogs);
        const timestamp = dayjs().format("YYYY-MM-DD_HHmm");
        const safeTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .substring(0, 50);
        const fileName = `${timestamp}_${safeTitle}.md`;
        const filePath = path.join(PATHS.episodeLogs, fileName);
        const fullContent = `# ${title}

**Date:** ${dayjs().format("dddd, MMMM D, YYYY [at] h:mm A")}

---

${content}

---

*Logged via PersonalOS MCP*
`;
        fs.writeFileSync(filePath, fullContent, "utf-8");
        return `Episode created: ${fileName}`;
    }
    catch (error) {
        return `Failed to create episode: ${error}`;
    }
}
function addTask(taskText, priority) {
    try {
        const todayPath = path.join(PATHS.tasksDaily, "Today.md");
        ensureDir(path.dirname(todayPath));
        const today = dayjs().format("dddd, MMMM D, YYYY");
        const priorityTag = priority ? ` [${priority.toUpperCase()}]` : "";
        const taskLine = `- [ ]${priorityTag} ${taskText}`;
        if (!fs.existsSync(todayPath)) {
            const content = `# Today - ${today}\n\n## Tasks\n\n${taskLine}\n`;
            fs.writeFileSync(todayPath, content, "utf-8");
        }
        else {
            let content = fs.readFileSync(todayPath, "utf-8");
            if (content.includes("## Tasks")) {
                content = content.replace(/(## Tasks\n\n)/, `$1${taskLine}\n`);
            }
            else {
                content += `\n\n## Tasks\n\n${taskLine}\n`;
            }
            fs.writeFileSync(todayPath, content, "utf-8");
        }
        return `Task added: ${taskText}`;
    }
    catch (error) {
        return `Failed to add task: ${error}`;
    }
}
function completeTask(taskText) {
    const searchPaths = [
        path.join(PATHS.tasksActive, "Unified_Week1_Plan.md"),
        path.join(PATHS.tasksDaily, "Today.md"),
    ];
    for (const searchPath of searchPaths) {
        if (!fs.existsSync(searchPath))
            continue;
        try {
            let content = fs.readFileSync(searchPath, "utf-8");
            // Escape special regex characters in task text
            const escapedTask = taskText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const uncheckedPattern = new RegExp(`- \\[ \\] ${escapedTask}`, "i");
            if (uncheckedPattern.test(content)) {
                content = content.replace(uncheckedPattern, `- [x] ${taskText}`);
                fs.writeFileSync(searchPath, content, "utf-8");
                return `Task completed in ${path.basename(searchPath)}: ${taskText}`;
            }
        }
        catch {
            continue;
        }
    }
    return `Task not found: ${taskText}`;
}
// ============================================
// MCP SERVER
// ============================================
const server = new Server({
    name: "personalos",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define tool schemas
const logObservationSchema = z.object({
    content: z.string().describe("The observation or pattern to log"),
});
const createEpisodeSchema = z.object({
    title: z.string().describe("Title for the episode log"),
    content: z.string().describe("Content/summary of what happened"),
});
const addTaskSchema = z.object({
    task: z.string().describe("The task to add"),
    priority: z
        .string()
        .optional()
        .describe("Priority level: high, medium, or low"),
});
const completeTaskSchema = z.object({
    task: z.string().describe("The exact task text to mark as complete"),
});
const getObservationsSchema = z.object({
    limit: z
        .number()
        .optional()
        .default(5)
        .describe("Number of recent observations to retrieve"),
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_goals",
                description: "Get current goals and objectives from Memory/goals.md. Use this to understand what Michael is working toward.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "get_identity",
                description: "Get the AI assistant identity and philosophy from Memory/identity.md.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "get_observations",
                description: "Get recent observations and patterns from Memory/observations.md. These are logged insights about ADHD patterns, resistance, wins, etc.",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            description: "Number of recent observations to retrieve",
                            default: 5,
                        },
                    },
                    required: [],
                },
            },
            {
                name: "get_latest_episode",
                description: "Get the most recent episode log from Memory/episode_logs/. Episodes capture session context and what happened.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "get_today_plan",
                description: "Get today's plan from the active task files. Shows scheduled blocks and tasks for today.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "get_tasks",
                description: "Get unchecked tasks from today's plan. Quick way to see what needs to be done.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "log_observation",
                description: "Log an observation, pattern, or insight to Memory/observations.md. Use this to capture ADHD patterns, resistance moments, wins, or learnings.",
                inputSchema: {
                    type: "object",
                    properties: {
                        content: {
                            type: "string",
                            description: "The observation or pattern to log",
                        },
                    },
                    required: ["content"],
                },
            },
            {
                name: "create_episode",
                description: "Create a new episode log in Memory/episode_logs/. Use this to capture session context, what was discussed, and where we left off.",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            description: "Title for the episode log",
                        },
                        content: {
                            type: "string",
                            description: "Content/summary of what happened",
                        },
                    },
                    required: ["title", "content"],
                },
            },
            {
                name: "add_task",
                description: "Add a new task to Today.md. Quick capture for tasks that come up during conversation.",
                inputSchema: {
                    type: "object",
                    properties: {
                        task: {
                            type: "string",
                            description: "The task to add",
                        },
                        priority: {
                            type: "string",
                            description: "Priority level: high, medium, or low",
                        },
                    },
                    required: ["task"],
                },
            },
            {
                name: "complete_task",
                description: "Mark a task as complete in the markdown files. Finds the task and checks it off.",
                inputSchema: {
                    type: "object",
                    properties: {
                        task: {
                            type: "string",
                            description: "The exact task text to mark as complete",
                        },
                    },
                    required: ["task"],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "get_goals": {
                const goals = getGoals();
                return {
                    content: [{ type: "text", text: goals || "No goals found." }],
                };
            }
            case "get_identity": {
                const identity = getIdentity();
                return {
                    content: [
                        { type: "text", text: identity || "No identity file found." },
                    ],
                };
            }
            case "get_observations": {
                const parsed = getObservationsSchema.parse(args);
                const observations = getObservations(parsed.limit);
                return {
                    content: [{ type: "text", text: observations }],
                };
            }
            case "get_latest_episode": {
                const episode = getLatestEpisode();
                return {
                    content: [{ type: "text", text: episode }],
                };
            }
            case "get_today_plan": {
                const plan = getTodayPlan();
                return {
                    content: [{ type: "text", text: plan }],
                };
            }
            case "get_tasks": {
                const tasks = getTasks();
                return {
                    content: [{ type: "text", text: tasks }],
                };
            }
            case "log_observation": {
                const parsed = logObservationSchema.parse(args);
                const result = logObservation(parsed.content);
                return {
                    content: [{ type: "text", text: result }],
                };
            }
            case "create_episode": {
                const parsed = createEpisodeSchema.parse(args);
                const result = createEpisode(parsed.title, parsed.content);
                return {
                    content: [{ type: "text", text: result }],
                };
            }
            case "add_task": {
                const parsed = addTaskSchema.parse(args);
                const result = addTask(parsed.task, parsed.priority);
                return {
                    content: [{ type: "text", text: result }],
                };
            }
            case "complete_task": {
                const parsed = completeTaskSchema.parse(args);
                const result = completeTask(parsed.task);
                return {
                    content: [{ type: "text", text: result }],
                };
            }
            default:
                return {
                    isError: true,
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                };
        }
    }
    catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Error executing ${name}: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("PersonalOS MCP server running on stdio");
}
main().catch((error) => {
    console.error("Failed to start PersonalOS MCP server:", error);
    process.exit(1);
});
