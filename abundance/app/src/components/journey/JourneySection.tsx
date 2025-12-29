import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Shield, User, Compass, ChevronRight, Plus } from 'lucide-react';
import { MindsetData, AbundanceEntry, BlockType } from '../../types';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { TextArea } from '../shared/TextArea';

interface JourneySectionProps {
  mindset: MindsetData;
  addJournalEntry: (content: string, prompt?: string) => void;
  addAbundanceEvidence: (entry: Omit<AbundanceEntry, 'id' | 'date'>) => void;
  addIdentityStatement: (oldIdentity: string, newIdentity: string, beliefLevel: number) => void;
  addBlockEntry: (entry: { blockType: BlockType; customName?: string; reflection: string; clearingAction?: string }) => void;
  addFutureSelfEntry: (entry: { visualization: string; dialog: string; keyInsights: string[] }) => void;
}

type Tab = 'autobiography' | 'evidence' | 'blocks' | 'identity' | 'future';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'autobiography', label: 'Money Story', icon: <BookOpen size={18} /> },
  { id: 'evidence', label: 'Abundance', icon: <Sparkles size={18} /> },
  { id: 'blocks', label: 'Blocks', icon: <Shield size={18} /> },
  { id: 'identity', label: 'Identity', icon: <User size={18} /> },
  { id: 'future', label: 'Future Self', icon: <Compass size={18} /> },
];

const moneyPrompts = [
  "What is your earliest memory involving money?",
  "What did your parents believe about money?",
  "What did your family believe about wealthy people?",
  "What messages did you receive about your worth and deservingness?",
  "What do YOU currently believe about money?",
  "If you truly believed you could make $10K/month easily, what would you do differently?",
];

const blockTypes: { type: BlockType; name: string; description: string }[] = [
  { type: 'helper_identity', name: 'Helper Identity', description: "More comfortable helping others than claiming your own success" },
  { type: 'scattered_energy', name: 'Scattered Energy', description: "Multiple projects, can't commit to one thing" },
  { type: 'not_yet_story', name: '"Not Yet" Story', description: "Need more training/experience before I'm ready" },
  { type: 'money_greed', name: 'Money = Greed', description: "Discomfort with charging your worth, guilt around making money" },
  { type: 'custom', name: 'Custom Block', description: "Something else is coming up" },
];

export const JourneySection = ({
  mindset,
  addJournalEntry,
  addAbundanceEvidence,
  addIdentityStatement,
  addBlockEntry,
  addFutureSelfEntry,
}: JourneySectionProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('autobiography');

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
              ${activeTab === tab.id
                ? 'bg-warrior-gold text-warrior-black'
                : 'bg-warrior-surface text-warrior-muted hover:text-warrior-white'
              }
            `}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'autobiography' && (
          <MoneyAutobiography
            entries={mindset.moneyAutobiography}
            onAdd={addJournalEntry}
          />
        )}
        {activeTab === 'evidence' && (
          <AbundanceEvidence
            entries={mindset.abundanceEvidence}
            onAdd={addAbundanceEvidence}
          />
        )}
        {activeTab === 'blocks' && (
          <BlocksWork
            entries={mindset.blocksWork}
            onAdd={addBlockEntry}
          />
        )}
        {activeTab === 'identity' && (
          <IdentityWork
            statements={mindset.identityStatements}
            onAdd={addIdentityStatement}
          />
        )}
        {activeTab === 'future' && (
          <FutureSelf
            entries={mindset.futureSelfDialogs}
            onAdd={addFutureSelfEntry}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Money Autobiography Tab
const MoneyAutobiography = ({
  entries,
  onAdd,
}: {
  entries: MindsetData['moneyAutobiography'];
  onAdd: (content: string, prompt?: string) => void;
}) => {
  const [isWriting, setIsWriting] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onAdd(content, selectedPrompt || undefined);
      setContent('');
      setSelectedPrompt(null);
      setIsWriting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card>
        <h3 className="text-lg font-bold text-warrior-white mb-2">Money Autobiography</h3>
        <p className="text-sm text-warrior-muted">
          Your relationship with money was formed by experiences from childhood.
          Understanding your story is the first step to rewriting it.
        </p>
      </Card>

      {!isWriting ? (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium text-warrior-gold">Prompts to explore:</p>
            {moneyPrompts.map((prompt, i) => (
              <Card
                key={i}
                onClick={() => {
                  setSelectedPrompt(prompt);
                  setIsWriting(true);
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-warrior-white">{prompt}</p>
                  <ChevronRight size={18} className="text-warrior-muted" />
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={() => setIsWriting(true)} variant="secondary" fullWidth>
            <Plus size={18} /> Free Write
          </Button>
        </>
      ) : (
        <Card>
          {selectedPrompt && (
            <p className="text-sm text-warrior-gold mb-3 italic">"{selectedPrompt}"</p>
          )}
          <TextArea
            placeholder="Write freely. Let whatever comes up flow..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsWriting(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()} fullWidth>
              Save Entry
            </Button>
          </div>
        </Card>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-warrior-muted">Previous Entries</h4>
          {entries.slice().reverse().map((entry) => (
            <Card key={entry.id}>
              <p className="text-xs text-warrior-muted mb-2">{entry.date}</p>
              {entry.prompt && (
                <p className="text-xs text-warrior-gold italic mb-2">"{entry.prompt}"</p>
              )}
              <p className="text-sm text-warrior-white whitespace-pre-wrap">{entry.content}</p>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Abundance Evidence Tab
const AbundanceEvidence = ({
  entries,
  onAdd,
}: {
  entries: MindsetData['abundanceEvidence'];
  onAdd: (entry: Omit<AbundanceEntry, 'id' | 'date'>) => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<AbundanceEntry['type']>('positive_response');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (description.trim()) {
      onAdd({
        type,
        description,
        amount: amount ? Number(amount) : undefined,
      });
      setDescription('');
      setAmount('');
      setIsAdding(false);
    }
  };

  const typeLabels = {
    money_received: 'Money Received',
    opportunity: 'Opportunity',
    positive_response: 'Positive Response',
    synchronicity: 'Synchronicity',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card>
        <h3 className="text-lg font-bold text-warrior-white mb-2">Abundance Evidence</h3>
        <p className="text-sm text-warrior-muted">
          Track proof that abundance is flowing to you. Money, opportunities, positive responses, synchronicities.
        </p>
      </Card>

      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} fullWidth>
          <Plus size={18} /> Log Abundance Evidence
        </Button>
      ) : (
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(typeLabels) as AbundanceEntry['type'][]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`
                    px-3 py-2 rounded-lg text-sm transition-colors
                    ${type === t
                      ? 'bg-warrior-gold text-warrior-black'
                      : 'bg-warrior-elevated text-warrior-muted hover:text-warrior-white'
                    }
                  `}
                >
                  {typeLabels[t]}
                </button>
              ))}
            </div>
            <TextArea
              label="What happened?"
              placeholder="Describe the abundance evidence..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            {type === 'money_received' && (
              <input
                type="number"
                placeholder="Amount ($)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-warrior-elevated border border-warrior-subtle rounded-lg px-4 py-3 text-warrior-white focus:outline-none focus:border-warrior-gold"
              />
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setIsAdding(false)} fullWidth>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!description.trim()} fullWidth>
                Add Evidence
              </Button>
            </div>
          </div>
        </Card>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-warrior-muted">Evidence Log</h4>
          {entries.slice().reverse().map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs px-2 py-0.5 bg-warrior-gold/20 text-warrior-gold rounded">
                    {typeLabels[entry.type]}
                  </span>
                  <p className="text-sm text-warrior-white mt-2">{entry.description}</p>
                  <p className="text-xs text-warrior-muted mt-1">{entry.date}</p>
                </div>
                {entry.amount && (
                  <span className="text-lg font-bold text-warrior-gold">
                    ${entry.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Blocks Work Tab
const BlocksWork = ({
  entries,
  onAdd,
}: {
  entries: MindsetData['blocksWork'];
  onAdd: (entry: { blockType: BlockType; customName?: string; reflection: string; clearingAction?: string }) => void;
}) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockType | null>(null);
  const [customName, setCustomName] = useState('');
  const [reflection, setReflection] = useState('');
  const [clearingAction, setClearingAction] = useState('');

  const handleSubmit = () => {
    if (selectedBlock && reflection.trim()) {
      onAdd({
        blockType: selectedBlock,
        customName: selectedBlock === 'custom' ? customName : undefined,
        reflection,
        clearingAction: clearingAction || undefined,
      });
      setSelectedBlock(null);
      setCustomName('');
      setReflection('');
      setClearingAction('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card>
        <h3 className="text-lg font-bold text-warrior-white mb-2">Blocks Library</h3>
        <p className="text-sm text-warrior-muted">
          Identify and clear the blocks that keep you from abundance.
        </p>
      </Card>

      {!selectedBlock ? (
        <div className="space-y-3">
          {blockTypes.map((block) => (
            <Card
              key={block.type}
              onClick={() => setSelectedBlock(block.type)}
              className="cursor-pointer"
            >
              <h4 className="font-semibold text-warrior-white">{block.name}</h4>
              <p className="text-sm text-warrior-muted mt-1">{block.description}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <h4 className="font-semibold text-warrior-gold mb-4">
            {blockTypes.find(b => b.type === selectedBlock)?.name}
          </h4>
          {selectedBlock === 'custom' && (
            <input
              type="text"
              placeholder="Name this block..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-warrior-elevated border border-warrior-subtle rounded-lg px-4 py-3 text-warrior-white mb-4 focus:outline-none focus:border-warrior-gold"
            />
          )}
          <TextArea
            label="How is this showing up for you?"
            placeholder="Describe how this block manifests..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
          />
          <div className="mt-4">
            <TextArea
              label="Clearing action (optional)"
              hint="What will you do differently?"
              placeholder="To clear this block, I will..."
              value={clearingAction}
              onChange={(e) => setClearingAction(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setSelectedBlock(null)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!reflection.trim()} fullWidth>
              Save Reflection
            </Button>
          </div>
        </Card>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-warrior-muted">Previous Work</h4>
          {entries.slice().reverse().map((entry) => (
            <Card key={entry.id}>
              <span className="text-xs px-2 py-0.5 bg-warrior-red/20 text-warrior-red rounded">
                {entry.customName || blockTypes.find(b => b.type === entry.blockType)?.name}
              </span>
              <p className="text-sm text-warrior-white mt-2">{entry.reflection}</p>
              {entry.clearingAction && (
                <p className="text-sm text-warrior-gold mt-2 italic">→ {entry.clearingAction}</p>
              )}
              <p className="text-xs text-warrior-muted mt-2">{entry.date}</p>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Identity Work Tab
const IdentityWork = ({
  statements,
  onAdd,
}: {
  statements: MindsetData['identityStatements'];
  onAdd: (oldIdentity: string, newIdentity: string, beliefLevel: number) => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [oldIdentity, setOldIdentity] = useState('');
  const [newIdentity, setNewIdentity] = useState('');
  const [beliefLevel, setBeliefLevel] = useState(5);

  const handleSubmit = () => {
    if (oldIdentity.trim() && newIdentity.trim()) {
      onAdd(oldIdentity, newIdentity, beliefLevel);
      setOldIdentity('');
      setNewIdentity('');
      setBeliefLevel(5);
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card>
        <h3 className="text-lg font-bold text-warrior-white mb-2">Identity Statements</h3>
        <p className="text-sm text-warrior-muted">
          Rewrite your identity. Who are you becoming?
        </p>
      </Card>

      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} fullWidth>
          <Plus size={18} /> Create Identity Statement
        </Button>
      ) : (
        <Card>
          <TextArea
            label="Old Identity"
            hint="What do you currently believe about yourself?"
            placeholder="I am someone who struggles with..."
            value={oldIdentity}
            onChange={(e) => setOldIdentity(e.target.value)}
            rows={2}
          />
          <div className="mt-4">
            <TextArea
              label="New Identity"
              hint="Who are you choosing to become?"
              placeholder="I am a [new identity] who [new behavior]..."
              value={newIdentity}
              onChange={(e) => setNewIdentity(e.target.value)}
              rows={2}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-warrior-white mb-2">
              How much do you believe this new identity? (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={beliefLevel}
              onChange={(e) => setBeliefLevel(Number(e.target.value))}
              className="w-full accent-warrior-gold"
            />
            <div className="flex justify-between text-sm text-warrior-muted">
              <span>Not at all</span>
              <span className="text-warrior-gold font-bold">{beliefLevel}</span>
              <span>Completely</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsAdding(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!oldIdentity.trim() || !newIdentity.trim()} fullWidth>
              Save Statement
            </Button>
          </div>
        </Card>
      )}

      {statements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-warrior-muted">Your Identity Evolution</h4>
          {statements.slice().reverse().map((statement) => (
            <Card key={statement.id}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-warrior-red line-through text-sm">{statement.oldIdentity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-warrior-gold text-sm font-medium">{statement.newIdentity}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-warrior-muted mt-2">
                  <span>Belief: {statement.beliefLevel}/10</span>
                  <span>{new Date(statement.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Future Self Tab
const FutureSelf = ({
  entries,
  onAdd,
}: {
  entries: MindsetData['futureSelfDialogs'];
  onAdd: (entry: { visualization: string; dialog: string; keyInsights: string[] }) => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [visualization, setVisualization] = useState('');
  const [dialog, setDialog] = useState('');
  const [insights, setInsights] = useState('');

  const handleSubmit = () => {
    if (visualization.trim() && dialog.trim()) {
      onAdd({
        visualization,
        dialog,
        keyInsights: insights.split('\n').filter(i => i.trim()),
      });
      setVisualization('');
      setDialog('');
      setInsights('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card highlight padding="lg">
        <h3 className="text-lg font-bold text-warrior-white mb-2">Future Self Dialog</h3>
        <p className="text-sm text-warrior-muted mb-4">
          Close your eyes. See yourself one year from now. Financially abundant, doing work you love, confident and free.
        </p>
        <p className="text-sm text-warrior-gold italic">
          "What did you have to let go of? What did you have to step into?"
        </p>
      </Card>

      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} fullWidth>
          <Plus size={18} /> Start Future Self Dialog
        </Button>
      ) : (
        <Card>
          <TextArea
            label="What do you see?"
            hint="Describe your future self in detail"
            placeholder="I see myself one year from now..."
            value={visualization}
            onChange={(e) => setVisualization(e.target.value)}
            rows={4}
          />
          <div className="mt-4">
            <TextArea
              label="What does your future self tell you?"
              hint="Ask: How did you get here? What was the hardest part?"
              placeholder="My future self says..."
              value={dialog}
              onChange={(e) => setDialog(e.target.value)}
              rows={4}
            />
          </div>
          <div className="mt-4">
            <TextArea
              label="Key insights (one per line)"
              placeholder="The main lessons I'm taking from this..."
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsAdding(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!visualization.trim() || !dialog.trim()} fullWidth>
              Save Dialog
            </Button>
          </div>
        </Card>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-warrior-muted">Previous Dialogs</h4>
          {entries.slice().reverse().map((entry) => (
            <Card key={entry.id}>
              <p className="text-xs text-warrior-muted mb-2">{entry.date}</p>
              <p className="text-sm text-warrior-white mb-2">{entry.visualization}</p>
              <p className="text-sm text-warrior-gold italic mb-2">"{entry.dialog}"</p>
              {entry.keyInsights.length > 0 && (
                <ul className="space-y-1">
                  {entry.keyInsights.map((insight, i) => (
                    <li key={i} className="text-sm text-warrior-muted">• {insight}</li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};
