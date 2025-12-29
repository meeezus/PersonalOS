import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Sun } from 'lucide-react';
import { DayEntry, EnergyAlignment, Timeline } from '../../types';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { TextArea } from '../shared/TextArea';
import { EnergySlider } from '../shared/EnergySlider';
import { WarriorQuote } from '../shared/WarriorQuote';
import { getRandomQuote } from '../../utils/quotes';

interface MorningRitualProps {
  todayEntry: DayEntry;
  updateMorning: (updates: Partial<DayEntry['morning']>) => void;
}

type Step = 'emotional' | 'doubt' | 'acknowledge' | 'energy' | 'timeline' | 'ritual' | 'complete';

const steps: Step[] = ['emotional', 'doubt', 'acknowledge', 'energy', 'timeline', 'ritual', 'complete'];

export const MorningRitual = ({ todayEntry, updateMorning }: MorningRitualProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    if (todayEntry.morning.completed) return 'complete';
    if (!todayEntry.morning.emotionalState) return 'emotional';
    if (!todayEntry.morning.voiceOfDoubt) return 'doubt';
    if (!todayEntry.morning.acknowledgmentDone) return 'acknowledge';
    if (todayEntry.morning.energyAlignment === 'neutral') return 'energy';
    if (!todayEntry.morning.preActionRitualDone) return 'timeline';
    return 'ritual';
  });

  const [emotionalState, setEmotionalState] = useState(todayEntry.morning.emotionalState);
  const [voiceOfDoubt, setVoiceOfDoubt] = useState(todayEntry.morning.voiceOfDoubt);
  const [energy, setEnergy] = useState<EnergyAlignment>(todayEntry.morning.energyAlignment);
  const [timeline, setTimeline] = useState<Timeline>(todayEntry.morning.timelineChoice);

  const currentStepIndex = steps.indexOf(currentStep);

  const goToNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleEmotionalSubmit = () => {
    updateMorning({ emotionalState });
    goToNext();
  };

  const handleDoubtSubmit = () => {
    updateMorning({ voiceOfDoubt });
    goToNext();
  };

  const handleAcknowledge = () => {
    updateMorning({ acknowledgmentDone: true });
    goToNext();
  };

  const handleEnergySubmit = () => {
    updateMorning({ energyAlignment: energy });
    goToNext();
  };

  const handleTimelineSubmit = () => {
    updateMorning({ timelineChoice: timeline });
    goToNext();
  };

  const handleRitualComplete = () => {
    updateMorning({
      preActionRitualDone: true,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    setCurrentStep('complete');
  };

  if (currentStep === 'complete') {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-warrior-gold/20 rounded-full mb-4"
          >
            <Check size={40} className="text-warrior-gold" />
          </motion.div>
          <h2 className="text-2xl font-bold text-warrior-white mb-2">
            Morning Ritual Complete
          </h2>
          <p className="text-warrior-muted">
            You are prepared. Now walk the path.
          </p>
        </div>

        <Card highlight>
          <WarriorQuote quote={getRandomQuote('general')} />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-warrior-muted uppercase tracking-wider mb-3">
            Today's Preparation
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-warrior-muted">Emotional State:</span>
              <span className="text-warrior-white">{todayEntry.morning.emotionalState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warrior-muted">Energy:</span>
              <span className="text-warrior-gold capitalize">{todayEntry.morning.energyAlignment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warrior-muted">Timeline:</span>
              <span className="text-warrior-gold">
                {todayEntry.morning.timelineChoice === 'B' ? 'Abundance' : 'Scarcity'}
              </span>
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
        {currentStep === 'emotional' && (
          <motion.div
            key="emotional"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-warrior-gold/20 rounded-full flex items-center justify-center">
                <Sun size={20} className="text-warrior-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-warrior-white">Emotional Check-In</h2>
                <p className="text-sm text-warrior-muted">Step 1 of 6</p>
              </div>
            </div>

            <Card>
              <TextArea
                label="How am I feeling about today's outreach?"
                placeholder="Be honest. Name the feeling. No judgment."
                value={emotionalState}
                onChange={(e) => setEmotionalState(e.target.value)}
                rows={4}
              />
            </Card>

            <Button
              onClick={handleEmotionalSubmit}
              disabled={!emotionalState.trim()}
              fullWidth
            >
              Continue <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}

        {currentStep === 'doubt' && (
          <motion.div
            key="doubt"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">The Voice of Doubt</h2>
              <p className="text-sm text-warrior-muted">Step 2 of 6</p>
            </div>

            <Card>
              <TextArea
                label="What is the limiting belief saying right now?"
                hint="Listen for the voice that says you can't make shit happen"
                placeholder="What does the voice say? Let it speak..."
                value={voiceOfDoubt}
                onChange={(e) => setVoiceOfDoubt(e.target.value)}
                rows={4}
              />
            </Card>

            <Button
              onClick={handleDoubtSubmit}
              disabled={!voiceOfDoubt.trim()}
              fullWidth
            >
              Continue <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}

        {currentStep === 'acknowledge' && (
          <motion.div
            key="acknowledge"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">Acknowledgment</h2>
              <p className="text-sm text-warrior-muted">Step 3 of 6</p>
            </div>

            <Card highlight padding="lg">
              <p className="text-warrior-muted text-sm mb-4">
                Read this aloud, speaking to the 5-year-old at the carousel:
              </p>
              <p className="text-xl text-warrior-white leading-relaxed mb-6">
                "I see you, little Michael. I see you trying to protect me from disappointment.
                <span className="text-warrior-gold"> I'm doing it anyway.</span>"
              </p>
              <p className="text-warrior-muted text-sm mb-4">Then:</p>
              <p className="text-lg text-warrior-gold italic">
                "I am willing to find out if I can make this happen."
              </p>
            </Card>

            <Button onClick={handleAcknowledge} fullWidth>
              I've Acknowledged <Check size={18} />
            </Button>
          </motion.div>
        )}

        {currentStep === 'energy' && (
          <motion.div
            key="energy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">Energy Alignment</h2>
              <p className="text-sm text-warrior-muted">Step 4 of 6</p>
            </div>

            <Card>
              <p className="text-warrior-muted text-sm mb-4">
                Am I about to send emails from scarcity or abundance?
              </p>
              <EnergySlider value={energy} onChange={setEnergy} />
            </Card>

            <Button onClick={handleEnergySubmit} fullWidth>
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
              <h2 className="text-xl font-bold text-warrior-white">Choose Your Timeline</h2>
              <p className="text-sm text-warrior-muted">Step 5 of 6</p>
            </div>

            <p className="text-warrior-muted text-sm">
              Both timelines exist. Which one will you experience today?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Card
                onClick={() => setTimeline('A')}
                highlight={timeline === 'A'}
                className={timeline === 'A' ? 'border-warrior-red' : ''}
              >
                <h3 className="font-bold text-warrior-red mb-2">Timeline A</h3>
                <p className="text-sm text-warrior-muted">
                  Scarcity. Struggle. "This is so hard." People don't respond.
                </p>
              </Card>
              <Card
                onClick={() => setTimeline('B')}
                highlight={timeline === 'B'}
                className={timeline === 'B' ? 'border-warrior-gold' : ''}
              >
                <h3 className="font-bold text-warrior-gold mb-2">Timeline B</h3>
                <p className="text-sm text-warrior-muted">
                  Abundance. Flow. Ideal clients appear. Opportunities arrive.
                </p>
              </Card>
            </div>

            <Button onClick={handleTimelineSubmit} fullWidth>
              I Choose Timeline {timeline} <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}

        {currentStep === 'ritual' && (
          <motion.div
            key="ritual"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warrior-white">Pre-Action Ritual</h2>
              <p className="text-sm text-warrior-muted">Step 6 of 6</p>
            </div>

            <Card highlight padding="lg">
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-24 h-24 mx-auto bg-warrior-gold/20 rounded-full flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-warrior-gold/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-warrior-gold rounded-full" />
                  </div>
                </motion.div>

                <div className="space-y-4 text-left">
                  <p className="text-warrior-white">
                    <span className="text-warrior-gold font-semibold">1.</span> Close your eyes
                  </p>
                  <p className="text-warrior-white">
                    <span className="text-warrior-gold font-semibold">2.</span> Take 5 deep breaths
                  </p>
                  <p className="text-warrior-white">
                    <span className="text-warrior-gold font-semibold">3.</span> Feel yourself as already successful
                  </p>
                  <p className="text-warrior-white">
                    <span className="text-warrior-gold font-semibold">4.</span> Connect to gratitude for what's coming
                  </p>
                  <p className="text-warrior-white">
                    <span className="text-warrior-gold font-semibold">5.</span> You are ready to send from worthiness
                  </p>
                </div>
              </div>
            </Card>

            <Button onClick={handleRitualComplete} fullWidth>
              I Am Ready <Check size={18} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
