import { Activity, Zap, DollarSign, Clock, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsageStore } from '@/stores/usageStore';
import { cn } from '@/lib/utils';

export function GlobalOverview() {
  const { overview } = useUsageStore();

  const stats = [
    {
      label: 'Total Requests',
      value: overview.totalRequests.toLocaleString(),
      icon: Activity,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
    },
    {
      label: 'Total Tokens',
      value: `${(overview.totalTokens / 1000).toFixed(1)}K`,
      icon: Zap,
      colorClass: 'text-console-warning',
      bgClass: 'bg-console-warning/10',
    },
    {
      label: 'Total Cost',
      value: `$${overview.totalCost.toFixed(2)}`,
      icon: DollarSign,
      colorClass: 'text-console-success',
      bgClass: 'bg-console-success/10',
    },
    {
      label: 'Avg Response',
      value: `${overview.averageResponseTime}s`,
      icon: Clock,
      colorClass: 'text-console-info',
      bgClass: 'bg-console-info/10',
    },
    {
      label: 'Coding Streak',
      value: `${overview.codingStreak} days`,
      icon: Flame,
      colorClass: 'text-destructive',
      bgClass: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={cn('p-2 rounded-lg', stat.bgClass)}>
                  <Icon className={cn('w-5 h-5', stat.colorClass)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
