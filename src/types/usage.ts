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

// Phase 2 Types
export interface ProductivityMetrics {
  timeSavedHours: number;
  tasksAutomated: number;
  reducedRework: number;
  testCoverageImprovement: number;
  codeReviewsAccelerated: number;
  weeklyTrend: { week: string; hoursSaved: number }[];
}

export interface PromptMetrics {
  totalPrompts: number;
  successRate: number;
  retryFrequency: number;
  averageVerbosity: number;
  qualityScore: number;
  insights: PromptInsight[];
  agentEfficiency: { agentId: string; agentName: string; successRate: number; avgTokens: number }[];
}

export interface PromptInsight {
  id: string;
  type: 'improvement' | 'warning' | 'success';
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export interface GovernanceConfig {
  dailyLimit: number;
  monthlyLimit: number;
  costThreshold: number;
  enabledAgents: string[];
  alertsEnabled: boolean;
}

export interface UsageAlert {
  id: string;
  type: 'limit_warning' | 'cost_threshold' | 'anomaly';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  agentId: string;
  agentName: string;
  action: string;
  tokens: number;
  cost: number;
  status: 'success' | 'failed';
  timestamp: string;
}

// PR Review Analytics (integrated with usage tracking)
export interface PRReviewUsageMetrics {
  totalReviews: number;
  avgIssuesPerPR: number;
  securityIssuesFound: number;
  repeatedViolations: Record<string, number>;
  improvementRate: number;
  avgQualityScore: number;
  blockerRate: number;
  reviewsByMode: Record<string, number>;
}

export interface GovernanceState {
  config: GovernanceConfig;
  currentUsage: { daily: number; monthly: number; cost: number };
  alerts: UsageAlert[];
  auditTrail: AuditEntry[];
  prReviewMetrics?: PRReviewUsageMetrics;
}
