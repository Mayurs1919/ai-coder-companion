import { useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Download,
  TrendingUp,
  Code2,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useSessionUsageStore, QualitySignals } from '@/stores/sessionUsageStore';
import { AgentId } from '@/types/agents';
import { cn } from '@/lib/utils';

interface AgentMetricsPanelProps {
  agentId: AgentId;
}

export function AgentMetricsPanel({ agentId }: AgentMetricsPanelProps) {
  const { sessions, getQualitySignals, initSession } = useSessionUsageStore();
  
  useEffect(() => {
    initSession(agentId);
  }, [agentId, initSession]);

  const metrics = sessions[agentId];
  const quality = getQualitySignals(agentId);

  if (!metrics) {
    return null;
  }

  const getQualityBadge = (signals: QualitySignals) => {
    // High success + low retry + high copy = excellent
    if (signals.successRate >= 90 && signals.retryRate < 10 && signals.copyRate > 50) {
      return { label: 'Excellent', variant: 'default' as const, className: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
    if (signals.successRate >= 75 && signals.retryRate < 20) {
      return { label: 'Good', variant: 'secondary' as const, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
    if (signals.successRate >= 50) {
      return { label: 'Fair', variant: 'outline' as const, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    }
    return { label: 'Needs Improvement', variant: 'destructive' as const, className: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const qualityBadge = getQualityBadge(quality);

  // Get top languages
  const topLanguages = Object.entries(metrics.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Live Metrics
          </CardTitle>
          <Badge variant="outline" className={cn('text-xs', qualityBadge.className)}>
            {qualityBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Request Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              Requests
            </div>
            <p className="text-lg font-semibold">{metrics.requestCount}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Code2 className="w-3 h-3" />
              Tokens
            </div>
            <p className="text-lg font-semibold">{metrics.tokenCount.toLocaleString()}</p>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Response Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3 h-3" />
              Avg Response Time
            </span>
            <span className="font-medium">
              {metrics.avgResponseTime > 0 
                ? `${(metrics.avgResponseTime / 1000).toFixed(1)}s`
                : '--'}
            </span>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Success Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              Success Rate
            </span>
            <span className="font-medium text-green-400">
              {quality.successRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={quality.successRate} className="h-1.5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              {metrics.successCount}
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-400" />
              {metrics.errorCount}
            </span>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Quality Signals */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quality Signals
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                Retry Rate
              </span>
              <span className={cn(
                'font-medium',
                quality.retryRate < 10 ? 'text-green-400' : 
                quality.retryRate < 25 ? 'text-yellow-400' : 'text-red-400'
              )}>
                {quality.retryRate.toFixed(0)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Copy className="w-3 h-3" />
                Copy Rate
              </span>
              <span className={cn(
                'font-medium',
                quality.copyRate > 50 ? 'text-green-400' : 
                quality.copyRate > 25 ? 'text-yellow-400' : 'text-muted-foreground'
              )}>
                {quality.copyRate.toFixed(0)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Download className="w-3 h-3" />
                Download Rate
              </span>
              <span className={cn(
                'font-medium',
                quality.downloadRate > 30 ? 'text-green-400' : 'text-muted-foreground'
              )}>
                {quality.downloadRate.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Maximize2 className="w-3 h-3" />
                Expand Actions
              </span>
              <span className="font-medium">{metrics.expandActions}</span>
            </div>
          </div>
        </div>

        {/* Top Languages */}
        {topLanguages.length > 0 && (
          <>
            <Separator className="bg-border/50" />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Top Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topLanguages.map(([lang, count]) => (
                  <Badge 
                    key={lang} 
                    variant="secondary" 
                    className="text-xs font-mono"
                  >
                    {lang} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Satisfaction Insight */}
        {metrics.requestCount >= 3 && (
          <>
            <Separator className="bg-border/50" />
            <div className="p-2 rounded-md bg-muted/50 border border-border/50">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium mb-1">Session Insight</p>
                  <p className="text-muted-foreground">
                    {quality.retryRate < 10 && quality.successRate > 80
                      ? 'High-quality outputs with minimal retries. Keep going!'
                      : quality.copyRate > 50
                      ? 'Code is being actively used. Output is useful!'
                      : quality.retryRate > 30
                      ? 'Consider refining prompts for better first-time results.'
                      : 'Continue to see patterns emerge.'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
