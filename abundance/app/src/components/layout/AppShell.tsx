import { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { TabType } from '../../types';

interface AppShellProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  streak: number;
  weekNumber: number;
  morningComplete: boolean;
  eveningComplete: boolean;
}

export const AppShell = ({
  children,
  activeTab,
  onTabChange,
  streak,
  weekNumber,
  morningComplete,
  eveningComplete,
}: AppShellProps) => {
  return (
    <div className="min-h-screen bg-warrior-black flex flex-col">
      <Header streak={streak} weekNumber={weekNumber} />
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <Navigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        morningComplete={morningComplete}
        eveningComplete={eveningComplete}
      />
    </div>
  );
};
