import React, { PropsWithChildren } from 'react';
import Sidebar from '@/Components/Sidebar';

interface AppLayoutProps extends PropsWithChildren {
    user: {
        name: string;
        email: string;
    };
}

export default function AppLayout({ children, user }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-[#050505] text-[#E5E5E5] font-sans relative">
            {/* Noise Overlay */}
            <div className="noise-overlay"></div>

            {/* Mist Gradient */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-mist-gradient pointer-events-none z-0"></div>

            {/* Content wrapper */}
            <div className="flex w-full h-full relative z-10">
                <Sidebar user={user} />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
