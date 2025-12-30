import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Goal } from '@/types';

interface GoalItemProps {
    title: string;
    current: number;
    target: number;
    trend?: string;
    subtext?: string;
}

function GoalItem({ title, current, target, trend, subtext }: GoalItemProps) {
    const percentage = Math.min((current / target) * 100, 100);

    return (
        <div className="mb-6 last:mb-0">
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold font-display uppercase tracking-widest text-white/80">
                    {title}
                </span>
                <div className="flex gap-3 text-xs font-mono">
                    <span className="text-white">
                        {current} / {target}
                    </span>
                    {trend && (
                        <span
                            className={`px-1.5 py-0.5 rounded-[2px] bg-white/5 border border-white/10 text-[10px] ${
                                trend.startsWith('+') ? 'text-emerald-400' : 'text-white/40'
                            }`}
                        >
                            {trend}
                        </span>
                    )}
                </div>
            </div>
            {/* Progress Bar Container */}
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                <div
                    className="h-full bg-white transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {subtext && (
                <div className="text-[10px] text-white/30 mt-1.5 font-mono">// {subtext}</div>
            )}
        </div>
    );
}

interface GoalWidgetProps {
    goals?: Goal[];
}

export default function GoalWidget({ goals }: GoalWidgetProps) {
    // Use provided goals or default demo data
    const displayGoals = goals && goals.length > 0 ? goals : [
        { id: 1, name: 'Decopon Emails', current_value: 0, target_value: 90, unit: 'emails', start_date: '', end_date: '' },
        { id: 2, name: 'Tweets Posted', current_value: 0, target_value: 15, unit: 'tweets', start_date: '', end_date: '' },
        { id: 3, name: 'BJJ Sessions', current_value: 0, target_value: 2, unit: 'sessions', start_date: '', end_date: '' },
    ];

    const getTrend = (goal: Goal) => {
        const percentage = (goal.current_value / goal.target_value) * 100;
        if (percentage >= 80) return 'ON TRACK';
        if (percentage >= 50) return 'PROGRESSING';
        return 'STARTING';
    };

    const getSubtext = (goal: Goal) => {
        if (goal.name.toLowerCase().includes('email')) return 'TARGET: 20/DAY TUE-THU';
        if (goal.name.toLowerCase().includes('tweet')) return 'CONSISTENCY > PERFECTION';
        if (goal.name.toLowerCase().includes('bjj')) return 'SIX BLADES: MON/WED';
        return goal.unit.toUpperCase();
    };

    return (
        <div className="stealth-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle size={16} />
                </div>
                <div>
                    <h3 className="font-bold font-display text-white tracking-wide text-sm">
                        WEEK 1 TARGETS
                    </h3>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">
                        MISSION: CONTENT & OUTREACH
                    </div>
                </div>
            </div>

            {displayGoals.map((goal) => (
                <GoalItem
                    key={goal.id}
                    title={goal.name}
                    current={goal.current_value}
                    target={goal.target_value}
                    trend={getTrend(goal)}
                    subtext={getSubtext(goal)}
                />
            ))}
        </div>
    );
}
