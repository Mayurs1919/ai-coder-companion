import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsageStore } from '@/stores/usageStore';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  MessageSquare,
  Repeat,
  FileText,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PromptOptimization() {
  const { promptMetrics } = useUsageStore();

  const overviewStats = [
    {
      label: 'Total Prompts',
      value: promptMetrics.totalPrompts,
      icon: MessageSquare,
    },
    {
      label: 'Success Rate',
      value: `${promptMetrics.successRate}%`,
      icon: CheckCircle2,
    },
    {
      label: 'Retry Rate',
      value: `${promptMetrics.retryFrequency}%`,
      icon: Repeat,
    },
    {
      label: 'Avg. Verbosity',
      value: `${promptMetrics.averageVerbosity} tokens`,
      icon: FileText,
    },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-500/10 text-red-500 border-red-500/20',
      medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Prompt Optimization
          </CardTitle>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-medium">{promptMetrics.qualityScore}/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-3">
          {overviewStats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <stat.icon className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Agent Efficiency */}
        <div>
          <p className="text-sm font-medium mb-3">Agent Prompt Efficiency</p>
          <div className="space-y-2">
            {promptMetrics.agentEfficiency.map((agent) => (
              <div
                key={agent.agentId}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/20"
              >
                <div className="w-24 text-sm font-medium truncate">
                  {agent.agentName}
                </div>
                <div className="flex-1">
                  <Progress value={agent.successRate} className="h-2" />
                </div>
                <div className="w-12 text-right text-sm font-medium">
                  {agent.successRate}%
                </div>
                <div className="w-20 text-right text-xs text-muted-foreground">
                  ~{agent.avgTokens} tokens
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Optimization Insights</p>
          </div>
          <div className="space-y-2">
            {promptMetrics.insights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  insight.type === 'success' && 'bg-emerald-500/5 border-emerald-500/20',
                  insight.type === 'improvement' && 'bg-amber-500/5 border-amber-500/20',
                  insight.type === 'warning' && 'bg-orange-500/5 border-orange-500/20'
                )}
              >
                <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{insight.message}</p>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full border shrink-0',
                    getImpactBadge(insight.impact)
                  )}
                >
                  {insight.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
