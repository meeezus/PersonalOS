import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, AlertTriangle, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { DayEntry, ResistanceMoment } from '../../types';
import { ProgressRing } from '../shared/ProgressRing';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { WarriorQuote } from '../shared/WarriorQuote';
import { QuickRitual } from './QuickRitual';
import { ResistanceModal } from './ResistanceModal';
import { getRandomQuote } from '../../utils/quotes';

interface ActionDashboardProps {
  todayEntry: DayEntry;
  dailyTarget: number;
  weeklyStats: {
    totalEmails: number;
    totalReplies: number;
    totalCalls: number;
    totalEvents: number;
    totalRevenue: number;
    weeklyTarget: number;
  };
  incrementEmails: () => void;
  decrementEmails: () => void;
  updateAction: (updates: Partial<DayEntry['action']>) => void;
  addResistanceMoment: (moment: Omit<ResistanceMoment, 'id' | 'timestamp'>) => void;
}

export const ActionDashboard = ({
  todayEntry,
  dailyTarget,
  weeklyStats,
  incrementEmails,
  decrementEmails,
  updateAction,
  addResistanceMoment,
}: ActionDashboardProps) => {
  const [showResistanceModal, setShowResistanceModal] = useState(false);
  const [showResultInput, setShowResultInput] = useState<'replies' | 'calls' | 'events' | 'revenue' | null>(null);

  const { emailsSent } = todayEntry.action;
  const dailyProgress = (emailsSent / dailyTarget) * 100;
  const weeklyProgress = (weeklyStats.totalEmails / weeklyStats.weeklyTarget) * 100;

  const handleResistanceComplete = (data: {
    whatVoiceSaid: string;
    protocolFollowed: boolean;
    actedAnyway: boolean;
    notes?: string;
  }) => {
    addResistanceMoment({
      ...data,
      emailNumber: emailsSent + 1,
    });
    if (data.actedAnyway) {
      incrementEmails();
    }
    setShowResistanceModal(false);
  };

  const handleResultUpdate = (field: 'replies' | 'calls' | 'events' | 'revenue', value: number) => {
    const fieldMap = {
      replies: 'repliesReceived',
      calls: 'discoveryCallsBooked',
      events: 'eventsClosed',
      revenue: 'revenueGenerated',
    } as const;
    updateAction({ [fieldMap[field]]: value });
    setShowResultInput(null);
  };

  return (
    <div className="space-y-6">
      {/* Daily Email Counter */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-warrior-white">Today's Outreach</h2>
            <p className="text-sm text-warrior-muted">
              {emailsSent} of {dailyTarget} emails
            </p>
          </div>
          <ProgressRing progress={dailyProgress} size={80}>
            <div className="text-center">
              <span className="text-2xl font-bold text-warrior-gold">{emailsSent}</span>
            </div>
          </ProgressRing>
        </div>

        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={decrementEmails}
            disabled={emailsSent === 0}
            className="w-14 h-14 bg-warrior-elevated rounded-full flex items-center justify-center text-warrior-muted hover:text-warrior-white disabled:opacity-50 transition-colors"
          >
            <Minus size={24} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={incrementEmails}
            className="w-24 h-24 bg-warrior-gold rounded-full flex items-center justify-center text-warrior-black hover:bg-warrior-goldMuted transition-colors shadow-lg"
          >
            <Plus size={40} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowResistanceModal(true)}
            className="w-14 h-14 bg-warrior-elevated rounded-full flex items-center justify-center text-warrior-red hover:bg-warrior-red hover:text-warrior-white transition-colors"
          >
            <AlertTriangle size={24} />
          </motion.button>
        </div>

        <p className="text-center text-xs text-warrior-muted mt-4">
          Tap + to log an email · Tap ⚠ if resistance shows up
        </p>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-warrior-muted uppercase tracking-wider">
              Weekly Progress
            </h3>
            <p className="text-2xl font-bold text-warrior-white mt-1">
              {weeklyStats.totalEmails} <span className="text-warrior-muted text-lg">/ 90</span>
            </p>
          </div>
          <ProgressRing progress={weeklyProgress} size={60} strokeWidth={6}>
            <span className="text-xs font-bold text-warrior-gold">
              {Math.round(weeklyProgress)}%
            </span>
          </ProgressRing>
        </div>
        <div className="mt-3 h-2 bg-warrior-elevated rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(weeklyProgress, 100)}%` }}
            className="h-full bg-warrior-gold rounded-full"
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-warrior-muted mt-2">
          {90 - weeklyStats.totalEmails} emails remaining this week
        </p>
      </Card>

      {/* Quick Ritual */}
      <QuickRitual />

      {/* Results Tracking */}
      <Card>
        <h3 className="text-sm font-semibold text-warrior-muted uppercase tracking-wider mb-4">
          Results Tracker
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ResultBox
            icon={<Mail size={18} />}
            label="Replies"
            value={todayEntry.action.repliesReceived}
            weeklyValue={weeklyStats.totalReplies}
            onEdit={() => setShowResultInput('replies')}
          />
          <ResultBox
            icon={<Phone size={18} />}
            label="Calls Booked"
            value={todayEntry.action.discoveryCallsBooked}
            weeklyValue={weeklyStats.totalCalls}
            onEdit={() => setShowResultInput('calls')}
          />
          <ResultBox
            icon={<Calendar size={18} />}
            label="Events Closed"
            value={todayEntry.action.eventsClosed}
            weeklyValue={weeklyStats.totalEvents}
            onEdit={() => setShowResultInput('events')}
          />
          <ResultBox
            icon={<DollarSign size={18} />}
            label="Revenue"
            value={todayEntry.action.revenueGenerated}
            weeklyValue={weeklyStats.totalRevenue}
            isCurrency
            onEdit={() => setShowResultInput('revenue')}
          />
        </div>
      </Card>

      {/* Resistance Moments Today */}
      {todayEntry.action.resistanceMoments.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-warrior-muted uppercase tracking-wider mb-3">
            Resistance Faced Today
          </h3>
          <div className="space-y-2">
            {todayEntry.action.resistanceMoments.map((moment, index) => (
              <div
                key={moment.id}
                className="flex items-center gap-3 text-sm p-2 bg-warrior-elevated rounded-lg"
              >
                <span className={`w-2 h-2 rounded-full ${moment.actedAnyway ? 'bg-warrior-gold' : 'bg-warrior-red'}`} />
                <span className="text-warrior-muted">Email #{moment.emailNumber}</span>
                <span className="text-warrior-white flex-1 truncate">
                  {moment.actedAnyway ? 'Acted anyway' : 'Collapsed'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-warrior-gold mt-3">
            {todayEntry.action.resistanceMoments.filter(m => m.actedAnyway).length} of{' '}
            {todayEntry.action.resistanceMoments.length} resistance moments conquered
          </p>
        </Card>
      )}

      {/* Daily Quote */}
      <Card>
        <WarriorQuote quote={getRandomQuote('resistance')} />
      </Card>

      {/* Result Input Modal */}
      {showResultInput && (
        <ResultInputModal
          type={showResultInput}
          currentValue={
            showResultInput === 'replies'
              ? todayEntry.action.repliesReceived
              : showResultInput === 'calls'
              ? todayEntry.action.discoveryCallsBooked
              : showResultInput === 'events'
              ? todayEntry.action.eventsClosed
              : todayEntry.action.revenueGenerated
          }
          onSave={(value) => handleResultUpdate(showResultInput, value)}
          onClose={() => setShowResultInput(null)}
        />
      )}

      {/* Resistance Modal */}
      <ResistanceModal
        isOpen={showResistanceModal}
        onClose={() => setShowResistanceModal(false)}
        emailNumber={emailsSent + 1}
        onComplete={handleResistanceComplete}
      />
    </div>
  );
};

interface ResultBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  weeklyValue: number;
  isCurrency?: boolean;
  onEdit: () => void;
}

const ResultBox = ({ icon, label, value, weeklyValue, isCurrency, onEdit }: ResultBoxProps) => (
  <button
    onClick={onEdit}
    className="bg-warrior-elevated p-3 rounded-lg text-left hover:bg-warrior-subtle transition-colors"
  >
    <div className="flex items-center gap-2 text-warrior-muted mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <div className="text-lg font-bold text-warrior-white">
      {isCurrency ? `$${value.toLocaleString()}` : value}
    </div>
    <div className="text-xs text-warrior-muted">
      Week: {isCurrency ? `$${weeklyValue.toLocaleString()}` : weeklyValue}
    </div>
  </button>
);

interface ResultInputModalProps {
  type: 'replies' | 'calls' | 'events' | 'revenue';
  currentValue: number;
  onSave: (value: number) => void;
  onClose: () => void;
}

const ResultInputModal = ({ type, currentValue, onSave, onClose }: ResultInputModalProps) => {
  const [value, setValue] = useState(currentValue.toString());

  const labels = {
    replies: 'Replies Received',
    calls: 'Discovery Calls Booked',
    events: 'Events Closed',
    revenue: 'Revenue Generated',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-warrior-surface rounded-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-warrior-white mb-4">{labels[type]}</h3>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-warrior-elevated border border-warrior-subtle rounded-lg px-4 py-3 text-warrior-white text-2xl text-center focus:outline-none focus:border-warrior-gold"
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button onClick={() => onSave(Number(value) || 0)} fullWidth>
            Save
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
