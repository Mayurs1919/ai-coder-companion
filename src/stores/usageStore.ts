import { create } from 'zustand';
import type { UsageOverview, DailyUsage, AgentUsage, ArtifactStats, CostBreakdown } from '@/types/usage';

interface UsageState {
  overview: UsageOverview;
  dailyUsage: DailyUsage[];
  agentUsage: AgentUsage[];
  artifactStats: ArtifactStats;
  costBreakdown: CostBreakdown;
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

const dailyData = generateDailyUsage();
const totalRequests = dailyData.reduce((sum, d) => sum + d.requests, 0);
const totalTokens = dailyData.reduce((sum, d) => sum + d.tokens, 0);
const totalCost = dailyData.reduce((sum, d) => sum + d.cost, 0);

export const useUsageStore = create<UsageState>(() => ({
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
}));
