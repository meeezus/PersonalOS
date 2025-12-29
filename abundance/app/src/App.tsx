import { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { MorningRitual } from './components/morning/MorningRitual';
import { ActionDashboard } from './components/action/ActionDashboard';
import { EveningReflection } from './components/evening/EveningReflection';
import { WeeklyReview } from './components/weekly/WeeklyReview';
import { JourneySection } from './components/journey/JourneySection';
import { useAppStore } from './store/useAppStore';
import { TabType } from './types';

function App() {
  const {
    state,
    todayEntry,
    dailyTarget,
    updateMorning,
    updateAction,
    updateEvening,
    incrementEmails,
    decrementEmails,
    addResistanceMoment,
    addAbundanceEvidence,
    addJournalEntry,
    addIdentityStatement,
    addBlockEntry,
    addFutureSelfEntry,
    getWeeklyStats,
    saveWeeklyReview,
    getCurrentWeekNumber,
    getStreak,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('action');

  const weekNumber = getCurrentWeekNumber();
  const streak = getStreak();
  const weeklyStats = getWeeklyStats();

  const renderContent = () => {
    switch (activeTab) {
      case 'morning':
        return (
          <MorningRitual
            todayEntry={todayEntry}
            updateMorning={updateMorning}
          />
        );
      case 'action':
        return (
          <ActionDashboard
            todayEntry={todayEntry}
            dailyTarget={dailyTarget}
            weeklyStats={weeklyStats}
            incrementEmails={incrementEmails}
            decrementEmails={decrementEmails}
            updateAction={updateAction}
            addResistanceMoment={addResistanceMoment}
          />
        );
      case 'evening':
        return (
          <EveningReflection
            todayEntry={todayEntry}
            updateEvening={updateEvening}
          />
        );
      case 'weekly':
        return (
          <WeeklyReview
            weekNumber={weekNumber}
            weeklyStats={weeklyStats}
            currentWeekEntry={state.weeks[weekNumber.toString()]}
            saveWeeklyReview={saveWeeklyReview}
          />
        );
      case 'journey':
        return (
          <JourneySection
            mindset={state.mindset}
            addJournalEntry={addJournalEntry}
            addAbundanceEvidence={addAbundanceEvidence}
            addIdentityStatement={addIdentityStatement}
            addBlockEntry={addBlockEntry}
            addFutureSelfEntry={addFutureSelfEntry}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      streak={streak}
      weekNumber={weekNumber}
      morningComplete={todayEntry.morning.completed}
      eveningComplete={todayEntry.evening.completed}
    >
      {renderContent()}
    </AppShell>
  );
}

export default App;
