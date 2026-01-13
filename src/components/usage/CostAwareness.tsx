import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUsageStore } from '@/stores/usageStore';
import { TrendingUp, Sparkles, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function CostAwareness() {
  const { costBreakdown, agentUsage } = useUsageStore();

  const agentCostData = Object.entries(costBreakdown.perAgent)
    .map(([agentId, cost]) => {
      const agent = agentUsage.find((a) => a.agentId === agentId);
      return {
        name: agent?.agentName || agentId,
        cost,
        executions: agent?.executions || 0,
        efficiency: agent ? (agent.executions / cost).toFixed(1) : '0',
      };
    })
    .sort((a, b) => b.cost - a.cost);

  const lowCostAgents = costBreakdown.lowCostHighImpact.map((id) => {
    const agent = agentUsage.find((a) => a.agentId === id);
    return {
      id,
      name: agent?.agentName || id,
      successRate: agent?.successRate || 0,
      cost: costBreakdown.perAgent[id] || 0,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cost per Agent Chart */}
      <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cost by Agent
          </CardTitle>
          <p className="text-sm text-muted-foreground">Value-focused spending breakdown</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentCostData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  type="number"
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'cost') return [`$${value.toFixed(2)}`, 'Cost'];
                    return [value, name];
                  }}
                />
                <Bar
                  dataKey="cost"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Value Metrics */}
          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-console-success" />
              <span className="text-sm font-medium">Value Delivered</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Average cost per request: <span className="font-semibold text-foreground">${costBreakdown.perRequest.toFixed(3)}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Each dollar spent generates approximately <span className="font-semibold text-foreground">{Math.round(1 / costBreakdown.perRequest)} requests</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Low-Cost High-Impact */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-console-warning" />
            Best Value Agents
          </CardTitle>
          <p className="text-sm text-muted-foreground">Low cost, high impact</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {lowCostAgents.map((agent, index) => (
            <div
              key={agent.id}
              className="p-4 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{agent.name}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    index === 0 && 'border-console-warning text-console-warning'
                  )}
                >
                  #{index + 1}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Cost</span>
                  <p className="font-semibold text-console-success">${agent.cost.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Success Rate</span>
                  <p className="font-semibold">{agent.successRate}%</p>
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> These agents deliver exceptional results at minimal cost. 
              Consider using them more for routine tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
