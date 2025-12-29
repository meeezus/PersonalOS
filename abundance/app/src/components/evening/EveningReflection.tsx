import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Moon, Plus, X } from 'lucide-react';
import { DayEntry, ResponseType, Timeline } from '../../types';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { TextArea } from '../shared/TextArea';
import { WarriorQuote } from '../shared/WarriorQuote';
import { getRandomQuote } from '../../utils/quotes';

interface EveningReflectionProps {
  todayEntry: DayEntry;
  updateEvening: (updates: Partial<DayEntry['evening']>) => void;
}

type Step = 'wins' | 'resistance' | 'response' | 'evidence' | 'timeline' | 'commitment' | 'complete';

const steps: Step[] = ['wins', 'resistance', 'response', 'evidence', 'timeline', 'commitment', 'complete'];

export const EveningReflection = ({ todayEntry, updateEvening }: EveningReflectionProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    if (todayEntry.evening.completed) return 'complete';
    if (todayEntry.evening.wins.length < 3) return 'wins';
    if (!todayEntry.evening.resistanceReview) return 'resistance';
    if (!todayEntry.evening.howIResponded) return 'response';
    if (!todayEntry.evening.evidenceOfCapability) return 'evidence';
    if (!todayEntry.evening.timelineExperienced) return 'timeline';
    return 'commitment';
  });

  const [wins, setWins] = useState<string[]>(
    todayEntry.evening.wins.length > 0 ? todayEntry.evening.wins : ['', '', '']
  );
  const [resistanceReview, setResistanceReview] = useState(todayEntry.evening.resistanceReview);
  const [response, setResponse] = useState<ResponseType>(todayEntry.evening.howIResponded || 'mixed');
  const [evidence, setEvidence] = useState(todayEntry.evening.evidenceOfCapability);
  const [timeline, setTimeline] = useState<Timeline | 'mixed'>(todayEntry.evening.timelineExperienced || 'B');
  const [commitment, setCommitment] = useState(todayEntry.evening.tomorrowCommitment);

  const currentStepIndex = steps.indexOf(currentStep);

  const goToNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleWinsSubmit = () => {
    const validWins = wins.filter(w => w.trim());
    updateEvening({ wins: validWins });
    goToNext();
  };

  const handleResistanceSubmit = () => {
    updateEvening({ resistanceReview });
    goToNext();
  };

  const handleResponseSubmit = () => {
    updateEvening({ howIResponded: response });
    goToNext();
  };

  const handleEvidenceSubmit = () => {
    updateEvening({ evidenceOfCapability: evidence });
    goToNext();
  };

  const handleTimelineSubmit = () => {
    updateEvening({ timelineExperienced: timeline });
    goToNext();
  };

  const handleComplete = () => {
    updateEvening({
      tomorrowCommitment: commitment,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    setCurrentStep('complete');
  };

  const updateWin = (index: number, value: string) => {
    const newWins = [...wins];
    newWins[index] = value;
    setWins(newWins);
  };

  const addWin = () => {
    setWins([...wins, '']);
  };

  const removeWin = (index: number) => {
    if (wins.length > 3) {
      setWins(wins.filter((_, i) => i !== index));
    }
  };

  const validWinsCount = wins.filter(w => w.trim()).length;

  if (currentStep === 'complete') {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-warrior-gold/20 rounded-full mb-4"
          >
            <Moon size={40} className="text-warrior-gold" />
          </motion.div>
          <h2 className="text-2xl font-bold text-warrior-white mb-2">
            Day Complete
          </h2>
          <p className="text-warrior-muted">
            Rest well, warrior. Tomorrow we walk again.
          </p>
        </div>

        <Card highlight>
          <WarriorQuote quote={getRandomQuote('general')} />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-warrior-muted uppercase tracking-wider mb-3">
            Today's Reflection
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-warrior-muted mb-1">Wins Captured</p>
              <ul className="space-y-1">
                {todayEntry.evening.wins.map((win, i) => (
                  <li key={i} className="text-sm text-warrior-white flex items-start gap-2">
                    <span className="text-warrior-gold">•</span>
                    {win}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-warrior-muted mb-1">Evidence of Capability</p>
              <p className="text-sm text-warrior-gold">{todayEntry.evening.evidenceOfCapability}</p>
            </div>
            <div>
              <p className="text-xs text-warrior-muted mb-1">Tomorrow's Commitment</p>
              <p className="text-sm text-warrior-white">{todayEntry.evening.tomorrowCommitment}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {steps.slice(0, -1).map((step, index) => (
          <div
            key={step}
            className={`
              flex-1 h-1 rounded-full transition-colors
              ${index < currentStepIndex ? 'bg-warrior-gold' : 'bg-warrior-subtle'}
            `}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'wins' && (
          <motion.div
            key="wins"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-warrior-gold/20 rounded-full flex items-center justify-center">
                <Moon size={20} className="text-warrior-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-warrior-white">Capture Your Wins</h2>
                <p className="text-sm text-warrior-muted">Step 1 of 6 · At least 3 wins</p>
              </div>
            </div>

            <Card>
              <p className="text-sm text-warrior-muted mb-4">
                Even tiny wins count. What went well today?
              </p>
              <div className="space-y-3">
                {wins.map((win, index) => (
                  <div key={index} className="flex gap-2">
                    <TextArea
                      placeholder={`Win #${index + 1}`}
                      value={win}
                      onChange={(e) => updateWin(index, e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    {wins.length > 3 && (
                      <button
                        onClick={() => removeWin(index)}
                        className="text-warrior-muted hover:text-warrior-red"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addWin}
                className="flex items-center gap-2 text-sm text-warrior-gold hover:text-warrior-goldMuted mt-3"
              >
                <Plus size={16} /> Add another win
              </button>
            </Card>

            <Button
              onClick={handleWinsSubmit}
              disabled={validWinsCount < 3}
              fullWidth
            >
              {validWinsCount < 3 ? `Need ${3 - validWinsCount} more win${3 - validWinsCount > 1 ? 's' : ''}` : 'Continue'}
              {validWinsCount >= 3 && <ChevronRight size={18} />}
            </Button>
          </motion.div>
        )}

        {currentStep === 'resistance' && (
          <motion.div
            key="resistance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">Resistance Review</h2>
              <p className="text-sm text-warrior-muted">Step 2 of 6</p>
            </div>

            <Card>
              <TextArea
                label="When did the voice show up today? What did it say?"
                hint="If resistance didn't show up, write about that"
                placeholder="Describe the moments of doubt, fear, or distraction..."
                value={resistanceReview}
                onChange={(e) => setResistanceReview(e.target.value)}
                rows={5}
              />
            </Card>

            <Button
              onClick={handleResistanceSubmit}
              disabled={!resistanceReview.trim()}
              fullWidth
            >
              Continue <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}

        {currentStep === 'response' && (
          <motion.div
            key="response"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">How Did You Respond?</h2>
              <p className="text-sm text-warrior-muted">Step 3 of 6</p>
            </div>

            <p className="text-warrior-muted text-sm">
              When resistance showed up, did you act anyway or collapse into distraction?
            </p>

            <div className="space-y-3">
              <Card
                onClick={() => setResponse('acted')}
                highlight={response === 'acted'}
                className={response === 'acted' ? 'border-warrior-gold' : ''}
              >
                <h3 className="font-bold text-warrior-gold mb-1">I Acted Anyway</h3>
                <p className="text-sm text-warrior-muted">
                  The voice showed up, and I sent the email/did the thing anyway.
                </p>
              </Card>
              <Card
                onClick={() => setResponse('mixed')}
                highlight={response === 'mixed'}
              >
                <h3 className="font-bold text-warrior-white mb-1">Mixed</h3>
                <p className="text-sm text-warrior-muted">
                  Sometimes I acted, sometimes I collapsed. It was a battle.
                </p>
              </Card>
              <Card
                onClick={() => setResponse('collapsed')}
                highlight={response === 'collapsed'}
                className={response === 'collapsed' ? 'border-warrior-red' : ''}
              >
                <h3 className="font-bold text-warrior-red mb-1">I Collapsed</h3>
                <p className="text-sm text-warrior-muted">
                  The voice won today. I distracted, avoided, or gave up.
                </p>
              </Card>
            </div>

            <Button onClick={handleResponseSubmit} fullWidth>
              Continue <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}

        {currentStep === 'evidence' && (
          <motion.div
            key="evidence"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">Evidence of Capability</h2>
              <p className="text-sm text-warrior-muted">Step 4 of 6</p>
            </div>

            <Card highlight padding="lg">
              <p className="text-warrior-gold text-center italic mb-2">
                What proof did I create today that I CAN make shit happen?
              </p>
              <p className="text-xs text-warrior-muted text-center">
                This is the core question. What evidence exists now that didn't exist yesterday?
              </p>
            </Card>

            <Card>
              <TextArea
                placeholder="Today I proved I can make shit happen by..."
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                rows={4}
              />
            </Card>

            <Button
              onClick={handleEvidenceSubmit}
              disabled={!evidence.trim()}
              fullWidth
            >
              Continue <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}

        {currentStep === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">Timeline Review</h2>
              <p className="text-sm text-warrior-muted">Step 5 of 6</p>
            </div>

            <p className="text-warrior-muted text-sm">
              Which timeline did you experience today?
            </p>

            <div className="grid grid-cols-3 gap-3">
              <Card
                onClick={() => setTimeline('A')}
                highlight={timeline === 'A'}
                className={timeline === 'A' ? 'border-warrior-red' : ''}
              >
                <h3 className="font-bold text-warrior-red text-center">A</h3>
                <p className="text-xs text-warrior-muted text-center mt-1">Scarcity</p>
              </Card>
              <Card
                onClick={() => setTimeline('mixed')}
                highlight={timeline === 'mixed'}
              >
                <h3 className="font-bold text-warrior-white text-center">Mixed</h3>
                <p className="text-xs text-warrior-muted text-center mt-1">Both</p>
              </Card>
              <Card
                onClick={() => setTimeline('B')}
                highlight={timeline === 'B'}
                className={timeline === 'B' ? 'border-warrior-gold' : ''}
              >
                <h3 className="font-bold text-warrior-gold text-center">B</h3>
                <p className="text-xs text-warrior-muted text-center mt-1">Abundance</p>
              </Card>
            </div>

            <Button onClick={handleTimelineSubmit} fullWidth>
              Continue <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}

        {currentStep === 'commitment' && (
          <motion.div
            key="commitment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">Tomorrow's Commitment</h2>
              <p className="text-sm text-warrior-muted">Step 6 of 6</p>
            </div>

            <Card>
              <TextArea
                label="What am I committing to tomorrow?"
                hint="Be specific. What actions will you take?"
                placeholder="Tomorrow I will..."
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                rows={4}
              />
            </Card>

            <Button
              onClick={handleComplete}
              disabled={!commitment.trim()}
              fullWidth
            >
              Complete Evening Ritual <Check size={18} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
