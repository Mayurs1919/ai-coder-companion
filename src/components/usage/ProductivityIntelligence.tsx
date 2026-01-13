import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsageStore } from '@/stores/usageStore';
import { Clock, Zap, RotateCcw, TestTube, GitPullRequest, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ProductivityIntelligence() {
  const { productivityMetrics } = useUsageStore();

  const stats = [
    {
      label: 'Time Saved',
      value: `${productivityMetrics.timeSavedHours}h`,
      icon: Clock,
      description: 'Engineering hours saved this month',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Tasks Automated',
      value: productivityMetrics.tasksAutomated,
      icon: Zap,
      description: 'Repetitive tasks handled by AI',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Reduced Rework',
      value: `${productivityMetrics.reducedRework}%`,
      icon: RotateCcw,
      description: 'Fewer iterations needed',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Test Coverage',
      value: `+${productivityMetrics.testCoverageImprovement}%`,
      icon: TestTube,
      description: 'Coverage improvement',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Reviews Accelerated',
      value: productivityMetrics.codeReviewsAccelerated,
      icon: GitPullRequest,
      description: 'PRs reviewed faster with AI',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
  ];

  // Calculate estimated value (assuming $75/hour for engineering time)
  const estimatedValue = (productivityMetrics.timeSavedHours * 75).toFixed(0);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Productivity Intelligence
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Estimated Value</p>
            <p className="text-lg font-bold text-emerald-500">${estimatedValue}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Trend Chart */}
        <div>
          <p className="text-sm font-medium mb-3">Weekly Time Saved Trend</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityMetrics.weeklyTrend}>
                <defs>
                  <linearGradient id="timeSavedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value} hours`, 'Saved']}
                />
                <Area
                  type="monotone"
                  dataKey="hoursSaved"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#timeSavedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI Summary */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm">
            <span className="font-semibold text-primary">AI Impact Summary:</span>{' '}
            <span className="text-muted-foreground">
              This month, AI agents saved approximately{' '}
              <span className="font-medium text-foreground">{productivityMetrics.timeSavedHours} engineering hours</span>,
              automated{' '}
              <span className="font-medium text-foreground">{productivityMetrics.tasksAutomated} tasks</span>,
              and accelerated{' '}
              <span className="font-medium text-foreground">{productivityMetrics.codeReviewsAccelerated} code reviews</span>.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
