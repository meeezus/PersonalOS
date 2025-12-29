import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../shared/Button';
import { TextArea } from '../shared/TextArea';
import { Card } from '../shared/Card';

interface ResistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailNumber: number;
  onComplete: (data: {
    whatVoiceSaid: string;
    protocolFollowed: boolean;
    actedAnyway: boolean;
    notes?: string;
  }) => void;
}

type ProtocolStep = 'voice' | 'pause' | 'acknowledge' | 'firmness' | 'act' | 'log';

export const ResistanceModal = ({
  isOpen,
  onClose,
  emailNumber,
  onComplete,
}: ResistanceModalProps) => {
  const [step, setStep] = useState<ProtocolStep>('voice');
  const [voiceText, setVoiceText] = useState('');
  const [notes, setNotes] = useState('');
  const [breathCount, setBreathCount] = useState(0);

  const handleComplete = (actedAnyway: boolean) => {
    onComplete({
      whatVoiceSaid: voiceText,
      protocolFollowed: true,
      actedAnyway,
      notes: notes || undefined,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('voice');
    setVoiceText('');
    setNotes('');
    setBreathCount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-warrior-surface rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-warrior-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-warrior-gold" />
              <h2 className="text-lg font-bold text-warrior-white">Resistance Protocol</h2>
            </div>
            <button onClick={resetAndClose} className="text-warrior-muted hover:text-warrior-white">
              <X size={24} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-warrior-muted">
              Email #{emailNumber} · The voice showed up. Let's walk through this.
            </p>

            {step === 'voice' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <TextArea
                  label="What is the voice saying?"
                  placeholder="Write exactly what the doubt is telling you..."
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={() => setStep('pause')}
                  disabled={!voiceText.trim()}
                  fullWidth
                >
                  I've Named It
                </Button>
              </motion.div>
            )}

            {step === 'pause' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Card highlight padding="lg">
                  <h3 className="text-lg font-bold text-warrior-white mb-4 text-center">
                    Step 1: Pause
                  </h3>
                  <p className="text-warrior-muted text-center mb-6">
                    Take 3 deep breaths. Tap after each one.
                  </p>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3].map((n) => (
                      <motion.button
                        key={n}
                        onClick={() => setBreathCount(Math.max(breathCount, n))}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          w-16 h-16 rounded-full border-2 transition-all
                          ${breathCount >= n
                            ? 'bg-warrior-gold border-warrior-gold text-warrior-black'
                            : 'border-warrior-subtle text-warrior-muted hover:border-warrior-gold'
                          }
                        `}
                      >
                        {breathCount >= n ? <Check size={24} className="mx-auto" /> : n}
                      </motion.button>
                    ))}
                  </div>
                </Card>
                <Button
                  onClick={() => setStep('acknowledge')}
                  disabled={breathCount < 3}
                  fullWidth
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 'acknowledge' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Card highlight padding="lg">
                  <h3 className="text-lg font-bold text-warrior-white mb-4 text-center">
                    Step 2: Acknowledge
                  </h3>
                  <p className="text-warrior-gold text-lg text-center italic">
                    "Oh, there's that old belief. Hi, little Michael. I see you trying to protect me."
                  </p>
                </Card>
                <p className="text-xs text-warrior-muted text-center">
                  Don't argue with it. Just acknowledge.
                </p>
                <Button onClick={() => setStep('firmness')} fullWidth>
                  I See You
                </Button>
              </motion.div>
            )}

            {step === 'firmness' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Card highlight padding="lg">
                  <h3 className="text-lg font-bold text-warrior-white mb-4 text-center">
                    Step 3: Compassionate Firmness
                  </h3>
                  <p className="text-warrior-gold text-lg text-center italic">
                    "Thank you for trying to keep me safe. I'm sending the email anyway."
                  </p>
                </Card>
                <Button onClick={() => setStep('act')} fullWidth>
                  I'm Doing It Anyway
                </Button>
              </motion.div>
            )}

            {step === 'act' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Card highlight padding="lg">
                  <h3 className="text-lg font-bold text-warrior-white mb-4 text-center">
                    Step 4: Act
                  </h3>
                  <p className="text-warrior-white text-center text-2xl font-bold">
                    Send the fucking email.
                  </p>
                </Card>
                <Button onClick={() => setStep('log')} fullWidth>
                  I Sent It
                </Button>
                <Button onClick={() => handleComplete(false)} variant="ghost" fullWidth>
                  I couldn't do it (that's okay)
                </Button>
              </motion.div>
            )}

            {step === 'log' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-warrior-gold/20 rounded-full mb-4"
                  >
                    <Check size={32} className="text-warrior-gold" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-warrior-white">
                    You faced the voice and acted anyway.
                  </h3>
                  <p className="text-warrior-gold mt-2">This is how evidence is built.</p>
                </div>
                <TextArea
                  label="Any notes? (optional)"
                  placeholder="How did it feel? What did you notice?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
                <Button onClick={() => handleComplete(true)} fullWidth>
                  Log This Victory
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
