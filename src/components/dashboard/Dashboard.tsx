import { AGENTS, Agent, AgentStatus } from '@/types/agents';
import { useAgentStore } from '@/stores/agentStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Code2,
  Wand2,
  Bug,
  GitPullRequest,
  FileText,
  Webhook,
  Boxes,
  FileUser,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, Wand2, Bug, GitPullRequest, FileText, Webhook, Boxes, FileUser,
  ClipboardList: FileText,
};

const statusConfig: Record<AgentStatus, { label: string; dotClass: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  idle: { label: 'Idle', dotClass: 'bg-muted-foreground', badgeVariant: 'secondary' },
  processing: { label: 'Active', dotClass: 'bg-console-warning status-pulse', badgeVariant: 'default' },
  success: { label: 'Complete', dotClass: 'bg-console-success', badgeVariant: 'outline' },
  error: { label: 'Error', dotClass: 'bg-console-error', badgeVariant: 'destructive' },
};

export function Dashboard() {
  const agents = useAgentStore((state) => state.agents);

  const totalAgents = agents.length;
  const activeCount = agents.filter((a) => a.status === 'processing').length;
  const completedCount = agents.filter((a) => a.status === 'success').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;
  const errorCount = agents.filter((a) => a.status === 'error').length;

  const stats = [
    { label: 'Total Agents', value: totalAgents, icon: Layers, color: 'text-primary' },
    { label: 'Active', value: activeCount, icon: Zap, color: 'text-console-warning' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-console-success' },
    { label: 'Errors', value: errorCount, icon: AlertTriangle, color: 'text-console-error' },
    { label: 'Idle', value: idleCount, icon: Clock, color: 'text-muted-foreground' },
  ];

  const healthPercent = totalAgents > 0 ? Math.round(((completedCount + idleCount) / totalAgents) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time status and health of all registered AI agents
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* System Health */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">System Health</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{healthPercent}%</span>
          </div>
          <Progress value={healthPercent} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card/50 border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={cn('w-5 h-5 flex-shrink-0', stat.color)} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agent Table */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Registered Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">Agent</th>
                  <th className="text-left font-medium px-4 py-3">Description</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const Icon = iconMap[agent.icon] || Code2;
                  const status = statusConfig[agent.status];
                  return (
                    <tr key={agent.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-md flex items-center justify-center bg-muted/50')}>
                            <Icon className="w-4 h-4 text-foreground" />
                          </div>
                          <span className="font-medium">{agent.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {agent.description}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', status.dotClass)} />
                          <Badge variant={status.badgeVariant} className="text-xs font-normal">
                            {status.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                        {agent.lastActivity
                          ? new Date(agent.lastActivity).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
