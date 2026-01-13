import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUsageStore } from '@/stores/usageStore';
import { cn } from '@/lib/utils';
import {
  Code2,
  Wand2,
  Bug,
  FlaskConical,
  GitPullRequest,
  FileText,
  Network,
  Webhook,
  Boxes,
  BookOpen,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'code-writer': Code2,
  refactor: Wand2,
  debug: Bug,
  'test-gen': FlaskConical,
  docs: BookOpen,
  architecture: Boxes,
  api: Webhook,
  reviewer: GitPullRequest,
};

const outputTypeColors: Record<string, string> = {
  code: 'bg-primary/20 text-primary',
  docs: 'bg-console-info/20 text-console-info',
  analysis: 'bg-console-warning/20 text-console-warning',
  tests: 'bg-console-success/20 text-console-success',
};

export function AgentAnalytics() {
  const { agentUsage } = useUsageStore();

  const sortedAgents = [...agentUsage].sort((a, b) => b.executions - a.executions);
  const maxExecutions = sortedAgents[0]?.executions || 1;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Agent Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Usage and success metrics by agent</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedAgents.map((agent) => {
          const Icon = iconMap[agent.agentId] || Code2;
          const executionPercent = (agent.executions / maxExecutions) * 100;

          return (
            <div
              key={agent.agentId}
              className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg bg-muted')}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{agent.agentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.executions} executions
                    </p>
                  </div>
                </div>
                <Badge className={cn('text-xs', outputTypeColors[agent.outputType])}>
                  {agent.outputType}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">{executionPercent.toFixed(0)}%</span>
                </div>
                <Progress value={executionPercent} className="h-1.5" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-lg font-semibold">{(agent.tokenConsumption / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Tokens</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{agent.averageExecutionTime}s</p>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                </div>
                <div className="text-center">
                  <p className={cn(
                    'text-lg font-semibold',
                    agent.successRate >= 95 ? 'text-console-success' : 
                    agent.successRate >= 90 ? 'text-console-warning' : 'text-destructive'
                  )}>
                    {agent.successRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Success</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
