import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { User } from '@/types';

interface PlaceholderProps {
    auth: {
        user: User;
    };
    title: string;
}

export default function Placeholder({ auth, title }: PlaceholderProps) {
    return (
        <AppLayout user={auth.user}>
            <Head title={title} />

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="stealth-card p-12 text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center">
                        <span className="text-2xl text-white/40">⚡</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-wide">
                        {title.toUpperCase()}
                    </h2>
                    <p className="text-white/40 font-mono text-xs">
                        // MODULE UNDER CONSTRUCTION
                    </p>
                    <div className="mt-6 text-[10px] text-emerald-500/60 font-mono">
                        COMING SOON IN v1.1
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
