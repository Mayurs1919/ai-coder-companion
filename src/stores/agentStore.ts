import { create } from 'zustand';
import { Agent, AgentId, AgentMessage, AgentStatus, AGENTS } from '@/types/agents';

interface AgentState {
  agents: Agent[];
  messages: Record<AgentId, AgentMessage[]>;
  activeAgent: AgentId | null;
  setActiveAgent: (agentId: AgentId | null) => void;
  updateAgentStatus: (agentId: AgentId, status: AgentStatus) => void;
  addMessage: (agentId: AgentId, message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (agentId: AgentId, content: string) => void;
  getAgent: (agentId: AgentId) => Agent | undefined;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: AGENTS,
  messages: {
    'code-writer': [],
    'refactor': [],
    'debug': [],
    'reviewer': [],
    'docs': [],
    'api': [],
    'microservices': [],
    'sys-engineer': [],
    'resume-ai': [],
  },
  activeAgent: null,
  setActiveAgent: (agentId) => set({ activeAgent: agentId }),
  updateAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId
          ? { ...agent, status, lastActivity: new Date().toISOString() }
          : agent
      ),
    })),
  addMessage: (agentId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [agentId]: [
          ...state.messages[agentId],
          {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date(),
          },
        ],
      },
    })),
  updateLastMessage: (agentId, content) =>
    set((state) => {
      const agentMessages = state.messages[agentId];
      if (agentMessages.length === 0) return state;
      
      const lastMessage = agentMessages[agentMessages.length - 1];
      if (lastMessage.role !== 'assistant') return state;
      
      return {
        messages: {
          ...state.messages,
          [agentId]: [
            ...agentMessages.slice(0, -1),
            { ...lastMessage, content },
          ],
        },
      };
    }),
  getAgent: (agentId) => get().agents.find((a) => a.id === agentId),
}));
