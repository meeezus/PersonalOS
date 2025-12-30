import { useState, useEffect, useCallback } from 'react';
import { AppState, DayEntry, ResistanceMoment, AbundanceEntry, JournalEntry, IdentityStatement, BlockEntry, FutureSelfEntry, WeekEntry } from '../types';
import { initialState, createEmptyMorning, createEmptyAction, createEmptyEvening } from './initialState';
import { format, getDay, startOfWeek, endOfWeek, differenceInWeeks, parseISO } from 'date-fns';

const STORAGE_KEY = 'abundance-warrior-state';

const getDayName = (date: Date): keyof typeof initialState.dailyTargets => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  return days[getDay(date)];
};

export const useAppStore = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return initialState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const dayName = getDayName(new Date());
  const dailyTarget = state.dailyTargets[dayName];

  const getOrCreateDay = useCallback((date: string): DayEntry => {
    if (state.days[date]) {
      return state.days[date];
    }
    const dateObj = parseISO(date);
    const dayNameForDate = getDayName(dateObj);
    const target = state.dailyTargets[dayNameForDate];
    return {
      date,
      morning: createEmptyMorning(),
      action: createEmptyAction(target),
      evening: createEmptyEvening(),
    };
  }, [state.days, state.dailyTargets]);

  const todayEntry = getOrCreateDay(today);

  const updateMorning = useCallback((updates: Partial<DayEntry['morning']>) => {
    setState(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [today]: {
          ...getOrCreateDay(today),
          morning: {
            ...getOrCreateDay(today).morning,
            ...updates,
          },
        },
      },
    }));
  }, [today, getOrCreateDay]);

  const updateAction = useCallback((updates: Partial<DayEntry['action']>) => {
    setState(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [today]: {
          ...getOrCreateDay(today),
          action: {
            ...getOrCreateDay(today).action,
            ...updates,
          },
        },
      },
    }));
  }, [today, getOrCreateDay]);

  const updateEvening = useCallback((updates: Partial<DayEntry['evening']>) => {
    setState(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [today]: {
          ...getOrCreateDay(today),
          evening: {
            ...getOrCreateDay(today).evening,
            ...updates,
          },
        },
      },
    }));
  }, [today, getOrCreateDay]);

  const incrementEmails = useCallback(() => {
    setState(prev => {
      const day = getOrCreateDay(today);
      return {
        ...prev,
        days: {
          ...prev.days,
          [today]: {
            ...day,
            action: {
              ...day.action,
              emailsSent: day.action.emailsSent + 1,
            },
          },
        },
      };
    });
  }, [today, getOrCreateDay]);

  const decrementEmails = useCallback(() => {
    setState(prev => {
      const day = getOrCreateDay(today);
      return {
        ...prev,
        days: {
          ...prev.days,
          [today]: {
            ...day,
            action: {
              ...day.action,
              emailsSent: Math.max(0, day.action.emailsSent - 1),
            },
          },
        },
      };
    });
  }, [today, getOrCreateDay]);

  const addResistanceMoment = useCallback((moment: Omit<ResistanceMoment, 'id' | 'timestamp'>) => {
    const newMoment: ResistanceMoment = {
      ...moment,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setState(prev => {
      const day = getOrCreateDay(today);
      return {
        ...prev,
        days: {
          ...prev.days,
          [today]: {
            ...day,
            action: {
              ...day.action,
              resistanceMoments: [...day.action.resistanceMoments, newMoment],
            },
          },
        },
      };
    });
  }, [today, getOrCreateDay]);

  const addAbundanceEvidence = useCallback((entry: Omit<AbundanceEntry, 'id' | 'date'>) => {
    const newEntry: AbundanceEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: today,
    };
    setState(prev => ({
      ...prev,
      mindset: {
        ...prev.mindset,
        abundanceEvidence: [...prev.mindset.abundanceEvidence, newEntry],
      },
    }));
  }, [today]);

  const addJournalEntry = useCallback((content: string, prompt?: string) => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: today,
      content,
      prompt,
    };
    setState(prev => ({
      ...prev,
      mindset: {
        ...prev.mindset,
        moneyAutobiography: [...prev.mindset.moneyAutobiography, newEntry],
      },
    }));
  }, [today]);

  const addIdentityStatement = useCallback((oldIdentity: string, newIdentity: string, beliefLevel: number) => {
    const newStatement: IdentityStatement = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      oldIdentity,
      newIdentity,
      beliefLevel,
    };
    setState(prev => ({
      ...prev,
      mindset: {
        ...prev.mindset,
        identityStatements: [...prev.mindset.identityStatements, newStatement],
      },
    }));
  }, []);

  const addBlockEntry = useCallback((entry: Omit<BlockEntry, 'id' | 'date'>) => {
    const newEntry: BlockEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: today,
    };
    setState(prev => ({
      ...prev,
      mindset: {
        ...prev.mindset,
        blocksWork: [...prev.mindset.blocksWork, newEntry],
      },
    }));
  }, [today]);

  const addFutureSelfEntry = useCallback((entry: Omit<FutureSelfEntry, 'id' | 'date'>) => {
    const newEntry: FutureSelfEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: today,
    };
    setState(prev => ({
      ...prev,
      mindset: {
        ...prev.mindset,
        futureSelfDialogs: [...prev.mindset.futureSelfDialogs, newEntry],
      },
    }));
  }, [today]);

  const getWeeklyStats = useCallback(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    let totalEmails = 0;
    let totalReplies = 0;
    let totalCalls = 0;
    let totalEvents = 0;
    let totalRevenue = 0;
    let resistanceMoments: ResistanceMoment[] = [];

    Object.entries(state.days).forEach(([date, day]) => {
      const dateObj = parseISO(date);
      if (dateObj >= weekStart && dateObj <= weekEnd) {
        totalEmails += day.action.emailsSent;
        totalReplies += day.action.repliesReceived;
        totalCalls += day.action.discoveryCallsBooked;
        totalEvents += day.action.eventsClosed;
        totalRevenue += day.action.revenueGenerated;
        resistanceMoments = [...resistanceMoments, ...day.action.resistanceMoments];
      }
    });

    return {
      totalEmails,
      totalReplies,
      totalCalls,
      totalEvents,
      totalRevenue,
      resistanceMoments,
      weeklyTarget: 90,
      replyRate: totalEmails > 0 ? (totalReplies / totalEmails) * 100 : 0,
    };
  }, [state.days]);

  const saveWeeklyReview = useCallback((weekNumber: number, review: Partial<WeekEntry>) => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const stats = getWeeklyStats();

    const weekEntry: WeekEntry = {
      weekNumber,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      completed: true,
      completedAt: new Date().toISOString(),
      totalEmailsSent: stats.totalEmails,
      targetMet: stats.totalEmails >= 90,
      totalReplies: stats.totalReplies,
      callsBooked: stats.totalCalls,
      eventsClosed: stats.totalEvents,
      revenue: stats.totalRevenue,
      replyRate: stats.replyRate,
      patternsObserved: review.patternsObserved || '',
      identityScale: review.identityScale || 5,
      shadowWorkNotes: review.shadowWorkNotes || '',
      moneyReflection: review.moneyReflection || '',
    };

    setState(prev => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [weekNumber.toString()]: weekEntry,
      },
    }));
  }, [getWeeklyStats]);

  const getCurrentWeekNumber = useCallback(() => {
    const startDate = parseISO(state.profile.challengeStartDate);
    const now = new Date();
    return differenceInWeeks(now, startDate) + 1;
  }, [state.profile.challengeStartDate]);

  const getStreak = useCallback(() => {
    let streak = 0;
    const sortedDates = Object.keys(state.days).sort().reverse();

    for (const date of sortedDates) {
      const day = state.days[date];
      if (day.morning.completed && day.evening.completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [state.days]);

  const updateSettings = useCallback((updates: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
    }));
  }, []);

  return {
    state,
    today,
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
    updateSettings,
  };
};
