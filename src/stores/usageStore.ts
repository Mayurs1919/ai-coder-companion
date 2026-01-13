import { create } from 'zustand';
import type { 
  UsageOverview, 
  DailyUsage, 
  AgentUsage, 
  ArtifactStats, 
  CostBreakdown,
  ProductivityMetrics,
  PromptMetrics,
  GovernanceState
} from '@/types/usage';

interface UsageState {
  overview: UsageOverview;
  dailyUsage: DailyUsage[];
  agentUsage: AgentUsage[];
  artifactStats: ArtifactStats;
  costBreakdown: CostBreakdown;
  // Phase 2
  productivityMetrics: ProductivityMetrics;
  promptMetrics: PromptMetrics;
  governance: GovernanceState;
  // Actions
  updateGovernanceConfig: (config: Partial<GovernanceState['config']>) => void;
  acknowledgeAlert: (alertId: string) => void;
}

// Generate mock daily data for the last 14 days
const generateDailyUsage = (): DailyUsage[] => {
  const data: DailyUsage[] = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      requests: Math.floor(Math.random() * 40) + 10,
      tokens: Math.floor(Math.random() * 50000) + 10000,
      cost: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
    });
  }
  
  return data;
};

const mockAgentUsage: AgentUsage[] = [
  {
    agentId: 'code-writer',
    agentName: 'Code Writer',
    agentColor: 'agent-code-writer',
    executions: 156,
    tokenConsumption: 245000,
    averageExecutionTime: 3.2,
    successRate: 96,
    outputType: 'code',
  },
  {
    agentId: 'refactor',
    agentName: 'Code Refactor',
    agentColor: 'agent-refactor',
    executions: 89,
    tokenConsumption: 178000,
    averageExecutionTime: 4.1,
    successRate: 94,
    outputType: 'code',
  },
  {
    agentId: 'debug',
    agentName: 'Bug Finder',
    agentColor: 'agent-debug',
    executions: 67,
    tokenConsumption: 134000,
    averageExecutionTime: 2.8,
    successRate: 91,
    outputType: 'analysis',
  },
  {
    agentId: 'test-gen',
    agentName: 'Test Generator',
    agentColor: 'agent-test-gen',
    executions: 45,
    tokenConsumption: 89000,
    averageExecutionTime: 3.5,
    successRate: 98,
    outputType: 'tests',
  },
  {
    agentId: 'docs',
    agentName: 'Documentation',
    agentColor: 'agent-docs',
    executions: 34,
    tokenConsumption: 67000,
    averageExecutionTime: 2.1,
    successRate: 99,
    outputType: 'docs',
  },
  {
    agentId: 'architecture',
    agentName: 'Architecture',
    agentColor: 'agent-architecture',
    executions: 28,
    tokenConsumption: 56000,
    averageExecutionTime: 5.2,
    successRate: 93,
    outputType: 'analysis',
  },
  {
    agentId: 'api',
    agentName: 'API Structure',
    agentColor: 'agent-api',
    executions: 22,
    tokenConsumption: 44000,
    averageExecutionTime: 2.9,
    successRate: 95,
    outputType: 'code',
  },
  {
    agentId: 'reviewer',
    agentName: 'PR Reviewer',
    agentColor: 'agent-reviewer',
    executions: 19,
    tokenConsumption: 38000,
    averageExecutionTime: 4.5,
    successRate: 97,
    outputType: 'analysis',
  },
];

const mockArtifactStats: ArtifactStats = {
  totalGenerated: 342,
  totalDownloaded: 187,
  byFormat: {
    ts: 98,
    tsx: 76,
    py: 45,
    java: 32,
    md: 28,
    yaml: 21,
    json: 18,
    sql: 14,
    other: 10,
  },
  mostGenerated: [
    { id: '1', filename: 'UserService.ts', format: 'ts', agentId: 'code-writer', createdAt: '2025-01-12', size: 4200, downloads: 12 },
    { id: '2', filename: 'AuthMiddleware.ts', format: 'ts', agentId: 'code-writer', createdAt: '2025-01-11', size: 2800, downloads: 8 },
    { id: '3', filename: 'README.md', format: 'md', agentId: 'docs', createdAt: '2025-01-10', size: 5600, downloads: 15 },
    { id: '4', filename: 'api.test.ts', format: 'ts', agentId: 'test-gen', createdAt: '2025-01-09', size: 3400, downloads: 6 },
    { id: '5', filename: 'database.sql', format: 'sql', agentId: 'architecture', createdAt: '2025-01-08', size: 1800, downloads: 4 },
  ],
  recentArtifacts: [
    { id: '6', filename: 'PaymentProcessor.ts', format: 'ts', agentId: 'code-writer', createdAt: '2025-01-13', size: 3200, downloads: 2 },
    { id: '7', filename: 'config.yaml', format: 'yaml', agentId: 'architecture', createdAt: '2025-01-13', size: 890, downloads: 1 },
    { id: '8', filename: 'utils.ts', format: 'ts', agentId: 'refactor', createdAt: '2025-01-12', size: 1560, downloads: 3 },
  ],
};

const mockCostBreakdown: CostBreakdown = {
  perRequest: 0.042,
  perAgent: {
    'code-writer': 8.45,
    refactor: 6.12,
    debug: 4.23,
    'test-gen': 3.15,
    docs: 2.34,
    architecture: 2.01,
    api: 1.56,
    reviewer: 1.32,
  },
  perArtifact: {
    ts: 0.08,
    tsx: 0.09,
    py: 0.07,
    java: 0.10,
    md: 0.04,
    yaml: 0.03,
    json: 0.02,
    sql: 0.05,
  },
  lowCostHighImpact: ['docs', 'api', 'reviewer'],
};

// Phase 2 Mock Data
const mockProductivityMetrics: ProductivityMetrics = {
  timeSavedHours: 47.2,
  tasksAutomated: 234,
  reducedRework: 18,
  testCoverageImprovement: 23,
  codeReviewsAccelerated: 42,
  weeklyTrend: [
    { week: 'Week 1', hoursSaved: 8.5 },
    { week: 'Week 2', hoursSaved: 12.3 },
    { week: 'Week 3', hoursSaved: 11.8 },
    { week: 'Week 4', hoursSaved: 14.6 },
  ],
};

const mockPromptMetrics: PromptMetrics = {
  totalPrompts: 460,
  successRate: 94.2,
  retryFrequency: 8.3,
  averageVerbosity: 156,
  qualityScore: 87,
  insights: [
    {
      id: '1',
      type: 'improvement',
      message: 'Shorter prompts (under 100 tokens) yielded 23% faster responses for Code Writer agent.',
      impact: 'high',
    },
    {
      id: '2',
      type: 'success',
      message: 'Your prompts for Test Generator have a 98% success rate - well above average!',
      impact: 'medium',
    },
    {
      id: '3',
      type: 'warning',
      message: 'Bug Finder retries are 15% higher than baseline. Consider adding more context to prompts.',
      impact: 'high',
    },
    {
      id: '4',
      type: 'improvement',
      message: 'Including file paths in Architecture prompts improved accuracy by 31%.',
      impact: 'medium',
    },
  ],
  agentEfficiency: [
    { agentId: 'code-writer', agentName: 'Code Writer', successRate: 96, avgTokens: 1570 },
    { agentId: 'test-gen', agentName: 'Test Generator', successRate: 98, avgTokens: 1980 },
    { agentId: 'docs', agentName: 'Documentation', successRate: 99, avgTokens: 1970 },
    { agentId: 'refactor', agentName: 'Code Refactor', successRate: 94, avgTokens: 2000 },
    { agentId: 'debug', agentName: 'Bug Finder', successRate: 91, avgTokens: 2000 },
    { agentId: 'reviewer', agentName: 'PR Reviewer', successRate: 97, avgTokens: 2000 },
  ],
};

const mockGovernance: GovernanceState = {
  config: {
    dailyLimit: 100,
    monthlyLimit: 2000,
    costThreshold: 50,
    enabledAgents: ['code-writer', 'refactor', 'debug', 'test-gen', 'docs', 'architecture', 'api', 'reviewer'],
    alertsEnabled: true,
  },
  currentUsage: {
    daily: 34,
    monthly: 460,
    cost: 29.18,
  },
  alerts: [
    {
      id: '1',
      type: 'limit_warning',
      message: 'Daily usage at 34% of limit',
      severity: 'info',
      timestamp: '2025-01-13T10:30:00Z',
      acknowledged: true,
    },
    {
      id: '2',
      type: 'cost_threshold',
      message: 'Monthly cost approaching 60% of threshold',
      severity: 'warning',
      timestamp: '2025-01-13T09:15:00Z',
      acknowledged: false,
    },
  ],
  auditTrail: [
    { id: '1', userId: 'u1', userName: 'Alex Chen', agentId: 'code-writer', agentName: 'Code Writer', action: 'Generate API endpoint', tokens: 2340, cost: 0.047, status: 'success', timestamp: '2025-01-13T11:45:00Z' },
    { id: '2', userId: 'u2', userName: 'Sam Rivera', agentId: 'test-gen', agentName: 'Test Generator', action: 'Create unit tests', tokens: 1890, cost: 0.038, status: 'success', timestamp: '2025-01-13T11:32:00Z' },
    { id: '3', userId: 'u1', userName: 'Alex Chen', agentId: 'debug', agentName: 'Bug Finder', action: 'Analyze memory leak', tokens: 3120, cost: 0.062, status: 'success', timestamp: '2025-01-13T11:20:00Z' },
    { id: '4', userId: 'u3', userName: 'Jordan Lee', agentId: 'refactor', agentName: 'Code Refactor', action: 'Optimize database queries', tokens: 2780, cost: 0.056, status: 'failed', timestamp: '2025-01-13T11:05:00Z' },
    { id: '5', userId: 'u2', userName: 'Sam Rivera', agentId: 'docs', agentName: 'Documentation', action: 'Generate API docs', tokens: 1560, cost: 0.031, status: 'success', timestamp: '2025-01-13T10:48:00Z' },
    { id: '6', userId: 'u1', userName: 'Alex Chen', agentId: 'reviewer', agentName: 'PR Reviewer', action: 'Review authentication PR', tokens: 4200, cost: 0.084, status: 'success', timestamp: '2025-01-13T10:30:00Z' },
  ],
};

const dailyData = generateDailyUsage();
const totalRequests = dailyData.reduce((sum, d) => sum + d.requests, 0);
const totalTokens = dailyData.reduce((sum, d) => sum + d.tokens, 0);
const totalCost = dailyData.reduce((sum, d) => sum + d.cost, 0);

export const useUsageStore = create<UsageState>((set) => ({
  overview: {
    totalRequests,
    totalTokens,
    totalCost: parseFloat(totalCost.toFixed(2)),
    averageResponseTime: 3.4,
    codingStreak: 7,
  },
  dailyUsage: dailyData,
  agentUsage: mockAgentUsage,
  artifactStats: mockArtifactStats,
  costBreakdown: mockCostBreakdown,
  productivityMetrics: mockProductivityMetrics,
  promptMetrics: mockPromptMetrics,
  governance: mockGovernance,
  
  updateGovernanceConfig: (config) =>
    set((state) => ({
      governance: {
        ...state.governance,
        config: { ...state.governance.config, ...config },
      },
    })),
    
  acknowledgeAlert: (alertId) =>
    set((state) => ({
      governance: {
        ...state.governance,
        alerts: state.governance.alerts.map((alert) =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ),
      },
    })),
}));
