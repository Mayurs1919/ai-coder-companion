import { create } from 'zustand';
import { AgentId } from '@/types/agents';

export interface SessionMetrics {
  agentId: AgentId;
  requestCount: number;
  tokenCount: number;
  successCount: number;
  errorCount: number;
  retryCount: number;
  copyActions: number;
  expandActions: number;
  downloadActions: number;
  manualEdits: number;
  avgResponseTime: number;
  responseTimes: number[];
  languages: Record<string, number>;
  lastRequestTime: Date | null;
  sessionStart: Date;
}

export interface QualitySignals {
  retryRate: number; // Lower = better (user doesn't retry)
  downloadRate: number; // Higher = useful output
  copyRate: number; // Higher = useful code
  editRate: number; // Lower = code is production-ready
  successRate: number;
  avgCodeLength: number;
}

interface SessionUsageState {
  sessions: Record<AgentId, SessionMetrics>;
  activeSessionId: AgentId | null;
  
  // Actions
  initSession: (agentId: AgentId) => void;
  trackRequest: (agentId: AgentId, startTime: number) => void;
  trackSuccess: (agentId: AgentId, responseTime: number, tokenEstimate: number) => void;
  trackError: (agentId: AgentId) => void;
  trackRetry: (agentId: AgentId) => void;
  trackCopy: (agentId: AgentId) => void;
  trackExpand: (agentId: AgentId) => void;
  trackDownload: (agentId: AgentId) => void;
  trackManualEdit: (agentId: AgentId) => void;
  trackLanguage: (agentId: AgentId, language: string) => void;
  
  // Getters
  getSessionMetrics: (agentId: AgentId) => SessionMetrics | undefined;
  getQualitySignals: (agentId: AgentId) => QualitySignals;
  setActiveSession: (agentId: AgentId | null) => void;
}

const createEmptySession = (agentId: AgentId): SessionMetrics => ({
  agentId,
  requestCount: 0,
  tokenCount: 0,
  successCount: 0,
  errorCount: 0,
  retryCount: 0,
  copyActions: 0,
  expandActions: 0,
  downloadActions: 0,
  manualEdits: 0,
  avgResponseTime: 0,
  responseTimes: [],
  languages: {},
  lastRequestTime: null,
  sessionStart: new Date(),
});

export const useSessionUsageStore = create<SessionUsageState>((set, get) => ({
  sessions: {} as Record<AgentId, SessionMetrics>,
  activeSessionId: null,

  initSession: (agentId) => {
    set((state) => {
      if (state.sessions[agentId]) return state;
      return {
        sessions: {
          ...state.sessions,
          [agentId]: createEmptySession(agentId),
        },
      };
    });
  },

  trackRequest: (agentId) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            requestCount: session.requestCount + 1,
            lastRequestTime: new Date(),
          },
        },
      };
    });
  },

  trackSuccess: (agentId, responseTime, tokenEstimate) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      const newResponseTimes = [...session.responseTimes, responseTime];
      const avgResponseTime = newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length;
      
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            successCount: session.successCount + 1,
            tokenCount: session.tokenCount + tokenEstimate,
            responseTimes: newResponseTimes,
            avgResponseTime,
          },
        },
      };
    });
  },

  trackError: (agentId) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            errorCount: session.errorCount + 1,
          },
        },
      };
    });
  },

  trackRetry: (agentId) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            retryCount: session.retryCount + 1,
          },
        },
      };
    });
  },

  trackCopy: (agentId) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            copyActions: session.copyActions + 1,
          },
        },
      };
    });
  },

  trackExpand: (agentId) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            expandActions: session.expandActions + 1,
          },
        },
      };
    });
  },

  trackDownload: (agentId) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            downloadActions: session.downloadActions + 1,
          },
        },
      };
    });
  },

  trackManualEdit: (agentId) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            manualEdits: session.manualEdits + 1,
          },
        },
      };
    });
  },

  trackLanguage: (agentId, language) => {
    set((state) => {
      const session = state.sessions[agentId] || createEmptySession(agentId);
      return {
        sessions: {
          ...state.sessions,
          [agentId]: {
            ...session,
            languages: {
              ...session.languages,
              [language]: (session.languages[language] || 0) + 1,
            },
          },
        },
      };
    });
  },

  getSessionMetrics: (agentId) => {
    return get().sessions[agentId];
  },

  getQualitySignals: (agentId) => {
    const session = get().sessions[agentId];
    if (!session || session.requestCount === 0) {
      return {
        retryRate: 0,
        downloadRate: 0,
        copyRate: 0,
        editRate: 0,
        successRate: 100,
        avgCodeLength: 0,
      };
    }

    const total = session.requestCount;
    const success = session.successCount;

    return {
      retryRate: (session.retryCount / total) * 100,
      downloadRate: (session.downloadActions / Math.max(success, 1)) * 100,
      copyRate: (session.copyActions / Math.max(success, 1)) * 100,
      editRate: (session.manualEdits / Math.max(success, 1)) * 100,
      successRate: (success / total) * 100,
      avgCodeLength: session.tokenCount / Math.max(success, 1),
    };
  },

  setActiveSession: (agentId) => {
    set({ activeSessionId: agentId });
  },
}));
