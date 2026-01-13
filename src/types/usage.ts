export interface UsageOverview {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  codingStreak: number;
}

export interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface AgentUsage {
  agentId: string;
  agentName: string;
  agentColor: string;
  executions: number;
  tokenConsumption: number;
  averageExecutionTime: number;
  successRate: number;
  outputType: 'code' | 'docs' | 'analysis' | 'tests';
}

export interface Artifact {
  id: string;
  filename: string;
  format: string;
  agentId: string;
  createdAt: string;
  size: number;
  downloads: number;
}

export interface ArtifactStats {
  totalGenerated: number;
  totalDownloaded: number;
  byFormat: Record<string, number>;
  mostGenerated: Artifact[];
  recentArtifacts: Artifact[];
}

export interface CostBreakdown {
  perRequest: number;
  perAgent: Record<string, number>;
  perArtifact: Record<string, number>;
  lowCostHighImpact: string[];
}
