export type EnergyAlignment = 'scarcity' | 'neutral' | 'abundance';
export type Timeline = 'A' | 'B';
export type ResponseType = 'acted' | 'collapsed' | 'mixed';
export type AbundanceType = 'money_received' | 'opportunity' | 'positive_response' | 'synchronicity';
export type BlockType = 'helper_identity' | 'scattered_energy' | 'not_yet_story' | 'money_greed' | 'custom';

export interface ResistanceMoment {
  id: string;
  timestamp: string;
  emailNumber: number;
  whatVoiceSaid: string;
  protocolFollowed: boolean;
  actedAnyway: boolean;
  notes?: string;
}

export interface MorningEntry {
  completed: boolean;
  completedAt?: string;
  emotionalState: string;
  voiceOfDoubt: string;
  acknowledgmentDone: boolean;
  energyAlignment: EnergyAlignment;
  timelineChoice: Timeline;
  preActionRitualDone: boolean;
}

export interface ActionEntry {
  emailsSent: number;
  dailyTarget: number;
  repliesReceived: number;
  discoveryCallsBooked: number;
  eventsClosed: number;
  revenueGenerated: number;
  resistanceMoments: ResistanceMoment[];
}

export interface EveningEntry {
  completed: boolean;
  completedAt?: string;
  wins: string[];
  resistanceReview: string;
  howIResponded: ResponseType;
  evidenceOfCapability: string;
  timelineExperienced: Timeline | 'mixed';
  tomorrowCommitment: string;
}

export interface DayEntry {
  date: string;
  morning: MorningEntry;
  action: ActionEntry;
  evening: EveningEntry;
}

export interface WeekEntry {
  weekNumber: number;
  startDate: string;
  endDate: string;
  completed: boolean;
  completedAt?: string;
  totalEmailsSent: number;
  targetMet: boolean;
  totalReplies: number;
  callsBooked: number;
  eventsClosed: number;
  revenue: number;
  replyRate: number;
  patternsObserved: string;
  identityScale: number;
  shadowWorkNotes: string;
  moneyReflection: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  prompt?: string;
}

export interface AbundanceEntry {
  id: string;
  date: string;
  type: AbundanceType;
  description: string;
  amount?: number;
}

export interface IdentityStatement {
  id: string;
  createdAt: string;
  oldIdentity: string;
  newIdentity: string;
  beliefLevel: number;
}

export interface BlockEntry {
  id: string;
  date: string;
  blockType: BlockType;
  customName?: string;
  reflection: string;
  clearingAction?: string;
}

export interface FutureSelfEntry {
  id: string;
  date: string;
  visualization: string;
  dialog: string;
  keyInsights: string[];
}

export interface DailyTargets {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  morningReminderTime: string;
  eveningReminderTime: string;
  lastVisitedSection: string;
}

export interface MindsetData {
  moneyAutobiography: JournalEntry[];
  abundanceEvidence: AbundanceEntry[];
  identityStatements: IdentityStatement[];
  blocksWork: BlockEntry[];
  futureSelfDialogs: FutureSelfEntry[];
}

export interface AppState {
  profile: {
    name: string;
    challengeStartDate: string;
    currentWeek: number;
  };
  dailyTargets: DailyTargets;
  days: Record<string, DayEntry>;
  weeks: Record<string, WeekEntry>;
  mindset: MindsetData;
  settings: AppSettings;
}

export type TabType = 'morning' | 'action' | 'evening' | 'journey' | 'weekly';
