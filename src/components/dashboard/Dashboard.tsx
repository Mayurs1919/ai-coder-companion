import { useState } from 'react';
import { AGENTS, Agent, AgentStatus } from '@/types/agents';
import { useAgentStore } from '@/stores/agentStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConsoleStore } from '@/stores/consoleStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
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
  Cpu,
  Layers,
  Terminal,
  ChevronDown,
  ChevronUp,
  Filter,
  Trash2,
  TrendingUp,
  BarChart3,
  Timer,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, Wand2, Bug, GitPullRequest, FileText, Webhook, Boxes, FileUser,
  ClipboardList: FileText,
};

const statusConfig: Record<AgentStatus, { label: string; dotClass: string; badgeClass: string }> = {
  idle: { label: 'Idle', dotClass: 'bg-muted-foreground', badgeClass: 'bg-muted/50 text-muted-foreground' },
  processing: { label: 'Active', dotClass: 'bg-console-warning status-pulse', badgeClass: 'bg-console-warning/15 text-console-warning' },
  success: { label: 'Complete', dotClass: 'bg-console-success', badgeClass: 'bg-console-success/15 text-console-success' },
  error: { label: 'Error', dotClass: 'bg-console-error', badgeClass: 'bg-console-error/15 text-console-error' },
};

type StatusFilter = 'all' | AgentStatus;

export function Dashboard() {
  const agents = useAgentStore((state) => state.agents);
  const { logs, clearLogs } = useConsoleStore();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');

  const totalAgents = agents.length;
  const activeCount = agents.filter((a) => a.status === 'processing').length;
  const completedCount = agents.filter((a) => a.status === 'success').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;
  const errorCount = agents.filter((a) => a.status === 'error').length;
  const healthPercent = totalAgents > 0 ? Math.round(((completedCount + idleCount) / totalAgents) * 100) : 100;

  const filteredAgents = statusFilter === 'all'
    ? agents
    : agents.filter((a) => a.status === statusFilter);

  const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.type === logFilter);

  const kpis = [
    { label: 'Total', value: totalAgents, icon: Layers, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active', value: activeCount, icon: Zap, color: 'text-console-warning', bg: 'bg-console-warning/10' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-console-success', bg: 'bg-console-success/10' },
    { label: 'Errors', value: errorCount, icon: AlertTriangle, color: 'text-console-error', bg: 'bg-console-error/10' },
  ];

  const filterOptions: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'processing' },
    { label: 'Completed', value: 'success' },
    { label: 'Idle', value: 'idle' },
    { label: 'Error', value: 'error' },
  ];

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-console-success';
      case 'error': return 'text-console-error';
      case 'warning': return 'text-console-warning';
      default: return 'text-console-info';
    }
  };

  const getLogPrefix = (type: string) => {
    switch (type) {
      case 'success': return '[OK]';
      case 'error': return '[ERR]';
      case 'warning': return '[WARN]';
      default: return '[INFO]';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Agent Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time monitoring across all registered AI subsystems
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* System Health + KPIs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Health Card */}
        <Card className="lg:col-span-1 bg-card/60 border-border">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">System Health</span>
            </div>
            <div className="text-3xl font-bold font-mono text-primary">{healthPercent}%</div>
            <Progress value={healthPercent} className="h-1 mt-3" />
          </CardContent>
        </Card>

        {/* KPI Cards */}
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-card/60 border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', kpi.bg)}>
                  <Icon className={cn('w-4 h-4', kpi.color)} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold font-mono leading-none mt-0.5">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex gap-1">
          {filterOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'h-7 text-xs px-3',
                statusFilter === opt.value && 'font-medium'
              )}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground ml-auto font-mono">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredAgents.map((agent, index) => {
          const Icon = iconMap[agent.icon] || Code2;
          const status = statusConfig[agent.status];
          return (
            <Card
              key={agent.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:border-primary/40 group bg-card/60',
                'hover:shadow-lg hover:shadow-primary/5'
              )}
              style={{ animationDelay: `${index * 40}ms` }}
              onClick={() => navigate(`/agent/${agent.id}`)}
            >
              <CardContent className="p-4">
                {/* Top Row: Icon + Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn('w-1.5 h-1.5 rounded-full', status.dotClass)} />
                    <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded', status.badgeClass)}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Name + Description */}
                <h3 className="text-sm font-semibold mb-1">{agent.name}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {agent.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground/70 font-mono">
                    {agent.lastActivity
                      ? new Date(agent.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'No activity'}
                  </span>
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-border/50 text-muted-foreground">
                    AI
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Console Output - Collapsible */}
      <Card className="bg-card/60 border-border overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
          onClick={() => setConsoleOpen(!consoleOpen)}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Console Output</span>
            <span className="text-[10px] text-muted-foreground font-mono">({logs.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {!consoleOpen && logs.length > 0 && (
              <span className="text-[10px] text-muted-foreground font-mono">
                Latest: {logs[logs.length - 1]?.message.slice(0, 40)}...
              </span>
            )}
            {consoleOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {consoleOpen && (
          <div className="border-t border-border">
            {/* Console toolbar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50 bg-muted/20">
              {(['all', 'info', 'success', 'warning', 'error'] as const).map((f) => (
                <Button
                  key={f}
                  variant={logFilter === f ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setLogFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={clearLogs}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Console logs */}
            <ScrollArea className="h-48 px-4 py-2 bg-console-bg">
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs font-mono">
                  No output entries
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex gap-2 font-mono text-[11px] leading-relaxed">
                      <span className="text-muted-foreground/60 shrink-0">
                        {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className={cn('shrink-0 font-semibold', getLogColor(log.type))}>
                        {getLogPrefix(log.type)}
                      </span>
                      {log.agentId && (
                        <span className="text-primary/70 shrink-0">[{log.agentId}]</span>
                      )}
                      <span className="text-foreground/80">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </Card>
    </div>
  );
}
