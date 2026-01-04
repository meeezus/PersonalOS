import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import IoriChat from '@/Components/IoriChat';
import TerminalPlaceholder from '@/Components/TerminalPlaceholder';
import { User } from '@/types';
import { Beaker, DollarSign, CreditCard } from 'lucide-react';

interface AITestProps {
    auth: {
        user: User;
    };
}

export default function AITest({ auth }: AITestProps) {
    return (
        <AppLayout user={auth.user}>
            <Head title="AI Testing" />

            <div className="flex flex-col h-[calc(100vh-2rem)] p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-[2px]">
                            <Beaker size={20} className="text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">
                                AI TESTING LAB
                            </h2>
                            <p className="text-xs font-mono text-white/40">
                                Compare Iori (API) vs Claude Code (Subscription)
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-[2px] text-red-400">
                            <DollarSign size={12} />
                            <span>Iori = API Credits</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-[2px] text-emerald-400">
                            <CreditCard size={12} />
                            <span>Claude Code = Subscription</span>
                        </div>
                    </div>
                </div>

                {/* Split View */}
                <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                    {/* Left: Iori Chat (API) */}
                    <div className="flex flex-col min-h-0">
                        <IoriChat title="Iori (API Credits)" />
                    </div>

                    {/* Right: Claude Code Terminal */}
                    <div className="flex flex-col min-h-0">
                        <TerminalPlaceholder title="Claude Code (Subscription)" />
                    </div>
                </div>

                {/* Footer Instructions */}
                <div className="mt-4 p-4 bg-white/[0.02] border border-white/10 rounded-[2px]">
                    <div className="grid grid-cols-2 gap-6 text-xs font-mono text-white/50">
                        <div>
                            <span className="text-emerald-400 font-bold">Iori Setup:</span>
                            <div className="mt-1">
                                1. Copy <code className="text-white/70">.env.example</code> to <code className="text-white/70">.env</code>
                                <br />
                                2. Add your <code className="text-white/70">ANTHROPIC_API_KEY</code>
                                <br />
                                3. Run <code className="text-white/70">cd agent && npm run dev</code>
                            </div>
                        </div>
                        <div>
                            <span className="text-purple-400 font-bold">Claude Code Setup:</span>
                            <div className="mt-1">
                                1. Configure MCP in <code className="text-white/70">~/.claude/settings.json</code>
                                <br />
                                2. Run <code className="text-white/70">cd ~/PersonalOS && claude</code>
                                <br />
                                3. Claude will auto-discover PersonalOS tools
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
