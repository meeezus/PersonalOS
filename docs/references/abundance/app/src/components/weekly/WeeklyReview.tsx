import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, Brain, Heart, Check } from 'lucide-react';
import { WeekEntry } from '../../types';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { TextArea } from '../shared/TextArea';
import { ProgressRing } from '../shared/ProgressRing';
import { WarriorQuote } from '../shared/WarriorQuote';
import { getRandomQuote } from '../../utils/quotes';

interface WeeklyReviewProps {
  weekNumber: number;
  weeklyStats: {
    totalEmails: number;
    totalReplies: number;
    totalCalls: number;
    totalEvents: number;
    totalRevenue: number;
    weeklyTarget: number;
    replyRate: number;
  };
  currentWeekEntry?: WeekEntry;
  saveWeeklyReview: (weekNumber: number, review: Partial<WeekEntry>) => void;
}

const shadowPrompts = [
  "When did I want to scatter my energy across multiple projects instead of focusing?",
  "When did I seek external validation or guru guidance instead of trusting myself?",
  "When did the 'helper identity' show up - focusing on Tricia's business instead of my own capability?",
  "What did the voice of doubt say most frequently this week?",
  "When did I use 'research' or 'preparation' as an excuse to avoid action?",
];

const moneyPrompts = [
  "What did I believe about money this week that held me back?",
  "Did I send emails from scarcity ('please respond') or abundance ('I offer value')?",
  "What would I do differently if I truly believed I could make $10K/month easily?",
  "How did my family's money story show up in my behavior this week?",
];

export const WeeklyReview = ({
  weekNumber,
  weeklyStats,
  currentWeekEntry,
  saveWeeklyReview,
}: WeeklyReviewProps) => {
  const [step, setStep] = useState<'overview' | 'patterns' | 'identity' | 'shadow' | 'money' | 'complete'>(() => {
    if (currentWeekEntry?.completed) return 'complete';
    return 'overview';
  });

  const [patterns, setPatterns] = useState(currentWeekEntry?.patternsObserved || '');
  const [identityScale, setIdentityScale] = useState(currentWeekEntry?.identityScale || 5);
  const [shadowNotes, setShadowNotes] = useState(currentWeekEntry?.shadowWorkNotes || '');
  const [moneyReflection, setMoneyReflection] = useState(currentWeekEntry?.moneyReflection || '');

  const progress = (weeklyStats.totalEmails / weeklyStats.weeklyTarget) * 100;
  const targetMet = weeklyStats.totalEmails >= weeklyStats.weeklyTarget;

  const handleSave = () => {
    saveWeeklyReview(weekNumber, {
      patternsObserved: patterns,
      identityScale,
      shadowWorkNotes: shadowNotes,
      moneyReflection,
    });
    setStep('complete');
  };

  if (step === 'complete' || currentWeekEntry?.completed) {
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-warrior-gold/20 rounded-full mb-4"
          >
            <Check size={40} className="text-warrior-gold" />
          </motion.div>
          <h2 className="text-2xl font-bold text-warrior-white mb-2">
            Week {weekNumber} Complete
          </h2>
          <p className="text-warrior-muted">
            The warrior reflects. The journey continues.
          </p>
        </div>

        <Card highlight>
          <WarriorQuote quote={getRandomQuote('general')} />
        </Card>

        <WeekStats weeklyStats={weeklyStats} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-warrior-gold/20 rounded-full flex items-center justify-center">
          <Calendar size={20} className="text-warrior-gold" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-warrior-white">Week {weekNumber} Deep Work</h2>
          <p className="text-sm text-warrior-muted">Sunday reflection · 30 minutes</p>
        </div>
      </div>

      {step === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <WeekStats weeklyStats={weeklyStats} />

          <Card highlight={targetMet} padding="lg">
            <div className="text-center">
              {targetMet ? (
                <>
                  <h3 className="text-2xl font-bold text-warrior-gold mb-2">
                    TARGET MET
                  </h3>
                  <p className="text-warrior-white">
                    You sent {weeklyStats.totalEmails} emails. You proved you can make shit happen.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-warrior-white mb-2">
                    {weeklyStats.totalEmails} of 90 Emails
                  </h3>
                  <p className="text-warrior-muted">
                    {90 - weeklyStats.totalEmails} short of target. What got in the way?
                  </p>
                </>
              )}
            </div>
          </Card>

          <Button onClick={() => setStep('patterns')} fullWidth>
            Begin Deep Work
          </Button>
        </motion.div>
      )}

      {step === 'patterns' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={18} className="text-warrior-gold" />
              <h3 className="font-semibold text-warrior-white">Pattern Recognition</h3>
            </div>
            <TextArea
              label="When did you want to scatter, distract, or seek gurus?"
              hint="Notice the patterns without judgment"
              placeholder="I noticed I wanted to distract when..."
              value={patterns}
              onChange={(e) => setPatterns(e.target.value)}
              rows={5}
            />
          </Card>

          <Button onClick={() => setStep('identity')} disabled={!patterns.trim()} fullWidth>
            Continue
          </Button>
        </motion.div>
      )}

      {step === 'identity' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-warrior-gold" />
              <h3 className="font-semibold text-warrior-white">Identity Shift</h3>
            </div>
            <p className="text-sm text-warrior-muted mb-6">
              On a scale of 1-10, how much do you believe "I can make shit happen"?
            </p>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={identityScale}
                onChange={(e) => setIdentityScale(Number(e.target.value))}
                className="w-full h-2 bg-warrior-elevated rounded-lg appearance-none cursor-pointer accent-warrior-gold"
              />
              <div className="flex justify-between text-sm text-warrior-muted">
                <span>1 - Not at all</span>
                <span className="text-2xl font-bold text-warrior-gold">{identityScale}</span>
                <span>10 - Completely</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-sm text-warrior-muted">
              {identityScale <= 3 && "The belief is still forming. That's okay. Keep collecting evidence."}
              {identityScale > 3 && identityScale <= 6 && "You're in the messy middle. The voice still has power, but you're building evidence."}
              {identityScale > 6 && identityScale <= 8 && "Something is shifting. The old belief is losing its grip."}
              {identityScale > 8 && "You're starting to embody the new identity. Keep going."}
            </p>
          </Card>

          <Button onClick={() => setStep('shadow')} fullWidth>
            Continue
          </Button>
        </motion.div>
      )}

      {step === 'shadow' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={18} className="text-warrior-gold" />
              <h3 className="font-semibold text-warrior-white">Shadow Work</h3>
            </div>
            <div className="space-y-2 mb-4">
              {shadowPrompts.map((prompt, i) => (
                <p key={i} className="text-sm text-warrior-muted">• {prompt}</p>
              ))}
            </div>
            <TextArea
              placeholder="Let whatever comes up flow onto the page..."
              value={shadowNotes}
              onChange={(e) => setShadowNotes(e.target.value)}
              rows={6}
            />
          </Card>

          <Button onClick={() => setStep('money')} disabled={!shadowNotes.trim()} fullWidth>
            Continue
          </Button>
        </motion.div>
      )}

      {step === 'money' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-warrior-gold" />
              <h3 className="font-semibold text-warrior-white">Money Reflection</h3>
            </div>
            <div className="space-y-2 mb-4">
              {moneyPrompts.map((prompt, i) => (
                <p key={i} className="text-sm text-warrior-muted">• {prompt}</p>
              ))}
            </div>
            <TextArea
              placeholder="Reflect on your relationship with money this week..."
              value={moneyReflection}
              onChange={(e) => setMoneyReflection(e.target.value)}
              rows={6}
            />
          </Card>

          <Button onClick={handleSave} disabled={!moneyReflection.trim()} fullWidth>
            Complete Weekly Review
          </Button>
        </motion.div>
      )}
    </div>
  );
};

const WeekStats = ({ weeklyStats }: { weeklyStats: WeeklyReviewProps['weeklyStats'] }) => (
  <Card>
    <h3 className="text-sm font-semibold text-warrior-muted uppercase tracking-wider mb-4">
      Week Stats
    </h3>
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-3xl font-bold text-warrior-white">{weeklyStats.totalEmails}</p>
        <p className="text-sm text-warrior-muted">Emails Sent</p>
      </div>
      <ProgressRing
        progress={(weeklyStats.totalEmails / weeklyStats.weeklyTarget) * 100}
        size={80}
      >
        <span className="text-sm font-bold text-warrior-gold">
          {Math.round((weeklyStats.totalEmails / weeklyStats.weeklyTarget) * 100)}%
        </span>
      </ProgressRing>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-warrior-elevated p-3 rounded-lg">
        <p className="text-xl font-bold text-warrior-white">{weeklyStats.totalReplies}</p>
        <p className="text-xs text-warrior-muted">Replies</p>
      </div>
      <div className="bg-warrior-elevated p-3 rounded-lg">
        <p className="text-xl font-bold text-warrior-white">{weeklyStats.replyRate.toFixed(1)}%</p>
        <p className="text-xs text-warrior-muted">Reply Rate</p>
      </div>
      <div className="bg-warrior-elevated p-3 rounded-lg">
        <p className="text-xl font-bold text-warrior-white">{weeklyStats.totalCalls}</p>
        <p className="text-xs text-warrior-muted">Calls Booked</p>
      </div>
      <div className="bg-warrior-elevated p-3 rounded-lg">
        <p className="text-xl font-bold text-warrior-gold">${weeklyStats.totalRevenue.toLocaleString()}</p>
        <p className="text-xs text-warrior-muted">Revenue</p>
      </div>
    </div>
  </Card>
);
