import React from 'react';
import { Terminal, Copy, CheckCircle2 } from 'lucide-react';

interface TerminalPlaceholderProps {
    title?: string;
}

export default function TerminalPlaceholder({ title = "Claude Code Terminal" }: TerminalPlaceholderProps) {
    const [copied, setCopied] = React.useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const commands = [
        {
            id: 'cd',
            label: '1. Navigate to PersonalOS',
            command: 'cd ~/PersonalOS',
        },
        {
            id: 'claude',
            label: '2. Start Claude Code',
            command: 'claude',
        },
    ];

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] border border-white/10 rounded-[2px]">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-[2px]">
                    <Terminal size={14} className="text-purple-400" />
                </div>
                <div>
                    <h3 className="text-sm font-display font-bold text-white">{title}</h3>
                    <p className="text-[10px] font-mono text-white/40">Uses your Claude subscription</p>
                </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                <div className="text-purple-400 mb-4">
                    # Run Claude Code with PersonalOS MCP
                </div>

                <div className="space-y-4">
                    {commands.map((cmd) => (
                        <div key={cmd.id} className="group">
                            <div className="text-white/40 text-xs mb-1">{cmd.label}</div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-[2px] p-2">
                                <code className="flex-1 text-emerald-400">{cmd.command}</code>
                                <button
                                    onClick={() => copyToClipboard(cmd.command, cmd.id)}
                                    className="p-1 text-white/30 hover:text-white transition-colors"
                                >
                                    {copied === cmd.id ? (
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                    ) : (
                                        <Copy size={14} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-3 bg-purple-500/5 border border-purple-500/20 rounded-[2px]">
                    <div className="text-purple-400 text-xs font-bold mb-2">MCP Tools Available:</div>
                    <div className="text-white/50 text-xs space-y-1">
                        <div>• get_goals, get_identity, get_observations</div>
                        <div>• get_today_plan, get_tasks, get_latest_episode</div>
                        <div>• log_observation, create_episode</div>
                        <div>• add_task, complete_task</div>
                    </div>
                </div>

                <div className="mt-4 text-white/30 text-xs">
                    <div className="text-yellow-500/80 mb-2">⚠️ MCP Setup Required:</div>
                    <div className="bg-white/5 p-2 rounded-[2px] text-[10px]">
                        Add to ~/.claude/settings.json:
                        <pre className="mt-1 text-emerald-400/80 overflow-x-auto">
{`{
  "mcpServers": {
    "personalos": {
      "command": "node",
      "args": ["~/PersonalOS/personalos/mcp-server/dist/index.js"]
    }
  }
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
