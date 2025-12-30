import { motion } from 'framer-motion';
import { Sun, Swords, Moon, Mountain, Calendar } from 'lucide-react';
import { TabType } from '../../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  morningComplete: boolean;
  eveningComplete: boolean;
}

export const Navigation = ({
  activeTab,
  onTabChange,
  morningComplete,
  eveningComplete,
}: NavigationProps) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; complete?: boolean }[] = [
    { id: 'morning', label: 'Morning', icon: <Sun size={20} />, complete: morningComplete },
    { id: 'action', label: 'Action', icon: <Swords size={20} /> },
    { id: 'evening', label: 'Evening', icon: <Moon size={20} />, complete: eveningComplete },
    { id: 'journey', label: 'Journey', icon: <Mountain size={20} /> },
    { id: 'weekly', label: 'Weekly', icon: <Calendar size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-warrior-surface border-t border-warrior-subtle/50 px-2 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
              ${activeTab === tab.id
                ? 'text-warrior-gold'
                : 'text-warrior-muted hover:text-warrior-white'
              }
            `}
          >
            <div className="relative">
              {tab.icon}
              {tab.complete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-warrior-gold rounded-full"
                />
              )}
            </div>
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-warrior-gold/10 rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
