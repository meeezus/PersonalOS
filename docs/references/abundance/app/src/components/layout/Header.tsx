import { format } from 'date-fns';
import { Flame } from 'lucide-react';

interface HeaderProps {
  streak: number;
  weekNumber: number;
}

export const Header = ({ streak, weekNumber }: HeaderProps) => {
  const today = new Date();

  return (
    <header className="sticky top-0 bg-warrior-black/95 backdrop-blur-sm border-b border-warrior-subtle/30 px-4 py-3 z-40">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-warrior-gold tracking-wide">
            ABUNDANCE WARRIOR
          </h1>
          <p className="text-xs text-warrior-muted">
            {format(today, 'EEEE, MMMM d')} · Week {weekNumber}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-warrior-surface px-3 py-1.5 rounded-full">
            <Flame size={16} className="text-warrior-gold" />
            <span className="text-sm font-semibold text-warrior-white">{streak}</span>
          </div>
        )}
      </div>
    </header>
  );
};
