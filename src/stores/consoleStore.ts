import { create } from 'zustand';
import { ConsoleLog, AgentId } from '@/types/agents';

interface ConsoleState {
  logs: ConsoleLog[];
  addLog: (type: ConsoleLog['type'], message: string, agentId?: AgentId) => void;
  clearLogs: () => void;
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  logs: [
    {
      id: '1',
      type: 'info',
      message: 'AI-Code Viewer initialized',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'success',
      message: 'Connected to Lovable AI Gateway',
      timestamp: new Date(),
    },
    {
      id: '3',
      type: 'info',
      message: '10 agents loaded and ready',
      timestamp: new Date(),
    },
  ],
  addLog: (type, message, agentId) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          id: Date.now().toString(),
          type,
          message,
          timestamp: new Date(),
          agentId,
        },
      ],
    })),
  clearLogs: () => set({ logs: [] }),
}));
