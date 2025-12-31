import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GoalWidget from '@/Components/GoalWidget';
import OuraWidget from '@/Components/OuraWidget';
import { Clock, RefreshCw, Calendar, Mail, CheckCircle2, Circle, Zap } from 'lucide-react';
import { Goal, Task, Contact, User } from '@/types';

interface OuraData {
    date: string;
    readiness_score: number | null;
    sleep_score: number | null;
    activity_score: number | null;
    total_sleep_duration: number | null;
    steps: number | null;
    resting_heart_rate: number | null;
    hrv_average: number | null;
}

interface OuraInsights {
    energyLevel: 'high' | 'medium' | 'low' | 'unknown';
    recommendedTaskTypes: string[];
    trainingRecommendation: string | null;
    patterns: string[];
    currentData: {
        date: string;
        readiness: number | null;
        sleep: number | null;
        activity: number | null;
        sleepDuration: number | null;
        steps: number | null;
    } | null;
}

interface DashboardProps {
    auth: {
        user: User;
    };
    goals: Goal[];
    tasks: Task[];
    contacts: Contact[];
    ouraData?: OuraData | null;
    ouraInsights?: OuraInsights | null;
}

export default function Dashboard({ auth, goals, tasks, contacts, ouraData, ouraInsights }: DashboardProps) {
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [localOuraData, setLocalOuraData] = React.useState<OuraData | null>(ouraData || null);
    const [localOuraInsights, setLocalOuraInsights] = React.useState<OuraInsights | null>(ouraInsights || null);
    const [isOuraLoading, setIsOuraLoading] = React.useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleOuraSync = async () => {
        setIsOuraLoading(true);
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Sync data from Oura using window.axios (which has CSRF configured)
            await window.axios.post('/api/oura/sync');

            // Fetch the latest data
            const [dataRes, insightsRes] = await Promise.all([
                window.axios.get('/api/oura/latest'),
                window.axios.get('/api/oura/insights'),
            ]);

            setLocalOuraData(dataRes.data);
            setLocalOuraInsights(insightsRes.data);
        } catch (error: any) {
            console.error('Failed to sync Oura data:', error?.response?.data || error);
        }

        await minLoadTime;
        setIsOuraLoading(false);
    };

    const isCompleted = (task: Task) => task.completed_at !== null;
    const highPriorityTasks = tasks?.filter(t => !isCompleted(t) && t.priority === 'high') || [];
    const todayTasks = highPriorityTasks.slice(0, 3);

    const formatDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).toUpperCase();
    };

    const formatTime = () => {
        return new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Command Center" />

            <div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto">
                {/* Header / Brief Status */}
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white mb-2">
                            COMMAND CENTER
                        </h2>
                        <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-[2px] text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                SOVEREIGN MODE
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{formatDate()} // {formatTime()}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-[2px] text-xs font-mono text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'SYNCING...' : 'REFRESH STATUS'}
                    </button>
                </div>

                {/* Overview Card */}
                <div className="stealth-card p-6 mb-8 relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex items-start gap-4">
                        <div className="mt-1 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-[2px] text-emerald-500">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold font-display text-white mb-2 tracking-wide">
                                DUAL MISSION LAUNCH
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm max-w-4xl font-light">
                                <strong className="text-white">Launch Day for DecoponATX.</strong> Primary objective is building momentum with 50 contacts and 15 emails sent.
                                Musha Shugyo content rhythm is established. BJJ at noon provides the physical break needed for afternoon execution.
                            </p>
                            <div className="mt-4 text-xs font-mono text-emerald-500/80 border-l border-emerald-500/20 pl-3">
                                DIRECTIVE: REVENUE NOW. DON'T WAIT.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Oura Recovery Widget */}
                <OuraWidget
                    data={localOuraData}
                    insights={localOuraInsights}
                    onSync={handleOuraSync}
                    isLoading={isOuraLoading}
                />

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column (Priorities) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Focus & Recommendations */}
                        <div className="stealth-card p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="text-emerald-500">
                                        <span className="font-mono text-lg font-bold">!</span>
                                    </div>
                                    <h3 className="font-bold font-display text-white tracking-wide text-sm">
                                        CRITICAL ACTIONS
                                    </h3>
                                </div>
                                <span className="text-[10px] font-mono text-white/30">PRIORITY QUEUE</span>
                            </div>

                            {/* Top Priorities Section */}
                            <div className="mb-8">
                                <h4 className="text-white/40 text-[10px] font-bold font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                                    TODAY'S TARGETS
                                </h4>
                                <div className="space-y-2">
                                    {todayTasks.length > 0 ? (
                                        todayTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`p-4 rounded-[2px] border flex items-start gap-4 transition-all group cursor-pointer ${
                                                    isCompleted(task)
                                                        ? 'bg-white/5 border-white/10 opacity-50'
                                                        : 'bg-[#0F0F0F] border-white/5 hover:border-emerald-500/30'
                                                }`}
                                            >
                                                <div className="mt-0.5 text-emerald-500">
                                                    {isCompleted(task) ? (
                                                        <CheckCircle2 size={16} />
                                                    ) : (
                                                        <Circle size={16} className="text-white/20 group-hover:text-emerald-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${
                                                        isCompleted(task)
                                                            ? 'text-white/40 line-through decoration-white/20'
                                                            : 'text-white'
                                                    }`}>
                                                        {task.title}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-white/30 font-mono text-xs border border-dashed border-white/10 rounded-[2px]">
                                            No high priority tasks remaining. Good work.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recommendations Section */}
                            <div>
                                <h4 className="text-white/40 text-[10px] font-bold font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                                    CO-PILOT INTEL
                                </h4>
                                <div className="space-y-2">
                                    <div className="group relative p-4 rounded-[2px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all flex gap-4 items-start">
                                        <div className="w-5 h-5 rounded-sm bg-white/10 text-white/60 font-mono font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h5 className="text-white text-sm font-bold font-display tracking-wide">
                                                    Execute outreach batch 1
                                                </h5>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-red-500/10 text-red-400 border border-red-500/20">
                                                        HIGH IMPACT
                                                    </span>
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        ⚡ 95%
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-white/50 text-xs mt-1 font-light">
                                                1:30-2:30pm block. Don't overthink tools.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <GoalWidget goals={goals} />
                    </div>

                    {/* Right Column (Schedule, Email, etc) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Time Allocation */}
                        <div className="stealth-card p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                <Calendar className="text-white/40" size={16} />
                                <h3 className="font-bold font-display text-white tracking-wide text-sm">
                                    TIME ALLOCATION
                                </h3>
                            </div>
                            <div className="space-y-3 mb-8 text-xs font-mono text-emerald-500/80 bg-emerald-900/10 p-4 rounded-[2px] border border-emerald-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                    <span>MUSHA SHUGYO: 1H 45M / DAY</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                    <span>DECOPONATX: 6-8H / DAY</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                    <span>TRAINING: 1H (MON/WED)</span>
                                </div>
                            </div>
                            <div className="relative space-y-6 pl-4 before:absolute before:left-[5px] before:top-2 before:h-full before:w-[1px] before:bg-white/10">
                                <div className="relative pl-6 group">
                                    <div className="absolute left-[-2px] top-1.5 w-[15px] h-[1px] bg-white/20"></div>
                                    <div className="text-xs text-white/30 font-mono mb-1">07:00</div>
                                    <div className="text-white font-bold font-display text-sm group-hover:text-emerald-400 transition-colors">
                                        Musha Shugyo Content Block
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-white/40 mt-1 font-mono uppercase tracking-wide">
                                        <Clock size={10} /> 1.5h
                                    </div>
                                </div>
                                <div className="relative pl-6 group">
                                    <div className="absolute left-[-2px] top-1.5 w-[15px] h-[1px] bg-emerald-500"></div>
                                    <div className="text-xs text-white/30 font-mono mb-1">12:00</div>
                                    <div className="text-white font-bold font-display text-sm group-hover:text-emerald-400 transition-colors">
                                        BJJ Training
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-white/40 mt-1 font-mono uppercase tracking-wide">
                                        <Clock size={10} /> 1h // Six Blades
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decopon Outreach */}
                        <div className="stealth-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-white/40" size={16} />
                                    <h3 className="font-bold font-display text-white tracking-wide text-sm">
                                        DECOPON OUTREACH
                                    </h3>
                                </div>
                                <span className="text-2xl font-bold font-display text-white">
                                    0<span className="text-white/30 text-lg">/90</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-6">
                                <div className="bg-white/5 border border-white/10 rounded-[2px] p-3 text-center">
                                    <div className="text-white font-bold text-lg font-display">50</div>
                                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono mt-1">
                                        PROSPECTS
                                    </div>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2px] p-3 text-center">
                                    <div className="text-emerald-400 font-bold text-lg font-display">0</div>
                                    <div className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-mono mt-1">
                                        REPLIES
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-[2px] p-3 text-center">
                                    <div className="text-white font-bold text-lg font-display">0</div>
                                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono mt-1">
                                        CALLS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
