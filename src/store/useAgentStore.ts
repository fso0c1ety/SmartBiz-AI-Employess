import { create } from 'zustand';

export interface AIAgent {
  id: string;
  businessName: string;
  industry: string;
  description: string;
  targetAudience: string;
  brandTone: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  logo?: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
  goals: string[];
  role: string;
  createdAt: Date;
}

interface AgentState {
  agents: AIAgent[];
  selectedAgent: AIAgent | null;
  addAgent: (agent: AIAgent) => void;
  updateAgent: (id: string, agent: Partial<AIAgent>) => void;
  deleteAgent: (id: string) => void;
  selectAgent: (agent: AIAgent | null) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgent: null,

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  updateAgent: (id, updatedAgent) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updatedAgent } : agent
      ),
    })),

  deleteAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    })),

  selectAgent: (agent) => set({ selectedAgent: agent }),
}));
