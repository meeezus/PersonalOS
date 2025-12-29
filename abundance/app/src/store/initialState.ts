import { AppState } from '../types';

export const createEmptyMorning = () => ({
  completed: false,
  emotionalState: '',
  voiceOfDoubt: '',
  acknowledgmentDone: false,
  energyAlignment: 'neutral' as const,
  timelineChoice: 'B' as const,
  preActionRitualDone: false,
});

export const createEmptyAction = (dailyTarget: number) => ({
  emailsSent: 0,
  dailyTarget,
  repliesReceived: 0,
  discoveryCallsBooked: 0,
  eventsClosed: 0,
  revenueGenerated: 0,
  resistanceMoments: [],
});

export const createEmptyEvening = () => ({
  completed: false,
  wins: [],
  resistanceReview: '',
  howIResponded: 'mixed' as const,
  evidenceOfCapability: '',
  timelineExperienced: 'B' as const,
  tomorrowCommitment: '',
});

export const initialState: AppState = {
  profile: {
    name: 'Michael',
    challengeStartDate: '2024-12-30',
    currentWeek: 1,
  },
  dailyTargets: {
    monday: 15,
    tuesday: 20,
    wednesday: 20,
    thursday: 20,
    friday: 15,
    saturday: 0,
    sunday: 0,
  },
  days: {},
  weeks: {},
  mindset: {
    moneyAutobiography: [],
    abundanceEvidence: [],
    identityStatements: [],
    blocksWork: [],
    futureSelfDialogs: [],
  },
  settings: {
    notificationsEnabled: true,
    morningReminderTime: '08:00',
    eveningReminderTime: '20:00',
    lastVisitedSection: 'action',
  },
};
