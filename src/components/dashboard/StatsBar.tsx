import { Activity, Zap, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAgentStore } from '@/stores/agentStore';

export function StatsBar() {
  const agents = useAgentStore((state) => state.agents);

  const stats = [
    {
      label: 'Total Agents',
      value: agents.length,
      icon: Activity,
      color: 'text-primary',
    },
    {
      label: 'Active',
      value: agents.filter((a) => a.status === 'processing').length,
      icon: Zap,
      color: 'text-console-warning',
    },
    {
      label: 'Completed',
      value: agents.filter((a) => a.status === 'success').length,
      icon: CheckCircle2,
      color: 'text-console-success',
    },
    {
      label: 'Idle',
      value: agents.filter((a) => a.status === 'idle').length,
      icon: Clock,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className={cn('w-8 h-8', stat.color)} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
